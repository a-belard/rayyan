"""Crop model."""

import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, Integer, Boolean, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base


class Crop(Base):
    """Master list of crop types."""
    __tablename__ = "crops"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4
    )
    
    # Basic Info
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    scientific_name: Mapped[str | None] = mapped_column(String(255))
    category: Mapped[str | None] = mapped_column(String(100), index=True)
    description: Mapped[str | None] = mapped_column(Text)
    
    # Growing Information
    growing_season: Mapped[str | None] = mapped_column(String(100))
    typical_duration_days: Mapped[int | None] = mapped_column(Integer)
    water_requirements: Mapped[str | None] = mapped_column(String(50))
    
    # Additional Data
    metadata_: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default="now()", nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default="now()", onupdate="now()", nullable=False
    )
    
    # Relationships
    farm_zones = relationship("FarmZone", back_populates="crop")
    farm_crops = relationship("FarmCrop", back_populates="crop")

    def __repr__(self):
        return f"<Crop(id={self.id}, name={self.name}, category={self.category})>"
