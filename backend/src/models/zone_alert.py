"""Zone Alert Model"""
from sqlalchemy import Column, String, Text, Boolean, Integer, ForeignKey, CheckConstraint, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .common import Base, UUID, TimestampMixin, uuid


class ZoneAlert(Base, TimestampMixin):
    """Real-time alerts and notifications for farm zones"""

    __tablename__ = "zone_alerts"

    id = Column(UUID, primary_key=True, default=uuid.uuid4, nullable=False)
    zone_id = Column(UUID, ForeignKey("farm_zones.id", ondelete="CASCADE"), nullable=False, index=True)
    alert_type = Column(String(50), nullable=False)  # info, warning, critical
    message = Column(Text, nullable=False)
    priority = Column(Integer, CheckConstraint("priority >= 1 AND priority <= 10"), default=1)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(UUID, ForeignKey("users.id"), nullable=True)
    metadata_ = Column("metadata_", JSONB, default={})

    # Relationships
    zone = relationship("FarmZone", back_populates="zone_alerts")
    resolver = relationship("User", foreign_keys=[resolved_by])

    def __repr__(self):
        return f"<ZoneAlert(type={self.alert_type}, message={self.message[:30]}..., resolved={self.is_resolved})>"
