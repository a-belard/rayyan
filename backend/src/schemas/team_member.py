"""Team Member Schemas"""
from datetime import datetime, date
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from uuid import UUID


class TeamMemberBase(BaseModel):
    """Base team member schema"""
    name: str = Field(..., max_length=255)
    role: str = Field(..., max_length=100, description="e.g., Senior Worker, Field Specialist")
    status: str = Field(default="active", description="active, break, off-duty, vacation")
    current_zone_id: Optional[UUID] = None
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    metadata_: Dict[str, Any] = Field(default_factory=dict)
    hired_date: Optional[date] = None


class TeamMemberCreate(TeamMemberBase):
    """Schema for creating a team member"""
    farm_id: UUID
    user_id: Optional[UUID] = None


class TeamMemberUpdate(BaseModel):
    """Schema for updating a team member"""
    name: Optional[str] = Field(None, max_length=255)
    role: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = None
    current_zone_id: Optional[UUID] = None
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    metadata_: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    hired_date: Optional[date] = None


class TeamMemberResponse(TeamMemberBase):
    """Schema for team member response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    farm_id: UUID
    user_id: Optional[UUID]
    is_active: bool
    created_at: datetime
    updated_at: datetime


class TeamMemberWithDetails(TeamMemberResponse):
    """Schema for team member with additional details"""
    current_zone_name: Optional[str] = None
    task_count: int = 0
