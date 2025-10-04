"""Zone Recommendation Model"""
from sqlalchemy import Column, String, Text, Boolean, Integer, ForeignKey, CheckConstraint, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .common import Base, UUID, TimestampMixin, uuid


class ZoneRecommendation(Base, TimestampMixin):
    """AI-generated recommendations and best practices for zones"""

    __tablename__ = "zone_recommendations"

    id = Column(UUID, primary_key=True, default=uuid.uuid4, nullable=False)
    zone_id = Column(UUID, ForeignKey("farm_zones.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(20), default="medium")  # high, medium, low
    category = Column(String(100))  # irrigation, pest-control, fertilization, harvesting, pruning
    is_active = Column(Boolean, default=True)
    applied_at = Column(DateTime, nullable=True)
    applied_by = Column(UUID, ForeignKey("users.id"), nullable=True)
    effectiveness_rating = Column(Integer, CheckConstraint("effectiveness_rating >= 1 AND effectiveness_rating <= 5"))
    feedback = Column(Text)
    metadata_ = Column("metadata_", JSONB, default={})

    # Relationships
    zone = relationship("FarmZone", back_populates="zone_recommendations")
    applier = relationship("User", foreign_keys=[applied_by])

    def __repr__(self):
        return f"<ZoneRecommendation(title={self.title}, priority={self.priority}, category={self.category})>"
