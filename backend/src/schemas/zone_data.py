"""Zone Alert and Recommendation Schemas"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID


# ==================== Zone Alerts ====================

class ZoneAlertBase(BaseModel):
    """Base zone alert schema"""
    alert_type: str = Field(..., max_length=50, description="info, warning, critical")
    message: str = Field(..., description="Alert message")
    priority: int = Field(default=1, ge=1, le=10, description="1 = highest, 10 = lowest")
    metadata_: Dict[str, Any] = Field(default_factory=dict)


class ZoneAlertCreate(ZoneAlertBase):
    """Schema for creating a zone alert"""
    zone_id: UUID


class ZoneAlertUpdate(BaseModel):
    """Schema for updating a zone alert"""
    alert_type: Optional[str] = Field(None, max_length=50)
    message: Optional[str] = None
    priority: Optional[int] = Field(None, ge=1, le=10)
    is_resolved: Optional[bool] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[UUID] = None
    metadata_: Optional[Dict[str, Any]] = None


class ZoneAlertResponse(ZoneAlertBase):
    """Schema for zone alert response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    zone_id: UUID
    is_resolved: bool
    resolved_at: Optional[datetime]
    resolved_by: Optional[UUID]
    created_at: datetime


class ZoneAlertWithDetails(ZoneAlertResponse):
    """Schema for zone alert with additional details"""
    zone_name: Optional[str] = None
    resolver_name: Optional[str] = None


# ==================== Zone Recommendations ====================

class ZoneRecommendationBase(BaseModel):
    """Base zone recommendation schema"""
    title: str = Field(..., max_length=255)
    description: str = Field(..., description="Recommendation details")
    priority: str = Field(default="medium", description="high, medium, low")
    category: Optional[str] = Field(None, max_length=100, description="irrigation, pest-control, fertilization, harvesting, pruning")
    metadata_: Dict[str, Any] = Field(default_factory=dict)


class ZoneRecommendationCreate(ZoneRecommendationBase):
    """Schema for creating a zone recommendation"""
    zone_id: UUID


class ZoneRecommendationUpdate(BaseModel):
    """Schema for updating a zone recommendation"""
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None
    applied_at: Optional[datetime] = None
    applied_by: Optional[UUID] = None
    effectiveness_rating: Optional[int] = Field(None, ge=1, le=5)
    feedback: Optional[str] = None
    metadata_: Optional[Dict[str, Any]] = None


class ZoneRecommendationResponse(ZoneRecommendationBase):
    """Schema for zone recommendation response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    zone_id: UUID
    is_active: bool
    applied_at: Optional[datetime]
    applied_by: Optional[UUID]
    effectiveness_rating: Optional[int]
    feedback: Optional[str]
    created_at: datetime


class ZoneRecommendationWithDetails(ZoneRecommendationResponse):
    """Schema for zone recommendation with additional details"""
    zone_name: Optional[str] = None
    applier_name: Optional[str] = None
