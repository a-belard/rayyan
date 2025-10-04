"""Farm crop association model."""

import uuid
from datetime import datetime, date

from sqlalchemy import String, DateTime, ForeignKey, Integer, Boolean, Date, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base


class FarmCrop(Base):
    """Many-to-many relationship between farms and crops with history."""
    __tablename__ = "farm_crops"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4
    )
    farm_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), index=True, nullable=False
    )
    crop_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("crops.id", ondelete="CASCADE"), index=True, nullable=False
    )
    
    # Crop History
    first_planted_date: Mapped[date | None] = mapped_column(Date)
    last_planted_date: Mapped[date | None] = mapped_column(Date)
    total_plantings: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    
    # Status
    is_currently_planted: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    notes: Mapped[str | None] = mapped_column(Text)
    
    # Additional Data
    metadata_: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default="now()", nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default="now()", onupdate="now()", nullable=False
    )
    
    # Relationships
    farm = relationship("Farm", back_populates="farm_crops")
    crop = relationship("Crop", back_populates="farm_crops")
    
    # Unique constraint to prevent duplicate farm-crop combinations
    __table_args__ = (
        UniqueConstraint('farm_id', 'crop_id', name='uq_farm_crop'),
    )

    def __repr__(self):
        return f"<FarmCrop(id={self.id}, farm_id={self.farm_id}, crop_id={self.crop_id})>"
