"""Thread-related Pydantic schemas."""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class ThreadCreate(BaseModel):
    """Schema for creating thread."""
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
    """Thread response with farm info."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    
    id: str
    user_id: str
    farm_id: Optional[str]
    title: Optional[str]
    is_pinned: bool
    metadata_: dict = Field(alias="metadata")
    last_message_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = None
    farm_name: Optional[str] = None


class ThreadListResponse(BaseModel):
    """Paginated thread list response."""
    threads: List[ThreadResponse]
    total: int
    page: int
    page_size: int
