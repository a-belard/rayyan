"""
Database models for users, chat, threads, messages, and agent runs.
"""

from sqlalchemy import String, Text, DateTime, ForeignKey, func, Enum as SAEnum, Integer, Boolean
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
import enum
import uuid

from db import Base


class UserRole(str, enum.Enum):
    """User role in the system."""
    admin = "admin"
    farmer = "farmer"
    agronomist = "agronomist"
    viewer = "viewer"


class UserStatus(str, enum.Enum):
    """User account status."""
    active = "active"
    inactive = "inactive"
    suspended = "suspended"
    pending = "pending"


class MessageRole(str, enum.Enum):
    """Message role in conversation."""
    user = "user"
    assistant = "assistant"
    system = "system"


class RunStatus(str, enum.Enum):
    """Status of an agent run."""
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class User(Base):
    """User account managed by Supabase Auth."""
    __tablename__ = "users"

    # Use Supabase auth.users.id as primary key
    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, index=True
    )
    
    # Basic Information
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    
    # Role and Status
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="user_role"), nullable=False, default=UserRole.farmer
    )
    status: Mapped[UserStatus] = mapped_column(
        SAEnum(UserStatus, name="user_status"), nullable=False, default=UserStatus.active
    )
    
    # Profile Information
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Farm/Organization Information (for context)
    organization_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    farm_location: Mapped[str | None] = mapped_column(String(500), nullable=True)
    farm_size_hectares: Mapped[float | None] = mapped_column(nullable=True)
    primary_crops: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    
    # Preferences and Settings
    preferences: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    # Example preferences:
    # {
    #   "language": "en",
    #   "timezone": "UTC",
    #   "notifications_enabled": true,
    #   "default_units": "metric",
    #   "theme": "light"
    # }
    
    # Subscription/Plan Information (optional)
    subscription_tier: Mapped[str | None] = mapped_column(String(50), nullable=True)
    subscription_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Metadata for additional context
    metadata_: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Soft delete
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    threads = relationship(
        "Thread",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="Thread.user_id",
    )
    farms = relationship(
        "Farm",
        back_populates="owner",
        cascade="all, delete-orphan",
    )


class Farm(Base):
    """Farm/Field information for agricultural context."""
    __tablename__ = "farms"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4
    )
    
    owner_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    # Geographic coordinates
    latitude: Mapped[float | None] = mapped_column(nullable=True)
    longitude: Mapped[float | None] = mapped_column(nullable=True)
    
    # Farm details
    size_hectares: Mapped[float | None] = mapped_column(nullable=True)
    soil_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    irrigation_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    # Active crops and zones
    crops: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    zones: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    # Example zones:
    # [
    #   {"id": "zone-1", "name": "North Field", "crop": "tomatoes", "area_hectares": 2.5},
    #   {"id": "zone-2", "name": "South Field", "crop": "corn", "area_hectares": 3.0}
    # ]
    
    # Metadata for sensors, equipment, etc.
    metadata_: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    
    is_active: Mapped[bool] = mapped_column(default=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    
    # Relationships
    owner = relationship("User", back_populates="farms")


class Thread(Base):
    """Chat thread/conversation."""
    __tablename__ = "threads"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4
    )
    
    user_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_pinned: Mapped[bool] = mapped_column(default=False)
    
    # Optional: Link thread to specific farm/zone
    farm_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("farms.id", ondelete="SET NULL"), index=True, nullable=True
    )
    
    # Metadata for context (farm info, location, etc.)
    metadata_: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    
    last_message_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    
    # Relationships
    user = relationship("User", back_populates="threads", foreign_keys=[user_id])
    farm = relationship("Farm", foreign_keys=[farm_id])
    messages = relationship(
        "Message",
        back_populates="thread",
        cascade="all, delete-orphan",
        order_by="Message.position",
    )
    runs = relationship(
        "Run",
        back_populates="thread",
        cascade="all, delete-orphan",
    )


class Message(Base):
    """Individual message in a thread."""
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4
    )
    
    thread_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("threads.id", ondelete="CASCADE"), index=True, nullable=False
    )
    
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    role: Mapped[MessageRole] = mapped_column(SAEnum(MessageRole, name="message_role"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Metadata: citations, tool calls, reasoning steps, etc.
    metadata_: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    # Relationships
    thread = relationship("Thread", back_populates="messages")


class Run(Base):
    """Agent run (execution of tools and LLM calls)."""
    __tablename__ = "runs"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4
    )
    
    thread_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("threads.id", ondelete="CASCADE"), index=True, nullable=False
    )
    
    status: Mapped[RunStatus] = mapped_column(
        SAEnum(RunStatus, name="run_status"), nullable=False, default=RunStatus.pending
    )
    
    # Run details: tool calls, reasoning, errors
    metadata_: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    # Relationships
    thread = relationship("Thread", back_populates="runs")
