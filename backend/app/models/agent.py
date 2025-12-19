from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Integer, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base, GUID


class AIAgent(Base):
    __tablename__ = "ai_agents"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    org_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    agent_type = Column(String(50), nullable=False)  # content_writer, social_manager, email_marketer, sales_agent, orchestrator
    description = Column(Text)
    model = Column(String(50), default="gpt-4")
    system_prompt = Column(Text)
    temperature = Column(Float, default=0.7)
    max_tokens = Column(Integer, default=4000)
    tools = Column(JSON, default=[])  # Available tools for this agent
    capabilities = Column(JSON, default=[])
    is_active = Column(Boolean, default=True)
    total_runs = Column(Integer, default=0)
    successful_runs = Column(Integer, default=0)
    avg_response_time = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    prompts = relationship("AgentPrompt", back_populates="agent")


class AgentPrompt(Base):
    __tablename__ = "agent_prompts"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    agent_id = Column(GUID(), ForeignKey("ai_agents.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    prompt_type = Column(String(50), nullable=False)  # system, user, few_shot
    content = Column(Text, nullable=False)
    variables = Column(JSON, default=[])
    is_active = Column(Boolean, default=True)
    version = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    agent = relationship("AIAgent", back_populates="prompts")


class Workflow(Base):
    __tablename__ = "workflows"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    org_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    trigger_type = Column(String(50), nullable=False)  # manual, scheduled, event, webhook
    trigger_config = Column(JSON, default={})
    steps = Column(JSON, default=[])  # Array of workflow steps
    is_active = Column(Boolean, default=True)
    total_runs = Column(Integer, default=0)
    successful_runs = Column(Integer, default=0)
    last_run_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    runs = relationship("WorkflowRun", back_populates="workflow")


class WorkflowRun(Base):
    __tablename__ = "workflow_runs"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(GUID(), ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False)
    triggered_by = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"))
    status = Column(String(20), default="pending")  # pending, running, completed, failed, cancelled
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    step_results = Column(JSON, default=[])
    error_message = Column(Text)
    execution_time_ms = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    workflow = relationship("Workflow", back_populates="runs")
