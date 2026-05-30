from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.agent import Workflow, WorkflowRun

router = APIRouter()


# Schemas
class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_type: str
    trigger_config: dict = {}
    steps: List[dict] = []


class WorkflowResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    trigger_type: str
    is_active: bool
    total_runs: int
    successful_runs: int
    last_run_at: Optional[datetime]
    created_at: datetime
    
    model_config = {"from_attributes": True}


class WorkflowList(BaseModel):
    items: List[WorkflowResponse]
    total: int
    page: int
    limit: int


class WorkflowRunResponse(BaseModel):
    id: UUID
    workflow_id: UUID
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    execution_time_ms: Optional[int]
    error_message: Optional[str]
    created_at: datetime
    
    model_config = {"from_attributes": True}


# Routes
@router.get("/", response_model=WorkflowList)
async def list_workflows(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List workflows"""
    query = select(Workflow).where(Workflow.org_id == current_user.org_id)
    
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    query = query.order_by(Workflow.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return WorkflowList(
        items=[WorkflowResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        limit=limit
    )


@router.post("/", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    workflow_data: WorkflowCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create workflow"""
    workflow = Workflow(
        org_id=current_user.org_id,
        **workflow_data.model_dump()
    )
    db.add(workflow)
    await db.commit()
    await db.refresh(workflow)
    return WorkflowResponse.model_validate(workflow)


@router.post("/{workflow_id}/run", response_model=WorkflowRunResponse, status_code=status.HTTP_201_CREATED)
async def run_workflow(
    workflow_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Trigger a workflow run"""
    result = await db.execute(
        select(Workflow).where(
            Workflow.id == workflow_id,
            Workflow.org_id == current_user.org_id
        )
    )
    workflow = result.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    run = WorkflowRun(
        workflow_id=workflow_id,
        triggered_by=current_user.id,
        status="pending",
        started_at=datetime.utcnow()
    )
    db.add(run)
    
    workflow.total_runs += 1
    workflow.last_run_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(run)
    
    # In production, this would trigger async execution via Celery
    return WorkflowRunResponse.model_validate(run)


@router.get("/{workflow_id}/runs", response_model=List[WorkflowRunResponse])
async def list_workflow_runs(
    workflow_id: UUID,
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List runs for a workflow"""
    result = await db.execute(
        select(WorkflowRun)
        .where(WorkflowRun.workflow_id == workflow_id)
        .order_by(WorkflowRun.created_at.desc())
        .limit(limit)
    )
    runs = result.scalars().all()
    return [WorkflowRunResponse.model_validate(run) for run in runs]


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    trigger_type: Optional[str] = None
    trigger_config: Optional[dict] = None
    steps: Optional[List[dict]] = None
    is_active: Optional[bool] = None


@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get workflow by ID"""
    result = await db.execute(
        select(Workflow).where(
            Workflow.id == workflow_id,
            Workflow.org_id == current_user.org_id
        )
    )
    workflow = result.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return WorkflowResponse.model_validate(workflow)


@router.patch("/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(
    workflow_id: UUID,
    workflow_data: WorkflowUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update workflow"""
    result = await db.execute(
        select(Workflow).where(
            Workflow.id == workflow_id,
            Workflow.org_id == current_user.org_id
        )
    )
    workflow = result.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    update_data = workflow_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(workflow, field, value)
    
    await db.commit()
    await db.refresh(workflow)
    return WorkflowResponse.model_validate(workflow)


@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(
    workflow_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete workflow"""
    result = await db.execute(
        select(Workflow).where(
            Workflow.id == workflow_id,
            Workflow.org_id == current_user.org_id
        )
    )
    workflow = result.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    from app.models.agent import Workflow
    await db.execute(delete(Workflow).where(Workflow.id == workflow_id))
    await db.commit()
