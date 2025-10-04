"""Dashboard data router - Sensors, Alerts, Recommendations for zones"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.core.database import get_db
from src.core.auth import get_current_user
from src.models import (
    User, FarmZone, SensorReading, ZoneAlert, ZoneRecommendation
)
from src.schemas import (
    SensorReadingCreate, SensorReadingResponse, SensorReadingWithZone,
    ZoneAlertCreate, ZoneAlertUpdate, ZoneAlertResponse, ZoneAlertWithDetails,
    ZoneRecommendationCreate, ZoneRecommendationUpdate, 
    ZoneRecommendationResponse, ZoneRecommendationWithDetails,
)

router = APIRouter()


# ==================== Sensor Readings ====================

@router.get("/zones/{zone_id}/sensors", response_model=List[SensorReadingResponse])
async def get_zone_sensors(
    zone_id: UUID,
    limit: int = Query(default=10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get recent sensor readings for a zone"""
    # Verify zone exists and user has access
    result = await db.execute(
        select(FarmZone)
        .options(selectinload(FarmZone.farm))
        .where(FarmZone.id == zone_id)
    )
    zone = result.scalar_one_or_none()
    
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    if zone.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this zone")
    
    # Get sensor readings
    result = await db.execute(
        select(SensorReading)
        .where(SensorReading.zone_id == zone_id)
        .order_by(desc(SensorReading.reading_timestamp))
        .limit(limit)
    )
    readings = result.scalars().all()
    
    return readings


@router.get("/zones/{zone_id}/sensors/latest", response_model=Optional[SensorReadingResponse])
async def get_latest_sensor_reading(
    zone_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the latest sensor reading for a zone"""
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
    
    # Get latest reading
    result = await db.execute(
        select(SensorReading)
        .where(SensorReading.zone_id == zone_id)
        .order_by(desc(SensorReading.reading_timestamp))
        .limit(1)
    )
    reading = result.scalar_one_or_none()
    
    return reading


@router.post("/sensors", response_model=SensorReadingResponse, status_code=201)
async def create_sensor_reading(
    data: SensorReadingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new sensor reading"""
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
    
    # Create reading
    reading = SensorReading(**data.model_dump())
    db.add(reading)
    await db.commit()
    await db.refresh(reading)
    
    return reading


# ==================== Zone Alerts ====================

@router.get("/zones/{zone_id}/alerts", response_model=List[ZoneAlertResponse])
async def get_zone_alerts(
    zone_id: UUID,
    resolved: Optional[bool] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get alerts for a zone"""
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
    query = select(ZoneAlert).where(ZoneAlert.zone_id == zone_id)
    
    if resolved is not None:
        query = query.where(ZoneAlert.is_resolved == resolved)
    
    query = query.order_by(ZoneAlert.priority, desc(ZoneAlert.created_at))
    
    result = await db.execute(query)
    alerts = result.scalars().all()
    
    return alerts


@router.get("/farms/{farm_id}/alerts", response_model=List[ZoneAlertResponse])
async def get_farm_alerts(
    farm_id: UUID,
    resolved: Optional[bool] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all alerts for a farm"""
    # Get all zone IDs for the farm
    result = await db.execute(
        select(FarmZone.id)
        .join(FarmZone.farm)
        .where(FarmZone.farm_id == farm_id)
    )
    zone_ids = [row[0] for row in result.all()]
    
    if not zone_ids:
        return []
    
    # Build query
    query = select(ZoneAlert).where(ZoneAlert.zone_id.in_(zone_ids))
    
    if resolved is not None:
        query = query.where(ZoneAlert.is_resolved == resolved)
    
    query = query.order_by(ZoneAlert.priority, desc(ZoneAlert.created_at))
    
    result = await db.execute(query)
    alerts = result.scalars().all()
    
    return alerts


@router.post("/alerts", response_model=ZoneAlertResponse, status_code=201)
async def create_alert(
    data: ZoneAlertCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new alert"""
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
    
    # Create alert
    alert = ZoneAlert(**data.model_dump())
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    
    return alert


@router.patch("/alerts/{alert_id}", response_model=ZoneAlertResponse)
async def update_alert(
    alert_id: UUID,
    data: ZoneAlertUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an alert (e.g., resolve it)"""
    # Get alert
    result = await db.execute(
        select(ZoneAlert)
        .options(selectinload(ZoneAlert.zone).selectinload(FarmZone.farm))
        .where(ZoneAlert.id == alert_id)
    )
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    if alert.zone.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update alert
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(alert, field, value)
    
    await db.commit()
    await db.refresh(alert)
    
    return alert


@router.delete("/alerts/{alert_id}", status_code=204)
async def delete_alert(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an alert"""
    # Get alert
    result = await db.execute(
        select(ZoneAlert)
        .options(selectinload(ZoneAlert.zone).selectinload(FarmZone.farm))
        .where(ZoneAlert.id == alert_id)
    )
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    if alert.zone.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.delete(alert)
    await db.commit()
    
    return None


# ==================== Zone Recommendations ====================

@router.get("/zones/{zone_id}/recommendations", response_model=List[ZoneRecommendationResponse])
async def get_zone_recommendations(
    zone_id: UUID,
    active: Optional[bool] = Query(default=None),
    category: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get recommendations for a zone"""
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
    query = select(ZoneRecommendation).where(ZoneRecommendation.zone_id == zone_id)
    
    if active is not None:
        query = query.where(ZoneRecommendation.is_active == active)
    
    if category:
        query = query.where(ZoneRecommendation.category == category)
    
    query = query.order_by(desc(ZoneRecommendation.created_at))
    
    result = await db.execute(query)
    recommendations = result.scalars().all()
    
    return recommendations


@router.post("/recommendations", response_model=ZoneRecommendationResponse, status_code=201)
async def create_recommendation(
    data: ZoneRecommendationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new recommendation"""
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
    
    # Create recommendation
    recommendation = ZoneRecommendation(**data.model_dump())
    db.add(recommendation)
    await db.commit()
    await db.refresh(recommendation)
    
    return recommendation


@router.patch("/recommendations/{recommendation_id}", response_model=ZoneRecommendationResponse)
async def update_recommendation(
    recommendation_id: UUID,
    data: ZoneRecommendationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a recommendation (e.g., mark as applied, rate it)"""
    # Get recommendation
    result = await db.execute(
        select(ZoneRecommendation)
        .options(selectinload(ZoneRecommendation.zone).selectinload(FarmZone.farm))
        .where(ZoneRecommendation.id == recommendation_id)
    )
    recommendation = result.scalar_one_or_none()
    
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    if recommendation.zone.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update recommendation
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(recommendation, field, value)
    
    await db.commit()
    await db.refresh(recommendation)
    
    return recommendation


@router.delete("/recommendations/{recommendation_id}", status_code=204)
async def delete_recommendation(
    recommendation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a recommendation"""
    # Get recommendation
    result = await db.execute(
        select(ZoneRecommendation)
        .options(selectinload(ZoneRecommendation.zone).selectinload(FarmZone.farm))
        .where(ZoneRecommendation.id == recommendation_id)
    )
    recommendation = result.scalar_one_or_none()
    
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    if recommendation.zone.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.delete(recommendation)
    await db.commit()
    
    return None
