"""Pydantic schemas for API validation."""

from src.schemas.user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserAdminUpdate,
    UserResponse,
    UserListResponse,
    PreferencesUpdate,
    UserStatsResponse,
    LoginRequest,
    LoginResponse,
)
from src.schemas.farm import (
    FarmBase,
    FarmCreate,
    FarmUpdate,
    FarmResponse,
    FarmListResponse,
    FarmZone,
)
from src.schemas.crop import (
    CropBase,
    CropCreate,
    CropUpdate,
    CropResponse,
)
from src.schemas.farm_zone import (
    FarmZoneBase,
    FarmZoneCreate,
    FarmZoneUpdate,
    FarmZoneResponse,
    FarmZoneWithCrop,
)
from src.schemas.farm_crop import (
    FarmCropBase,
    FarmCropCreate,
    FarmCropUpdate,
    FarmCropResponse,
    FarmCropWithDetails,
)
from src.schemas.thread import (
    ThreadCreate,
    ThreadUpdate,
    ThreadResponse,
    ThreadListResponse,
)
from src.schemas.common import (
    ErrorResponse,
)

__all__ = [
    # User schemas
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserAdminUpdate",
    "UserResponse",
    "UserListResponse",
    "PreferencesUpdate",
    "UserStatsResponse",
    "LoginRequest",
    "LoginResponse",
    # Farm schemas
    "FarmBase",
    "FarmCreate",
    "FarmUpdate",
    "FarmResponse",
    "FarmListResponse",
    "FarmZone",
    # Crop schemas
    "CropBase",
    "CropCreate",
    "CropUpdate",
    "CropResponse",
    # Farm Zone schemas
    "FarmZoneBase",
    "FarmZoneCreate",
    "FarmZoneUpdate",
    "FarmZoneResponse",
    "FarmZoneWithCrop",
    # Farm Crop schemas
    "FarmCropBase",
    "FarmCropCreate",
    "FarmCropUpdate",
    "FarmCropResponse",
    "FarmCropWithDetails",
    # Thread schemas
    "ThreadCreate",
    "ThreadUpdate",
    "ThreadResponse",
    "ThreadListResponse",
    # Common schemas
    "ErrorResponse",
]

