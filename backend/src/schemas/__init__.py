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
from src.schemas.sensor_reading import (
    SensorReadingBase,
    SensorReadingCreate,
    SensorReadingUpdate,
    SensorReadingResponse,
    SensorReadingWithZone,
)
from src.schemas.team_member import (
    TeamMemberBase,
    TeamMemberCreate,
    TeamMemberUpdate,
    TeamMemberResponse,
    TeamMemberWithDetails,
)
from src.schemas.farm_task import (
    FarmTaskBase,
    FarmTaskCreate,
    FarmTaskUpdate,
    FarmTaskResponse,
    FarmTaskWithDetails,
)
from src.schemas.yield_record import (
    YieldRecordBase,
    YieldRecordCreate,
    YieldRecordUpdate,
    YieldRecordResponse,
    YieldRecordWithZone,
)
from src.schemas.water import (
    WaterUsageBase,
    WaterUsageCreate,
    WaterUsageUpdate,
    WaterUsageResponse,
    WaterUsageWithZone,
    WaterStorageBase,
    WaterStorageCreate,
    WaterStorageUpdate,
    WaterStorageResponse,
    IrrigationScheduleBase,
    IrrigationScheduleCreate,
    IrrigationScheduleUpdate,
    IrrigationScheduleResponse,
    IrrigationScheduleWithZone,
)
from src.schemas.pesticide_inventory import (
    PesticideInventoryBase,
    PesticideInventoryCreate,
    PesticideInventoryUpdate,
    PesticideInventoryResponse,
    PesticideInventoryWithStatus,
)
from src.schemas.zone_data import (
    ZoneAlertBase,
    ZoneAlertCreate,
    ZoneAlertUpdate,
    ZoneAlertResponse,
    ZoneAlertWithDetails,
    ZoneRecommendationBase,
    ZoneRecommendationCreate,
    ZoneRecommendationUpdate,
    ZoneRecommendationResponse,
    ZoneRecommendationWithDetails,
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
    # Sensor Reading schemas
    "SensorReadingBase",
    "SensorReadingCreate",
    "SensorReadingUpdate",
    "SensorReadingResponse",
    "SensorReadingWithZone",
    # Team Member schemas
    "TeamMemberBase",
    "TeamMemberCreate",
    "TeamMemberUpdate",
    "TeamMemberResponse",
    "TeamMemberWithDetails",
    # Farm Task schemas
    "FarmTaskBase",
    "FarmTaskCreate",
    "FarmTaskUpdate",
    "FarmTaskResponse",
    "FarmTaskWithDetails",
    # Yield Record schemas
    "YieldRecordBase",
    "YieldRecordCreate",
    "YieldRecordUpdate",
    "YieldRecordResponse",
    "YieldRecordWithZone",
    # Water schemas
    "WaterUsageBase",
    "WaterUsageCreate",
    "WaterUsageUpdate",
    "WaterUsageResponse",
    "WaterUsageWithZone",
    "WaterStorageBase",
    "WaterStorageCreate",
    "WaterStorageUpdate",
    "WaterStorageResponse",
    "IrrigationScheduleBase",
    "IrrigationScheduleCreate",
    "IrrigationScheduleUpdate",
    "IrrigationScheduleResponse",
    "IrrigationScheduleWithZone",
    # Pesticide Inventory schemas
    "PesticideInventoryBase",
    "PesticideInventoryCreate",
    "PesticideInventoryUpdate",
    "PesticideInventoryResponse",
    "PesticideInventoryWithStatus",
    # Zone Data schemas
    "ZoneAlertBase",
    "ZoneAlertCreate",
    "ZoneAlertUpdate",
    "ZoneAlertResponse",
    "ZoneAlertWithDetails",
    "ZoneRecommendationBase",
    "ZoneRecommendationCreate",
    "ZoneRecommendationUpdate",
    "ZoneRecommendationResponse",
    "ZoneRecommendationWithDetails",
    # Common schemas
    "ErrorResponse",
]

