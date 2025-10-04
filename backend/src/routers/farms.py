"""
Farms router for farm/field management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from src.core.database import get_db
from src.models import Farm
from src.schemas import FarmCreate, FarmUpdate, FarmResponse
from src.core.auth import get_current_user, AuthUser, verify_farm_ownership


router = APIRouter(tags=["farms"])


@router.get("/farms", response_model=List[FarmResponse])
async def list_user_farms(
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List all farms owned by current user.
    """
    result = await db.execute(
        select(Farm)
        .where(Farm.owner_id == current_user.id)
        .where(Farm.is_active == True)
        .order_by(Farm.created_at.desc())
    )
    farms = result.scalars().all()
    
    return [
        FarmResponse(
            id=str(farm.id),
            owner_id=str(farm.owner_id),
            name=farm.name,
            location=farm.location,
            latitude=farm.latitude,
            longitude=farm.longitude,
            size_hectares=farm.size_hectares,
            soil_type=farm.soil_type,
            irrigation_type=farm.irrigation_type,
            crops=farm.crops,
            zones=farm.zones,
            metadata=farm.metadata_,
            is_active=farm.is_active,
            created_at=farm.created_at,
            updated_at=farm.updated_at,
        )
        for farm in farms
    ]


@router.post("/farms", response_model=FarmResponse, status_code=status.HTTP_201_CREATED)
async def create_farm(
    farm_data: FarmCreate,
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new farm for current user.
    """
    farm = Farm(
        id=uuid.uuid4(),
        owner_id=current_user.id,
        name=farm_data.name,
        location=farm_data.location,
        latitude=farm_data.latitude,
        longitude=farm_data.longitude,
        size_hectares=farm_data.size_hectares,
        soil_type=farm_data.soil_type,
        irrigation_type=farm_data.irrigation_type,
        crops=farm_data.crops,
        zones=[zone.model_dump() for zone in farm_data.zones],
        metadata_=farm_data.metadata_,
        is_active=True,
    )
    
    db.add(farm)
    await db.commit()
    await db.refresh(farm)
    
    return FarmResponse(
        id=str(farm.id),
        owner_id=str(farm.owner_id),
        name=farm.name,
        location=farm.location,
        latitude=farm.latitude,
        longitude=farm.longitude,
        size_hectares=farm.size_hectares,
        soil_type=farm.soil_type,
        irrigation_type=farm.irrigation_type,
        crops=farm.crops,
        zones=farm.zones,
        metadata=farm.metadata_,
        is_active=farm.is_active,
        created_at=farm.created_at,
        updated_at=farm.updated_at,
    )


@router.get("/farms/{farm_id}", response_model=FarmResponse)
async def get_farm(
    farm_id: str,
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get farm by ID.
    """
    result = await db.execute(
        select(Farm).where(Farm.id == farm_id)
    )
    farm = result.scalar_one_or_none()
    
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found",
        )
    
    # Verify ownership
    await verify_farm_ownership(farm_id, current_user, db)
    
    return FarmResponse(
        id=str(farm.id),
        owner_id=str(farm.owner_id),
        name=farm.name,
        location=farm.location,
        latitude=farm.latitude,
        longitude=farm.longitude,
        size_hectares=farm.size_hectares,
        soil_type=farm.soil_type,
        irrigation_type=farm.irrigation_type,
        crops=farm.crops,
        zones=farm.zones,
        metadata=farm.metadata_,
        is_active=farm.is_active,
        created_at=farm.created_at,
        updated_at=farm.updated_at,
    )


@router.patch("/farms/{farm_id}", response_model=FarmResponse)
async def update_farm(
    farm_id: str,
    farm_update: FarmUpdate,
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update farm by ID.
    """
    # Verify ownership
    await verify_farm_ownership(farm_id, current_user, db)
    
    result = await db.execute(
        select(Farm).where(Farm.id == farm_id)
    )
    farm = result.scalar_one_or_none()
    
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found",
        )
    
    # Update fields
    update_data = farm_update.model_dump(exclude_unset=True)
    if "zones" in update_data and update_data["zones"] is not None:
        update_data["zones"] = [zone.model_dump() if hasattr(zone, "model_dump") else zone for zone in update_data["zones"]]
    
    for field, value in update_data.items():
        setattr(farm, field, value)
    
    await db.commit()
    await db.refresh(farm)
    
    return FarmResponse(
        id=str(farm.id),
        owner_id=str(farm.owner_id),
        name=farm.name,
        location=farm.location,
        latitude=farm.latitude,
        longitude=farm.longitude,
        size_hectares=farm.size_hectares,
        soil_type=farm.soil_type,
        irrigation_type=farm.irrigation_type,
        crops=farm.crops,
        zones=farm.zones,
        metadata=farm.metadata_,
        is_active=farm.is_active,
        created_at=farm.created_at,
        updated_at=farm.updated_at,
    )


@router.delete("/farms/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_farm(
    farm_id: str,
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Soft delete farm by ID (marks as inactive).
    """
    # Verify ownership
    await verify_farm_ownership(farm_id, current_user, db)
    
    result = await db.execute(
        select(Farm).where(Farm.id == farm_id)
    )
    farm = result.scalar_one_or_none()
    
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found",
        )
    
    # Soft delete
    farm.is_active = False
    
    await db.commit()
    
    return None
