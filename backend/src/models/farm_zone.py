"""Farm zone model."""

import uuid
from datetime import datetime, date

from sqlalchemy import String, DateTime, Float, ForeignKey, Boolean, Date, Text, CheckConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base


class FarmZone(Base):
    """Individual zones/fields within a farm."""
    __tablename__ = "farm_zones"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4
    )
    farm_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), index=True, nullable=False
    )
    crop_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("crops.id", ondelete="SET NULL"), index=True
    )
    
    # Zone Details
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    area_hectares: Mapped[float | None] = mapped_column(Float)
    
    # Geographic Data
    polygon: Mapped[list | None] = mapped_column(JSONB)  # Array of [lat, lng] points
    center_latitude: Mapped[float | None] = mapped_column(Float)
    center_longitude: Mapped[float | None] = mapped_column(Float)
    color: Mapped[str | None] = mapped_column(String(20))  # Hex color for map
    
    # Crop-specific Data
    crop_variety: Mapped[str | None] = mapped_column(String(255))
    planting_date: Mapped[date | None] = mapped_column(Date, index=True)
    expected_harvest_date: Mapped[date | None] = mapped_column(Date)
    growth_stage: Mapped[str | None] = mapped_column(String(100), index=True)
    
    # Sensors and Equipment
    sensor_ids: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    
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
    farm = relationship("Farm", back_populates="farm_zones")
    crop = relationship("Crop", back_populates="farm_zones")
    sensor_readings = relationship("SensorReading", back_populates="zone", cascade="all, delete-orphan")
    farm_tasks = relationship("FarmTask", back_populates="zone", cascade="all, delete-orphan")
    yield_records = relationship("YieldRecord", back_populates="zone", cascade="all, delete-orphan")
    water_usage = relationship("WaterUsage", back_populates="zone", cascade="all, delete-orphan")
    irrigation_schedules = relationship("IrrigationSchedule", back_populates="zone", cascade="all, delete-orphan")
    zone_alerts = relationship("ZoneAlert", back_populates="zone", cascade="all, delete-orphan")
    zone_recommendations = relationship("ZoneRecommendation", back_populates="zone", cascade="all, delete-orphan")
    
    # Check constraints
    __table_args__ = (
        CheckConstraint('area_hectares > 0', name='check_area_positive'),
        CheckConstraint('center_latitude >= -90 AND center_latitude <= 90', name='check_latitude_range'),
        CheckConstraint('center_longitude >= -180 AND center_longitude <= 180', name='check_longitude_range'),
    )

    def __repr__(self):
        return f"<FarmZone(id={self.id}, name={self.name}, farm_id={self.farm_id}, crop_id={self.crop_id})>"
