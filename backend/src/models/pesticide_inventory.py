"""Pesticide Inventory Model"""
from sqlalchemy import Column, String, Float, Date, Boolean, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .common import Base, UUID, TimestampMixin, uuid


class PesticideInventory(Base, TimestampMixin):
    """Pesticide, fertilizer, and chemical inventory management"""

    __tablename__ = "pesticide_inventory"

    id = Column(UUID, primary_key=True, default=uuid.uuid4, nullable=False)
    farm_id = Column(UUID, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    product_type = Column(String(100))  # insecticide, fungicide, herbicide, fertilizer
    current_stock = Column(Float, CheckConstraint("current_stock >= 0"), nullable=False)
    unit = Column(String(20), nullable=False)  # liters, kg, gallons
    capacity = Column(Float, CheckConstraint("capacity >= 0"))
    reorder_threshold = Column(Float, CheckConstraint("reorder_threshold >= 0"))
    last_used_date = Column(Date)
    next_order_date = Column(Date)
    cost_per_unit = Column(Float, CheckConstraint("cost_per_unit >= 0"))
    supplier = Column(String(255))
    metadata_ = Column("metadata_", JSONB, default={})
    is_active = Column(Boolean, default=True)

    # Relationships
    farm = relationship("Farm", back_populates="pesticide_inventory")

    def __repr__(self):
        return f"<PesticideInventory(name={self.name}, stock={self.current_stock} {self.unit})>"
