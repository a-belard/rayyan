"""Farm crop association schemas."""

from datetime import datetime, date
from uuid import UUID
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class FarmCropBase(BaseModel):
    """Base farm crop schema."""
    first_planted_date: Optional[date] = Field(None, description="First planted date")
    last_planted_date: Optional[date] = Field(None, description="Last planted date")
    total_plantings: int = Field(default=1, ge=1, description="Total number of plantings")
    is_currently_planted: bool = Field(default=True, description="Currently planted")
    notes: Optional[str] = Field(None, description="Notes about this crop on this farm")
    metadata_: dict = Field(default_factory=dict, description="Additional metadata")


class FarmCropCreate(FarmCropBase):
    """Schema for creating a farm crop association."""
    farm_id: UUID = Field(..., description="Farm ID")
    crop_id: UUID = Field(..., description="Crop ID")


class FarmCropUpdate(BaseModel):
    """Schema for updating a farm crop association."""
    first_planted_date: Optional[date] = None
    last_planted_date: Optional[date] = None
    total_plantings: Optional[int] = Field(None, ge=1)
    is_currently_planted: Optional[bool] = None
    notes: Optional[str] = None
    metadata_: Optional[dict] = None


class FarmCropResponse(FarmCropBase):
    """Schema for farm crop response."""
    id: UUID
    farm_id: UUID
    crop_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FarmCropWithDetails(FarmCropResponse):
    """Farm crop response with crop details."""
    crop_name: str
    crop_category: Optional[str] = None
    crop_scientific_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
