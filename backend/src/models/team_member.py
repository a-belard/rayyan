"""Team Member Model"""
from sqlalchemy import Column, String, Boolean, Date, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .common import Base, UUID, TimestampMixin, uuid


class TeamMember(Base, TimestampMixin):
    """Farm employees and team members"""

    __tablename__ = "team_members"

    id = Column(UUID, primary_key=True, default=uuid.uuid4, nullable=False)
    farm_id = Column(UUID, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    role = Column(String(100), nullable=False)  # Senior Worker, Field Specialist, etc.
    status = Column(String(50), default="active")  # active, break, off-duty, vacation
    current_zone_id = Column(UUID, ForeignKey("farm_zones.id", ondelete="SET NULL"), nullable=True)
    phone = Column(String(20))
    email = Column(String(255))
    metadata_ = Column("metadata_", JSONB, default={})
    is_active = Column(Boolean, default=True)
    hired_date = Column(Date)

    # Relationships
    farm = relationship("Farm", back_populates="team_members")
    user = relationship("User")
    current_zone = relationship("FarmZone", foreign_keys=[current_zone_id])
    assigned_tasks = relationship("FarmTask", back_populates="assignee", foreign_keys="FarmTask.assigned_to")

    def __repr__(self):
        return f"<TeamMember(name={self.name}, role={self.role}, status={self.status})>"
