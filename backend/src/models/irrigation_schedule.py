"""Irrigation Schedule Model"""
from sqlalchemy import Column, String, Float, Text, ForeignKey, CheckConstraint, DateTime
from sqlalchemy.orm import relationship

from .common import Base, UUID, TimestampMixin, uuid


class IrrigationSchedule(Base, TimestampMixin):
    """Planned and executed irrigation events"""

    __tablename__ = "irrigation_schedules"

    id = Column(UUID, primary_key=True, default=uuid.uuid4, nullable=False)
    zone_id = Column(UUID, ForeignKey("farm_zones.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_time = Column(DateTime, nullable=False)
    estimated_amount = Column(Float, CheckConstraint("estimated_amount > 0"))  # liters
    priority = Column(String(20), default="medium")  # high, medium, low
    status = Column(String(50), default="scheduled")  # scheduled, in-progress, completed, skipped
    completed_at = Column(DateTime, nullable=True)
    actual_amount = Column(Float, CheckConstraint("actual_amount >= 0"))  # liters
    notes = Column(Text)

    # Relationships
    zone = relationship("FarmZone", back_populates="irrigation_schedules")

    def __repr__(self):
        return f"<IrrigationSchedule(zone_id={self.zone_id}, time={self.scheduled_time}, status={self.status})>"
