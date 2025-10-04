"""Crop schemas."""

from datetime import datetime
from uuid import UUID
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class CropBase(BaseModel):
    """Base crop schema."""
    name: str = Field(..., min_length=1, max_length=100, description="Crop name")
    scientific_name: Optional[str] = Field(None, max_length=255, description="Scientific name")
    category: Optional[str] = Field(None, max_length=100, description="Category (e.g., vegetables, fruits, grains)")
    description: Optional[str] = Field(None, description="Crop description")
    growing_season: Optional[str] = Field(None, max_length=100, description="Growing season")
    typical_duration_days: Optional[int] = Field(None, ge=1, description="Typical growing duration in days")
    water_requirements: Optional[str] = Field(None, max_length=50, description="Water requirements (low, moderate, high)")
    metadata_: dict = Field(default_factory=dict, description="Additional metadata")
    is_active: bool = Field(default=True, description="Active status")


class CropCreate(CropBase):
    """Schema for creating a crop."""
    pass


class CropUpdate(BaseModel):
    """Schema for updating a crop."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    scientific_name: Optional[str] = Field(None, max_length=255)
    category: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    growing_season: Optional[str] = Field(None, max_length=100)
    typical_duration_days: Optional[int] = Field(None, ge=1)
    water_requirements: Optional[str] = Field(None, max_length=50)
    metadata_: Optional[dict] = None
    is_active: Optional[bool] = None


class CropResponse(CropBase):
    """Schema for crop response."""
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
