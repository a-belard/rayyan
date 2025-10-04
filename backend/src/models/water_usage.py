"""Water Usage Model"""
from sqlalchemy import Column, String, Float, Date, Integer, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .common import Base, UUID, TimestampMixin


class WaterUsage(Base, TimestampMixin):
    """Daily water consumption tracking by zone"""

    __tablename__ = "water_usage"

    zone_id = Column(UUID, ForeignKey("farm_zones.id", ondelete="CASCADE"), nullable=False, index=True)
    usage_date = Column(Date, nullable=False)
    amount = Column(Float, CheckConstraint("amount >= 0"), nullable=False)  # liters
    irrigation_method = Column(String(100))  # drip, sprinkler, flood, manual
    duration_minutes = Column(Integer, CheckConstraint("duration_minutes >= 0"))
    efficiency_rating = Column(Float, CheckConstraint("efficiency_rating >= 0 AND efficiency_rating <= 100"))
    cost = Column(Float, CheckConstraint("cost >= 0"))
    metadata_ = Column("metadata_", JSONB, default={})

    # Relationships
    zone = relationship("FarmZone", back_populates="water_usage")

    def __repr__(self):
        return f"<WaterUsage(zone_id={self.zone_id}, date={self.usage_date}, amount={self.amount}L)>"
