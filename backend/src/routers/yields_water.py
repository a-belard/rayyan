"""Yields and water management router"""
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, desc, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.core.database import get_db
from src.core.auth import get_current_user
from src.models import (
    User, Farm, FarmZone, YieldRecord, WaterUsage, WaterStorage, IrrigationSchedule
)
from src.schemas import (
    YieldRecordCreate, YieldRecordUpdate, YieldRecordResponse,
    WaterUsageCreate, WaterUsageResponse, WaterStorageCreate, 
    WaterStorageUpdate, WaterStorageResponse,
    IrrigationScheduleCreate, IrrigationScheduleUpdate, IrrigationScheduleResponse,
)

router = APIRouter()


# ==================== Yield Records ====================

@router.get("/zones/{zone_id}/yields", response_model=List[YieldRecordResponse])
async def get_zone_yields(
    zone_id: UUID,
    limit: int = Query(default=10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get yield records for a zone"""
    # Verify zone access
    result = await db.execute(
        select(FarmZone)
        .options(selectinload(FarmZone.farm))
        .where(FarmZone.id == zone_id)
    )
    zone = result.scalar_one_or_none()
    
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    if zone.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get yields
    result = await db.execute(
        select(YieldRecord)
        .where(YieldRecord.zone_id == zone_id)
        .order_by(desc(YieldRecord.harvest_date))
        .limit(limit)
    )
    yields = result.scalars().all()
    
    return yields


@router.get("/farms/{farm_id}/yields/summary")
async def get_farm_yield_summary(
    farm_id: UUID,
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get yield summary for a farm"""
    # Verify farm access
    result = await db.execute(
        select(Farm).where(Farm.id == farm_id)
    )
    farm = result.scalar_one_or_none()
    
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    if farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get zone IDs
    result = await db.execute(
        select(FarmZone.id).where(FarmZone.farm_id == farm_id)
    )
    zone_ids = [row[0] for row in result.all()]
    
    if not zone_ids:
        return {"total_amount": 0, "total_harvests": 0, "by_zone": []}
    
    # Build query
    query = select(YieldRecord).where(YieldRecord.zone_id.in_(zone_ids))
    
    if start_date:
        query = query.where(YieldRecord.harvest_date >= start_date)
    if end_date:
        query = query.where(YieldRecord.harvest_date <= end_date)
    
    result = await db.execute(query)
    yields = result.scalars().all()
    
    # Calculate summary
    total_amount = sum(y.amount for y in yields)
    total_harvests = len(yields)
    
    # Group by zone
    by_zone = {}
    for y in yields:
        if y.zone_id not in by_zone:
            by_zone[y.zone_id] = {"amount": 0, "count": 0}
        by_zone[y.zone_id]["amount"] += y.amount
        by_zone[y.zone_id]["count"] += 1
    
    return {
        "total_amount": total_amount,
        "total_harvests": total_harvests,
        "by_zone": [{"zone_id": str(k), **v} for k, v in by_zone.items()]
    }


@router.post("/yields", response_model=YieldRecordResponse, status_code=201)
async def create_yield_record(
    data: YieldRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new yield record"""
    # Verify zone access
    result = await db.execute(
        select(FarmZone)
        .options(selectinload(FarmZone.farm))
        .where(FarmZone.id == data.zone_id)
    )
    zone = result.scalar_one_or_none()
    
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    if zone.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Create yield record
    yield_record = YieldRecord(**data.model_dump())
    db.add(yield_record)
    await db.commit()
    await db.refresh(yield_record)
    
    return yield_record


@router.patch("/yields/{yield_id}", response_model=YieldRecordResponse)
async def update_yield_record(
    yield_id: UUID,
    data: YieldRecordUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a yield record"""
    # Get yield record
    result = await db.execute(
        select(YieldRecord)
        .options(selectinload(YieldRecord.zone).selectinload(FarmZone.farm))
        .where(YieldRecord.id == yield_id)
    )
    yield_record = result.scalar_one_or_none()
    
    if not yield_record:
        raise HTTPException(status_code=404, detail="Yield record not found")
    
    if yield_record.zone.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(yield_record, field, value)
    
    await db.commit()
    await db.refresh(yield_record)
    
    return yield_record


@router.delete("/yields/{yield_id}", status_code=204)
async def delete_yield_record(
    yield_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a yield record"""
    # Get yield record
    result = await db.execute(
        select(YieldRecord)
        .options(selectinload(YieldRecord.zone).selectinload(FarmZone.farm))
        .where(YieldRecord.id == yield_id)
    )
    yield_record = result.scalar_one_or_none()
    
    if not yield_record:
        raise HTTPException(status_code=404, detail="Yield record not found")
    
    if yield_record.zone.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.delete(yield_record)
    await db.commit()
    
    return None


# ==================== Water Usage ====================

@router.get("/zones/{zone_id}/water-usage", response_model=List[WaterUsageResponse])
async def get_zone_water_usage(
    zone_id: UUID,
    days: int = Query(default=7, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get water usage for a zone"""
    # Verify zone access
    result = await db.execute(
        select(FarmZone)
        .options(selectinload(FarmZone.farm))
        .where(FarmZone.id == zone_id)
    )
    zone = result.scalar_one_or_none()
    
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    if zone.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get usage
    cutoff_date = date.today() - timedelta(days=days)
    result = await db.execute(
        select(WaterUsage)
        .where(
            WaterUsage.zone_id == zone_id,
            WaterUsage.usage_date >= cutoff_date
        )
        .order_by(desc(WaterUsage.usage_date))
    )
    usage = result.scalars().all()
    
    return usage


@router.get("/farms/{farm_id}/water-usage/stats")
async def get_farm_water_stats(
    farm_id: UUID,
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get water usage statistics for a farm"""
    # Verify farm access
    result = await db.execute(
        select(Farm).where(Farm.id == farm_id)
    )
    farm = result.scalar_one_or_none()
    
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    if farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get zone IDs
    result = await db.execute(
        select(FarmZone.id).where(FarmZone.farm_id == farm_id)
    )
    zone_ids = [row[0] for row in result.all()]
    
    if not zone_ids:
        return {"total_usage": 0, "average_daily": 0, "total_cost": 0}
    
    # Build query
    query = select(WaterUsage).where(WaterUsage.zone_id.in_(zone_ids))
    
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    if not end_date:
        end_date = date.today()
    
    query = query.where(
        WaterUsage.usage_date >= start_date,
        WaterUsage.usage_date <= end_date
    )
    
    result = await db.execute(query)
    usage = result.scalars().all()
    
    # Calculate stats
    total_usage = sum(u.amount for u in usage)
    total_cost = sum(u.cost or 0 for u in usage)
    days_count = (end_date - start_date).days + 1
    average_daily = total_usage / days_count if days_count > 0 else 0
    
    return {
        "total_usage": total_usage,
        "average_daily": average_daily,
        "total_cost": total_cost,
        "start_date": start_date,
        "end_date": end_date,
    }


@router.post("/water-usage", response_model=WaterUsageResponse, status_code=201)
async def record_water_usage(
    data: WaterUsageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Record water usage"""
    # Verify zone access
    result = await db.execute(
        select(FarmZone)
        .options(selectinload(FarmZone.farm))
        .where(FarmZone.id == data.zone_id)
    )
    zone = result.scalar_one_or_none()
    
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    if zone.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Create usage record
    usage = WaterUsage(**data.model_dump())
    db.add(usage)
    await db.commit()
    await db.refresh(usage)
    
    return usage


# ==================== Water Storage ====================

@router.get("/farms/{farm_id}/water-storage", response_model=List[WaterStorageResponse])
async def get_farm_water_storage(
    farm_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get water storage tanks for a farm"""
    # Verify farm access
    result = await db.execute(
        select(Farm).where(Farm.id == farm_id)
    )
    farm = result.scalar_one_or_none()
    
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    if farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get storage
    result = await db.execute(
        select(WaterStorage)
        .where(WaterStorage.farm_id == farm_id, WaterStorage.is_active == True)
        .order_by(WaterStorage.name)
    )
    storage = result.scalars().all()
    
    return storage


@router.patch("/water-storage/{storage_id}", response_model=WaterStorageResponse)
async def update_water_storage(
    storage_id: UUID,
    data: WaterStorageUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update water storage (e.g., update level)"""
    # Get storage
    result = await db.execute(
        select(WaterStorage)
        .options(selectinload(WaterStorage.farm))
        .where(WaterStorage.id == storage_id)
    )
    storage = result.scalar_one_or_none()
    
    if not storage:
        raise HTTPException(status_code=404, detail="Water storage not found")
    
    if storage.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(storage, field, value)
    
    await db.commit()
    await db.refresh(storage)
    
    return storage


# ==================== Irrigation Schedules ====================

@router.get("/zones/{zone_id}/irrigation", response_model=List[IrrigationScheduleResponse])
async def get_zone_irrigation_schedules(
    zone_id: UUID,
    status: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get irrigation schedules for a zone"""
    # Verify zone access
    result = await db.execute(
        select(FarmZone)
        .options(selectinload(FarmZone.farm))
        .where(FarmZone.id == zone_id)
    )
    zone = result.scalar_one_or_none()
    
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    if zone.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Build query
    query = select(IrrigationSchedule).where(IrrigationSchedule.zone_id == zone_id)
    
    if status:
        query = query.where(IrrigationSchedule.status == status)
    
    query = query.order_by(IrrigationSchedule.scheduled_time)
    
    result = await db.execute(query)
    schedules = result.scalars().all()
    
    return schedules


@router.post("/irrigation", response_model=IrrigationScheduleResponse, status_code=201)
async def create_irrigation_schedule(
    data: IrrigationScheduleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create an irrigation schedule"""
    # Verify zone access
    result = await db.execute(
        select(FarmZone)
        .options(selectinload(FarmZone.farm))
        .where(FarmZone.id == data.zone_id)
    )
    zone = result.scalar_one_or_none()
    
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    if zone.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Create schedule
    schedule = IrrigationSchedule(**data.model_dump())
    db.add(schedule)
    await db.commit()
    await db.refresh(schedule)
    
    return schedule


@router.patch("/irrigation/{schedule_id}", response_model=IrrigationScheduleResponse)
async def update_irrigation_schedule(
    schedule_id: UUID,
    data: IrrigationScheduleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an irrigation schedule"""
    # Get schedule
    result = await db.execute(
        select(IrrigationSchedule)
        .options(selectinload(IrrigationSchedule.zone).selectinload(FarmZone.farm))
        .where(IrrigationSchedule.id == schedule_id)
    )
    schedule = result.scalar_one_or_none()
    
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    if schedule.zone.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(schedule, field, value)
    
    await db.commit()
    await db.refresh(schedule)
    
    return schedule
