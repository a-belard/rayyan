"""Message model and related enums."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import Text, DateTime, ForeignKey, Integer, Enum as SAEnum, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base


class MessageRole(str, enum.Enum):
    """Message role in conversation."""
    user = "user"
    assistant = "assistant"
    system = "system"


class Message(Base):
    """Individual message in a thread."""
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4
    )
    thread_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("threads.id", ondelete="CASCADE"), index=True
    )
    
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    role: Mapped[MessageRole] = mapped_column(SAEnum(MessageRole, name="message_role"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    # Relationships
    thread = relationship("Thread", back_populates="messages")
