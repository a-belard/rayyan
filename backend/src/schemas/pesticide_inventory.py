"""Pesticide Inventory Schemas"""
from datetime import datetime, date
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID


class PesticideInventoryBase(BaseModel):
    """Base pesticide inventory schema"""
    name: str = Field(..., max_length=255)
    product_type: Optional[str] = Field(None, max_length=100, description="insecticide, fungicide, herbicide, fertilizer")
    current_stock: float = Field(..., ge=0, description="Current stock amount")
    unit: str = Field(..., max_length=20, description="liters, kg, gallons")
    capacity: Optional[float] = Field(None, ge=0, description="Storage capacity")
    reorder_threshold: Optional[float] = Field(None, ge=0, description="Reorder alert threshold")
    last_used_date: Optional[date] = None
    next_order_date: Optional[date] = None
    cost_per_unit: Optional[float] = Field(None, ge=0)
    supplier: Optional[str] = Field(None, max_length=255)
    metadata_: Dict[str, Any] = Field(default_factory=dict)


class PesticideInventoryCreate(PesticideInventoryBase):
    """Schema for creating pesticide inventory item"""
    farm_id: UUID


class PesticideInventoryUpdate(BaseModel):
    """Schema for updating pesticide inventory item"""
    name: Optional[str] = Field(None, max_length=255)
    product_type: Optional[str] = Field(None, max_length=100)
    current_stock: Optional[float] = Field(None, ge=0)
    unit: Optional[str] = Field(None, max_length=20)
    capacity: Optional[float] = Field(None, ge=0)
    reorder_threshold: Optional[float] = Field(None, ge=0)
    last_used_date: Optional[date] = None
    next_order_date: Optional[date] = None
    cost_per_unit: Optional[float] = Field(None, ge=0)
    supplier: Optional[str] = Field(None, max_length=255)
    metadata_: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class PesticideInventoryResponse(PesticideInventoryBase):
    """Schema for pesticide inventory response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    farm_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime


class PesticideInventoryWithStatus(PesticideInventoryResponse):
    """Schema for pesticide inventory with reorder status"""
    needs_reorder: bool = False
    stock_percentage: Optional[float] = None
