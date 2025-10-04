"""Farm zone schemas."""

from datetime import datetime, date
from uuid import UUID
from typing import Optional, List, Tuple

from pydantic import BaseModel, Field, ConfigDict


class FarmZoneBase(BaseModel):
    """Base farm zone schema."""
    name: str = Field(..., min_length=1, max_length=255, description="Zone name")
    area_hectares: Optional[float] = Field(None, gt=0, description="Area in hectares")
    
    # Geographic Data
    polygon: Optional[List[List[float]]] = Field(None, description="Array of [lat, lng] coordinate pairs")
    center_latitude: Optional[float] = Field(None, ge=-90, le=90, description="Center latitude")
    center_longitude: Optional[float] = Field(None, ge=-180, le=180, description="Center longitude")
    color: Optional[str] = Field(None, max_length=20, description="Hex color for map visualization")
    
    # Crop Data
    crop_id: Optional[UUID] = Field(None, description="Crop ID")
    crop_variety: Optional[str] = Field(None, max_length=255, description="Crop variety")
    planting_date: Optional[date] = Field(None, description="Planting date")
    expected_harvest_date: Optional[date] = Field(None, description="Expected harvest date")
    growth_stage: Optional[str] = Field(None, max_length=100, description="Growth stage")
    
    # Sensors
    sensor_ids: List[str] = Field(default_factory=list, description="Sensor IDs in this zone")
    
    # Additional
    metadata_: dict = Field(default_factory=dict, description="Additional metadata")
    is_active: bool = Field(default=True, description="Active status")


class FarmZoneCreate(FarmZoneBase):
    """Schema for creating a farm zone."""
    farm_id: UUID = Field(..., description="Farm ID")


class FarmZoneUpdate(BaseModel):
    """Schema for updating a farm zone."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    area_hectares: Optional[float] = Field(None, gt=0)
    polygon: Optional[List[List[float]]] = None
    center_latitude: Optional[float] = Field(None, ge=-90, le=90)
    center_longitude: Optional[float] = Field(None, ge=-180, le=180)
    color: Optional[str] = Field(None, max_length=20)
    crop_id: Optional[UUID] = None
    crop_variety: Optional[str] = Field(None, max_length=255)
    planting_date: Optional[date] = None
    expected_harvest_date: Optional[date] = None
    growth_stage: Optional[str] = Field(None, max_length=100)
    sensor_ids: Optional[List[str]] = None
    metadata_: Optional[dict] = None
    is_active: Optional[bool] = None


class FarmZoneResponse(FarmZoneBase):
    """Schema for farm zone response."""
    id: UUID
    farm_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FarmZoneWithCrop(FarmZoneResponse):
    """Farm zone response with crop details."""
    crop_name: Optional[str] = None
    crop_category: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
