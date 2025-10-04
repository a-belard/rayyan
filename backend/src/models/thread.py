"""Thread model."""

import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base


class Thread(Base):
    """Chat thread/conversation."""
    __tablename__ = "threads"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    farm_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("farms.id", ondelete="SET NULL"), index=True
    )
    
    # Thread Info
    title: Mapped[str | None] = mapped_column(String(255))
    is_pinned: Mapped[bool] = mapped_column(default=False)
    metadata_: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    last_message_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    
    # Relationships
    user = relationship("User", back_populates="threads")
    farm = relationship("Farm")
    messages = relationship("Message", back_populates="thread", cascade="all, delete-orphan", order_by="Message.position")
    runs = relationship("Run", back_populates="thread", cascade="all, delete-orphan")
