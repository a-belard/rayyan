"""Yield Record Model"""
from sqlalchemy import Column, String, Float, Date, Text, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .common import Base, UUID, TimestampMixin, uuid


class YieldRecord(Base, TimestampMixin):
    """Harvest and production tracking for each zone"""

    __tablename__ = "yield_records"

    id = Column(UUID, primary_key=True, default=uuid.uuid4, nullable=False)
    zone_id = Column(UUID, ForeignKey("farm_zones.id", ondelete="CASCADE"), nullable=False, index=True)
    harvest_date = Column(Date, nullable=False)
    amount = Column(Float, CheckConstraint("amount > 0"), nullable=False)
    unit = Column(String(20), default="kg")  # kg, lbs, tons
    quality_grade = Column(String(50))  # A, B, C, Premium, etc.
    notes = Column(Text)
    metadata_ = Column("metadata_", JSONB, default={})

    # Relationships
    zone = relationship("FarmZone", back_populates="yield_records")

    def __repr__(self):
        return f"<YieldRecord(zone_id={self.zone_id}, date={self.harvest_date}, amount={self.amount} {self.unit})>"
