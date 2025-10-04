"""Water Storage Model"""
from sqlalchemy import Column, String, Float, Date, Boolean, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .common import Base, UUID, TimestampMixin, uuid


class WaterStorage(Base, TimestampMixin):
    """Water storage tanks and reservoirs for the farm"""

    __tablename__ = "water_storage"

    id = Column(UUID, primary_key=True, default=uuid.uuid4, nullable=False)
    farm_id = Column(UUID, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    capacity = Column(Float, CheckConstraint("capacity > 0"), nullable=False)  # liters
    current_level = Column(Float, CheckConstraint("current_level >= 0"), nullable=False)  # liters
    critical_level = Column(Float, CheckConstraint("critical_level >= 0"))
    last_refill_date = Column(Date)
    next_refill_date = Column(Date)
    location = Column(String(255))
    metadata_ = Column("metadata_", JSONB, default={})
    is_active = Column(Boolean, default=True)

    # Relationships
    farm = relationship("Farm", back_populates="water_storage")

    # Table constraint
    __table_args__ = (
        CheckConstraint("current_level <= capacity", name="check_level_capacity"),
    )

    def __repr__(self):
        return f"<WaterStorage(name={self.name}, level={self.current_level}/{self.capacity}L)>"
