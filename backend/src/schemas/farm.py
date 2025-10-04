"""Farm-related Pydantic schemas."""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Tuple
from datetime import datetime


class FarmZone(BaseModel):
    """Farm zone/sub-area definition with polygon support."""
    id: str
    name: Optional[str] = None
    crop: Optional[str] = None  # Crop type (e.g., Wheat, Rice, Corn)
    crop_variety: Optional[str] = None
    area_hectares: Optional[float] = Field(None, gt=0)
    points: List[Tuple[float, float]] = Field(default_factory=list)  # Polygon coordinates [(lat, lng), ...]
    planting_date: Optional[str] = None
    growth_stage: Optional[str] = None
    sensors: List[str] = Field(default_factory=list)
    color: Optional[str] = None  # For map visualization


class FarmBase(BaseModel):
    """Base farm schema."""
    name: str = Field(..., min_length=1, max_length=255)
    location: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    size_hectares: Optional[float] = Field(None, gt=0)
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    crops: List[str] = Field(default_factory=list)
    zones: List[FarmZone] = Field(default_factory=list)
    metadata_: dict = Field(default_factory=dict, alias="metadata")


class FarmCreate(FarmBase):
    """Schema for creating farm."""
    pass


class FarmUpdate(BaseModel):
    """Schema for updating farm."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    location: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    size_hectares: Optional[float] = Field(None, gt=0)
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    crops: Optional[List[str]] = None
    zones: Optional[List[FarmZone]] = None
    metadata_: Optional[dict] = Field(None, alias="metadata")
    is_active: Optional[bool] = None


class FarmResponse(BaseModel):
    """Farm response with owner info."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    
    id: str
    owner_id: str
    name: str
    location: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    size_hectares: Optional[float]
    soil_type: Optional[str]
    irrigation_type: Optional[str]
    crops: List[str]
    zones: List[FarmZone]
    metadata_: dict = Field(alias="metadata")
    is_active: bool
    created_at: datetime
    updated_at: datetime
    owner_email: Optional[str] = None
    owner_name: Optional[str] = None


class FarmListResponse(BaseModel):
    """Paginated farm list response."""
    farms: List[FarmResponse]
    total: int
    page: int
    page_size: int
