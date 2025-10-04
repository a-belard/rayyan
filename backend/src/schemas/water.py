"""Water Usage and Storage Schemas"""
from datetime import datetime, date
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID


# ==================== Water Usage ====================

class WaterUsageBase(BaseModel):
    """Base water usage schema"""
    usage_date: date
    amount: float = Field(..., ge=0, description="Water used in liters")
    irrigation_method: Optional[str] = Field(None, max_length=100, description="drip, sprinkler, flood, manual")
    duration_minutes: Optional[int] = Field(None, ge=0)
    efficiency_rating: Optional[float] = Field(None, ge=0, le=100, description="Efficiency percentage")
    cost: Optional[float] = Field(None, ge=0, description="Cost in local currency")
    metadata_: Dict[str, Any] = Field(default_factory=dict)


class WaterUsageCreate(WaterUsageBase):
    """Schema for creating water usage record"""
    zone_id: UUID


class WaterUsageUpdate(BaseModel):
    """Schema for updating water usage record"""
    usage_date: Optional[date] = None
    amount: Optional[float] = Field(None, ge=0)
    irrigation_method: Optional[str] = Field(None, max_length=100)
    duration_minutes: Optional[int] = Field(None, ge=0)
    efficiency_rating: Optional[float] = Field(None, ge=0, le=100)
    cost: Optional[float] = Field(None, ge=0)
    metadata_: Optional[Dict[str, Any]] = None


class WaterUsageResponse(WaterUsageBase):
    """Schema for water usage response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    zone_id: UUID
    created_at: datetime


class WaterUsageWithZone(WaterUsageResponse):
    """Schema for water usage with zone details"""
    zone_name: Optional[str] = None


# ==================== Water Storage ====================

class WaterStorageBase(BaseModel):
    """Base water storage schema"""
    name: str = Field(..., max_length=255)
    capacity: float = Field(..., gt=0, description="Storage capacity in liters")
    current_level: float = Field(..., ge=0, description="Current water level in liters")
    critical_level: Optional[float] = Field(None, ge=0, description="Alert threshold")
    last_refill_date: Optional[date] = None
    next_refill_date: Optional[date] = None
    location: Optional[str] = Field(None, max_length=255)
    metadata_: Dict[str, Any] = Field(default_factory=dict)


class WaterStorageCreate(WaterStorageBase):
    """Schema for creating water storage"""
    farm_id: UUID


class WaterStorageUpdate(BaseModel):
    """Schema for updating water storage"""
    name: Optional[str] = Field(None, max_length=255)
    capacity: Optional[float] = Field(None, gt=0)
    current_level: Optional[float] = Field(None, ge=0)
    critical_level: Optional[float] = Field(None, ge=0)
    last_refill_date: Optional[date] = None
    next_refill_date: Optional[date] = None
    location: Optional[str] = Field(None, max_length=255)
    metadata_: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class WaterStorageResponse(WaterStorageBase):
    """Schema for water storage response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    farm_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ==================== Irrigation Schedule ====================

class IrrigationScheduleBase(BaseModel):
    """Base irrigation schedule schema"""
    scheduled_time: datetime
    estimated_amount: Optional[float] = Field(None, gt=0, description="Estimated water in liters")
    priority: str = Field(default="medium", description="high, medium, low")
    status: str = Field(default="scheduled", description="scheduled, in-progress, completed, skipped")
    actual_amount: Optional[float] = Field(None, ge=0, description="Actual water used in liters")
    notes: Optional[str] = None


class IrrigationScheduleCreate(IrrigationScheduleBase):
    """Schema for creating irrigation schedule"""
    zone_id: UUID


class IrrigationScheduleUpdate(BaseModel):
    """Schema for updating irrigation schedule"""
    scheduled_time: Optional[datetime] = None
    estimated_amount: Optional[float] = Field(None, gt=0)
    priority: Optional[str] = None
    status: Optional[str] = None
    completed_at: Optional[datetime] = None
    actual_amount: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None


class IrrigationScheduleResponse(IrrigationScheduleBase):
    """Schema for irrigation schedule response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    zone_id: UUID
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class IrrigationScheduleWithZone(IrrigationScheduleResponse):
    """Schema for irrigation schedule with zone details"""
    zone_name: Optional[str] = None
