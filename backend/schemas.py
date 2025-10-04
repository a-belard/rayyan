"""
Pydantic schemas for user management API.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
from models import UserRole, UserStatus


# ==================== User Schemas ====================

class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole = UserRole.farmer
    organization_name: Optional[str] = None
    farm_location: Optional[str] = None
    farm_size_hectares: Optional[float] = None
    primary_crops: List[str] = Field(default_factory=list)


class UserCreate(UserBase):
    """Schema for creating a new user (via Supabase Auth)."""
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    organization_name: Optional[str] = None
    farm_location: Optional[str] = None
    farm_size_hectares: Optional[float] = None
    primary_crops: Optional[List[str]] = None
    preferences: Optional[dict] = None


class UserAdminUpdate(UserUpdate):
    """Schema for admin updating user (includes role and status)."""
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    subscription_tier: Optional[str] = None
    subscription_expires_at: Optional[datetime] = None


class UserResponse(BaseModel):
    """Schema for user response."""
    id: str
    email: str
    full_name: Optional[str]
    phone: Optional[str]
    role: UserRole
    status: UserStatus
    avatar_url: Optional[str]
    bio: Optional[str]
    organization_name: Optional[str]
    farm_location: Optional[str]
    farm_size_hectares: Optional[float]
    primary_crops: List[str]
    preferences: dict
    subscription_tier: Optional[str]
    subscription_expires_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime]
    
    # Computed fields
    thread_count: Optional[int] = None
    farm_count: Optional[int] = None

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    """Schema for paginated user list."""
    users: List[UserResponse]
    total: int
    page: int
    page_size: int


# ==================== Farm Schemas ====================

class FarmZone(BaseModel):
    """Schema for farm zone."""
    id: str
    name: str
    crop: Optional[str] = None
    crop_variety: Optional[str] = None
    area_hectares: Optional[float] = None
    planting_date: Optional[str] = None
    growth_stage: Optional[str] = None
    sensors: List[str] = Field(default_factory=list)


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
    """Schema for creating a new farm."""
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
    """Schema for farm response."""
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
    
    # Optional: Include owner info
    owner_email: Optional[str] = None
    owner_name: Optional[str] = None

    model_config = {"from_attributes": True, "populate_by_name": True}


class FarmListResponse(BaseModel):
    """Schema for paginated farm list."""
    farms: List[FarmResponse]
    total: int
    page: int
    page_size: int


# ==================== Thread Schemas (Updated) ====================

class ThreadCreate(BaseModel):
    """Schema for creating a new thread."""
    title: Optional[str] = None
    farm_id: Optional[str] = None
    metadata_: dict = Field(default_factory=dict, alias="metadata")


class ThreadUpdate(BaseModel):
    """Schema for updating thread."""
    title: Optional[str] = None
    is_pinned: Optional[bool] = None
    farm_id: Optional[str] = None
    metadata_: Optional[dict] = Field(None, alias="metadata")


class ThreadResponse(BaseModel):
    """Schema for thread response."""
    id: str
    user_id: str
    farm_id: Optional[str]
    title: Optional[str]
    is_pinned: bool
    metadata_: dict = Field(alias="metadata")
    last_message_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    # Computed fields
    message_count: Optional[int] = None
    
    # Optional: Include farm info
    farm_name: Optional[str] = None

    model_config = {"from_attributes": True, "populate_by_name": True}


class ThreadListResponse(BaseModel):
    """Schema for paginated thread list."""
    threads: List[ThreadResponse]
    total: int
    page: int
    page_size: int


# ==================== Utility Schemas ====================

class PreferencesUpdate(BaseModel):
    """Schema for updating user preferences."""
    language: Optional[str] = None
    timezone: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    email_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    default_units: Optional[str] = Field(None, pattern="^(metric|imperial)$")
    theme: Optional[str] = Field(None, pattern="^(light|dark|auto)$")
    default_farm_id: Optional[str] = None


class UserStatsResponse(BaseModel):
    """Schema for user statistics."""
    total_threads: int
    active_threads: int
    total_messages: int
    total_farms: int
    active_farms: int
    last_activity: Optional[datetime]
    member_since: datetime
    total_agent_runs: int


class ErrorResponse(BaseModel):
    """Schema for error responses."""
    detail: str
    code: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
