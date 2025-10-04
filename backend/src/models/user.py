"""User model and related enums."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, Enum as SAEnum, func, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base


class UserRole(str, enum.Enum):
    """User role in the system."""
    admin = "admin"
    farmer = "farmer"
    agronomist = "agronomist"
    viewer = "viewer"


class UserStatus(str, enum.Enum):
    """User status in the system."""
    active = "active"
    inactive = "inactive"
    suspended = "suspended"
    pending = "pending"


class User(Base):
    """User account managed by Supabase Auth."""
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, index=True
    )
    
    # Core Identity
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(20))
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    bio: Mapped[str | None] = mapped_column(Text)
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="user_role"), nullable=False, default=UserRole.farmer
    )
    status: Mapped[UserStatus] = mapped_column(
        SAEnum(UserStatus, name="user_status"), nullable=False, default=UserStatus.active
    )
    
    # Farm/Organization Context
    organization_name: Mapped[str | None] = mapped_column(String(255))
    farm_location: Mapped[str | None] = mapped_column(String(500))
    farm_size_hectares: Mapped[float | None]
    primary_crops: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    
    # System Fields
    preferences: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    metadata_: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    subscription_tier: Mapped[str | None] = mapped_column(String(50))
    subscription_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    
    # Relationships
    threads = relationship("Thread", back_populates="user", cascade="all, delete-orphan")
    farms = relationship("Farm", back_populates="owner", cascade="all, delete-orphan")
