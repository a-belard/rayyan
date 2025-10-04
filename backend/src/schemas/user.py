"""User-related Pydantic schemas."""

from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime
from src.models import UserRole


class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole = UserRole.farmer
    organization_name: Optional[str] = None
    farm_location: Optional[str] = None
    farm_size_hectares: Optional[float] = Field(None, gt=0)


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=8)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v


class LoginRequest(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str = Field(..., min_length=1)


class LoginResponse(BaseModel):
    """Schema for login response."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    refresh_token: str
    user: dict


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    organization_name: Optional[str] = None
    farm_location: Optional[str] = None
    farm_size_hectares: Optional[float] = Field(None, gt=0)
    preferences: Optional[dict] = None


class UserAdminUpdate(UserUpdate):
    """Schema for admin-only user updates."""
    role: Optional[UserRole] = None
    subscription_tier: Optional[str] = None
    subscription_expires_at: Optional[datetime] = None


class UserResponse(BaseModel):
    """User profile response with stats."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    email: str
    full_name: Optional[str]
    phone: Optional[str]
    role: UserRole
    avatar_url: Optional[str]
    organization_name: Optional[str]
    farm_location: Optional[str]
    farm_size_hectares: Optional[float]
    preferences: dict
    subscription_tier: Optional[str]
    subscription_expires_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime]
    thread_count: Optional[int] = None
    farm_count: Optional[int] = None
    
    @classmethod
    def from_orm_with_counts(cls, user, thread_count: int = 0, farm_count: int = 0):
        """Helper to create response with computed counts."""
        return cls(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            role=user.role,
            avatar_url=user.avatar_url,
            organization_name=user.organization_name,
            farm_location=user.farm_location,
            farm_size_hectares=user.farm_size_hectares,
            preferences=user.preferences,
            subscription_tier=user.subscription_tier,
            subscription_expires_at=user.subscription_expires_at,
            created_at=user.created_at,
            updated_at=user.updated_at,
            last_login_at=user.last_login_at,
            thread_count=thread_count,
            farm_count=farm_count,
        )


class UserListResponse(BaseModel):
    """Paginated user list response."""
    users: List[UserResponse]
    total: int
    page: int
    page_size: int


class PreferencesUpdate(BaseModel):
    """User preferences update."""
    language: Optional[str] = None
    timezone: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    email_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    default_units: Optional[str] = Field(None, pattern="^(metric|imperial)$")
    theme: Optional[str] = Field(None, pattern="^(light|dark|auto)$")
    default_farm_id: Optional[str] = None


class UserStatsResponse(BaseModel):
    """User statistics summary."""
    total_threads: int
    active_threads: int
    total_messages: int
    total_farms: int
    active_farms: int
    last_activity: Optional[datetime]
    member_since: datetime
    total_agent_runs: int
