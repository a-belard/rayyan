"""Run model and related enums."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Enum as SAEnum, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base


class RunStatus(str, enum.Enum):
    """Status of an agent run."""
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class Run(Base):
    """Agent run (execution of tools and LLM calls)."""
    __tablename__ = "runs"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4
    )
    thread_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("threads.id", ondelete="CASCADE"), index=True
    )
    
    status: Mapped[RunStatus] = mapped_column(
        SAEnum(RunStatus, name="run_status"), nullable=False, default=RunStatus.pending
    )
    metadata_: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    # Relationships
    thread = relationship("Thread", back_populates="runs")
