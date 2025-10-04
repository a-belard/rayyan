"""Sensor Reading Schemas"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID


class SensorReadingBase(BaseModel):
    """Base sensor reading schema"""
    soil_moisture: Optional[float] = Field(None, ge=0, le=100, description="Soil moisture percentage")
    temperature: Optional[float] = Field(None, description="Temperature in celsius")
    humidity: Optional[float] = Field(None, ge=0, le=100, description="Humidity percentage")
    soil_ph: Optional[float] = Field(None, ge=0, le=14, description="Soil pH level")
    reading_timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)


class SensorReadingCreate(SensorReadingBase):
    """Schema for creating a sensor reading"""
    zone_id: UUID


class SensorReadingUpdate(SensorReadingBase):
    """Schema for updating a sensor reading"""
    pass


class SensorReadingResponse(SensorReadingBase):
    """Schema for sensor reading response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    zone_id: UUID
    created_at: datetime


class SensorReadingWithZone(SensorReadingResponse):
    """Schema for sensor reading with zone details"""
    zone_name: Optional[str] = None
    crop_name: Optional[str] = None
