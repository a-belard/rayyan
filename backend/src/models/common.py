"""Common database utilities and base classes."""

from sqlalchemy import String, Text, DateTime, ForeignKey, func, Enum as SAEnum, Integer
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
import enum
import uuid

from src.core.database import Base

# Alias for PGUUID to simplify imports
UUID = PGUUID

# Create TimestampMixin class
class TimestampMixin:
    """Mixin for adding timestamp fields to models."""
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

__all__ = [
    "Base", 
    "Mapped", 
    "mapped_column", 
    "relationship", 
    "datetime", 
    "uuid",
    "UUID",
    "TimestampMixin",
    "func",
    "ForeignKey",
    "String",
    "Text",
    "Integer",
    "SAEnum",
]
