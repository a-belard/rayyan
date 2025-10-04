"""Farm Task Schemas"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID


class FarmTaskBase(BaseModel):
    """Base farm task schema"""
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    priority: str = Field(default="medium", description="high, medium, low")
    status: str = Field(default="pending", description="pending, in-progress, completed, cancelled")
    due_date: Optional[datetime] = None
    metadata_: Dict[str, Any] = Field(default_factory=dict)


class FarmTaskCreate(FarmTaskBase):
    """Schema for creating a farm task"""
    farm_id: UUID
    zone_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    created_by: Optional[UUID] = None


class FarmTaskUpdate(BaseModel):
    """Schema for updating a farm task"""
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    zone_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    metadata_: Optional[Dict[str, Any]] = None


class FarmTaskResponse(FarmTaskBase):
    """Schema for farm task response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    farm_id: UUID
    zone_id: Optional[UUID]
    assigned_to: Optional[UUID]
    completed_at: Optional[datetime]
    created_by: Optional[UUID]
    created_at: datetime
    updated_at: datetime


class FarmTaskWithDetails(FarmTaskResponse):
    """Schema for farm task with additional details"""
    zone_name: Optional[str] = None
    assignee_name: Optional[str] = None
    creator_name: Optional[str] = None
