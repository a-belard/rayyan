"""Pesticide inventory router"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.core.database import get_db
from src.core.auth import get_current_user
from src.models import User, Farm, PesticideInventory
from src.schemas import (
    PesticideInventoryCreate, PesticideInventoryUpdate, 
    PesticideInventoryResponse, PesticideInventoryWithStatus
)

router = APIRouter()


@router.get("/farms/{farm_id}/pesticides", response_model=List[PesticideInventoryResponse])
async def list_pesticides(
    farm_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all pesticides for a farm"""
    # Verify farm access
    result = await db.execute(
        select(Farm).where(Farm.id == farm_id)
    )
    farm = result.scalar_one_or_none()
    
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    if farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get pesticides
    result = await db.execute(
        select(PesticideInventory)
        .where(
            PesticideInventory.farm_id == farm_id,
            PesticideInventory.is_active == True
        )
        .order_by(PesticideInventory.name)
    )
    pesticides = result.scalars().all()
    
    return pesticides


@router.get("/farms/{farm_id}/pesticides/reorder", response_model=List[PesticideInventoryResponse])
async def list_pesticides_needing_reorder(
    farm_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get pesticides that need reordering"""
    # Verify farm access
    result = await db.execute(
        select(Farm).where(Farm.id == farm_id)
    )
    farm = result.scalar_one_or_none()
    
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    if farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get pesticides needing reorder
    result = await db.execute(
        select(PesticideInventory)
        .where(
            PesticideInventory.farm_id == farm_id,
            PesticideInventory.is_active == True,
            PesticideInventory.current_stock <= PesticideInventory.reorder_threshold
        )
        .order_by(PesticideInventory.current_stock)
    )
    pesticides = result.scalars().all()
    
    return pesticides


@router.get("/pesticides/{pesticide_id}", response_model=PesticideInventoryResponse)
async def get_pesticide(
    pesticide_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific pesticide"""
    result = await db.execute(
        select(PesticideInventory)
        .options(selectinload(PesticideInventory.farm))
        .where(PesticideInventory.id == pesticide_id)
    )
    pesticide = result.scalar_one_or_none()
    
    if not pesticide:
        raise HTTPException(status_code=404, detail="Pesticide not found")
    
    if pesticide.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return pesticide


@router.post("/pesticides", response_model=PesticideInventoryResponse, status_code=201)
async def create_pesticide(
    data: PesticideInventoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new pesticide inventory item"""
    # Verify farm access
    result = await db.execute(
        select(Farm).where(Farm.id == data.farm_id)
    )
    farm = result.scalar_one_or_none()
    
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    if farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Create pesticide
    pesticide = PesticideInventory(**data.model_dump())
    db.add(pesticide)
    await db.commit()
    await db.refresh(pesticide)
    
    return pesticide


@router.patch("/pesticides/{pesticide_id}", response_model=PesticideInventoryResponse)
async def update_pesticide(
    pesticide_id: UUID,
    data: PesticideInventoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a pesticide inventory item"""
    # Get pesticide
    result = await db.execute(
        select(PesticideInventory)
        .options(selectinload(PesticideInventory.farm))
        .where(PesticideInventory.id == pesticide_id)
    )
    pesticide = result.scalar_one_or_none()
    
    if not pesticide:
        raise HTTPException(status_code=404, detail="Pesticide not found")
    
    if pesticide.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(pesticide, field, value)
    
    await db.commit()
    await db.refresh(pesticide)
    
    return pesticide


@router.delete("/pesticides/{pesticide_id}", status_code=204)
async def delete_pesticide(
    pesticide_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a pesticide (soft delete by setting is_active=False)"""
    # Get pesticide
    result = await db.execute(
        select(PesticideInventory)
        .options(selectinload(PesticideInventory.farm))
        .where(PesticideInventory.id == pesticide_id)
    )
    pesticide = result.scalar_one_or_none()
    
    if not pesticide:
        raise HTTPException(status_code=404, detail="Pesticide not found")
    
    if pesticide.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Soft delete
    pesticide.is_active = False
    await db.commit()
    
    return None
