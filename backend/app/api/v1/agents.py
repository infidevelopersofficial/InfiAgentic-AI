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
from app.models.agent import AIAgent, AgentPrompt

router = APIRouter()


# Schemas
class AgentCreate(BaseModel):
    name: str
    agent_type: str
    description: Optional[str] = None
    model: str = "gpt-4"
    system_prompt: Optional[str] = None
    temperature: float = 0.7
    max_tokens: int = 4000
    tools: List[str] = []
    capabilities: List[str] = []


class AgentResponse(BaseModel):
    id: UUID
    name: str
    agent_type: str
    description: Optional[str]
    model: str
    is_active: bool
    total_runs: int
    successful_runs: int
    avg_response_time: Optional[float]
    created_at: datetime
    
    model_config = {"from_attributes": True}


class AgentList(BaseModel):
    items: List[AgentResponse]
    total: int
    page: int
    limit: int


class AgentPromptCreate(BaseModel):
    name: str
    prompt_type: str
    content: str
    variables: List[str] = []


class AgentPromptResponse(BaseModel):
    id: UUID
    agent_id: UUID
    name: str
    prompt_type: str
    content: str
    variables: List[str]
    is_active: bool
    version: int
    created_at: datetime
    
    model_config = {"from_attributes": True}


class AgentRunRequest(BaseModel):
    input_text: str
    context: dict = {}


class AgentRunResponse(BaseModel):
    output: str
    tokens_used: int
    execution_time_ms: int


# Routes
@router.get("/", response_model=AgentList)
async def list_agents(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    agent_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List AI agents"""
    query = select(AIAgent).where(AIAgent.org_id == current_user.org_id)
    
    if agent_type:
        query = query.where(AIAgent.agent_type == agent_type)
    
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    query = query.order_by(AIAgent.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return AgentList(
        items=[AgentResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        limit=limit
    )


@router.post("/", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def create_agent(
    agent_data: AgentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create AI agent"""
    agent = AIAgent(
        org_id=current_user.org_id,
        **agent_data.model_dump()
    )
    db.add(agent)
    await db.commit()
    await db.refresh(agent)
    return AgentResponse.model_validate(agent)


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get agent by ID"""
    result = await db.execute(
        select(AIAgent).where(
            AIAgent.id == agent_id,
            AIAgent.org_id == current_user.org_id
        )
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return AgentResponse.model_validate(agent)


@router.post("/{agent_id}/prompts", response_model=AgentPromptResponse, status_code=status.HTTP_201_CREATED)
async def create_agent_prompt(
    agent_id: UUID,
    prompt_data: AgentPromptCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add prompt to agent"""
    result = await db.execute(
        select(AIAgent).where(
            AIAgent.id == agent_id,
            AIAgent.org_id == current_user.org_id
        )
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    prompt = AgentPrompt(
        agent_id=agent_id,
        **prompt_data.model_dump()
    )
    db.add(prompt)
    await db.commit()
    await db.refresh(prompt)
    return AgentPromptResponse.model_validate(prompt)


@router.post("/{agent_id}/run", response_model=AgentRunResponse)
async def run_agent(
    agent_id: UUID,
    run_request: AgentRunRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Execute an agent with input"""
    result = await db.execute(
        select(AIAgent).where(
            AIAgent.id == agent_id,
            AIAgent.org_id == current_user.org_id
        )
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # In production, this would call the actual AI service
    # For now, return a mock response
    import time
    start_time = time.time()
    
    # Mock AI execution
    output = f"AI Agent '{agent.name}' processed: {run_request.input_text[:100]}..."
    
    execution_time = int((time.time() - start_time) * 1000)
    
    # Update agent stats
    agent.total_runs += 1
    agent.successful_runs += 1
    await db.commit()
    
    return AgentRunResponse(
        output=output,
        tokens_used=len(run_request.input_text.split()),
        execution_time_ms=execution_time
    )


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    model: Optional[str] = None
    system_prompt: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    tools: Optional[List[str]] = None
    capabilities: Optional[List[str]] = None
    is_active: Optional[bool] = None
    status: Optional[str] = None


@router.patch("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: UUID,
    agent_data: AgentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update agent"""
    result = await db.execute(
        select(AIAgent).where(
            AIAgent.id == agent_id,
            AIAgent.org_id == current_user.org_id
        )
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    update_data = agent_data.model_dump(exclude_unset=True)
    # Handle status separately if provided
    if 'status' in update_data:
        # Map status to is_active if needed
        if update_data['status'] == 'running':
            update_data['is_active'] = True
        elif update_data['status'] == 'idle':
            update_data['is_active'] = False
        del update_data['status']
    
    for field, value in update_data.items():
        setattr(agent, field, value)
    
    await db.commit()
    await db.refresh(agent)
    return AgentResponse.model_validate(agent)


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete agent"""
    result = await db.execute(
        select(AIAgent).where(
            AIAgent.id == agent_id,
            AIAgent.org_id == current_user.org_id
        )
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    from app.models.agent import AIAgent
    await db.execute(delete(AIAgent).where(AIAgent.id == agent_id))
    await db.commit()
