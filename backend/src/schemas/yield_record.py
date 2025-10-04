"""Yield Record Schemas"""
from datetime import datetime, date
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID


class YieldRecordBase(BaseModel):
    """Base yield record schema"""
    harvest_date: date
    amount: float = Field(..., gt=0, description="Harvest amount")
    unit: str = Field(default="kg", max_length=20, description="kg, lbs, tons")
    quality_grade: Optional[str] = Field(None, max_length=50, description="A, B, C, Premium")
    notes: Optional[str] = None
    metadata_: Dict[str, Any] = Field(default_factory=dict)


class YieldRecordCreate(YieldRecordBase):
    """Schema for creating a yield record"""
    zone_id: UUID


class YieldRecordUpdate(BaseModel):
    """Schema for updating a yield record"""
    harvest_date: Optional[date] = None
    amount: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = Field(None, max_length=20)
    quality_grade: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None
    metadata_: Optional[Dict[str, Any]] = None


class YieldRecordResponse(YieldRecordBase):
    """Schema for yield record response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    zone_id: UUID
    created_at: datetime


class YieldRecordWithZone(YieldRecordResponse):
    """Schema for yield record with zone details"""
    zone_name: Optional[str] = None
    crop_name: Optional[str] = None
