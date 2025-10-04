"""Farm Task Model"""
from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime

from .common import Base, UUID, TimestampMixin


class FarmTask(Base, TimestampMixin):
    """Tasks assigned to team members for farm operations"""

    __tablename__ = "farm_tasks"

    farm_id = Column(UUID, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    zone_id = Column(UUID, ForeignKey("farm_zones.id", ondelete="SET NULL"), nullable=True)
    assigned_to = Column(UUID, ForeignKey("team_members.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    priority = Column(String(20), default="medium")  # high, medium, low
    status = Column(String(50), default="pending")  # pending, in-progress, completed, cancelled
    due_date = Column(String, nullable=True)
    completed_at = Column(String, nullable=True)
    metadata_ = Column("metadata_", JSONB, default={})
    created_by = Column(UUID, ForeignKey("users.id"), nullable=True)

    # Relationships
    farm = relationship("Farm", back_populates="farm_tasks")
    zone = relationship("FarmZone", back_populates="farm_tasks")
    assignee = relationship("TeamMember", back_populates="assigned_tasks", foreign_keys=[assigned_to])
    creator = relationship("User", foreign_keys=[created_by])

    def __repr__(self):
        return f"<FarmTask(title={self.title}, status={self.status}, priority={self.priority})>"
