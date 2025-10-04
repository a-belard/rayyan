"""Team members router"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.core.database import get_db
from src.core.auth import get_current_user
from src.models import User, Farm, TeamMember, FarmTask
from src.schemas import (
    TeamMemberCreate, TeamMemberUpdate, TeamMemberResponse, TeamMemberWithDetails
)

router = APIRouter()


@router.get("/farms/{farm_id}/team", response_model=List[TeamMemberResponse])
async def list_team_members(
    farm_id: UUID,
    status: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all team members for a farm"""
    # Verify farm access
    result = await db.execute(
        select(Farm).where(Farm.id == farm_id)
    )
    farm = result.scalar_one_or_none()
    
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    if farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this farm")
    
    # Build query
    query = select(TeamMember).where(
        TeamMember.farm_id == farm_id,
        TeamMember.is_active == True
    )
    
    if status:
        query = query.where(TeamMember.status == status)
    
    query = query.order_by(TeamMember.name)
    
    result = await db.execute(query)
    members = result.scalars().all()
    
    return members


@router.get("/team/{member_id}", response_model=TeamMemberResponse)
async def get_team_member(
    member_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific team member"""
    result = await db.execute(
        select(TeamMember)
        .options(selectinload(TeamMember.farm))
        .where(TeamMember.id == member_id)
    )
    member = result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    if member.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return member


@router.post("/team", response_model=TeamMemberResponse, status_code=201)
async def create_team_member(
    data: TeamMemberCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new team member"""
    # Verify farm access
    result = await db.execute(
        select(Farm).where(Farm.id == data.farm_id)
    )
    farm = result.scalar_one_or_none()
    
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    if farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Create member
    member = TeamMember(**data.model_dump())
    db.add(member)
    await db.commit()
    await db.refresh(member)
    
    return member


@router.patch("/team/{member_id}", response_model=TeamMemberResponse)
async def update_team_member(
    member_id: UUID,
    data: TeamMemberUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a team member"""
    # Get member
    result = await db.execute(
        select(TeamMember)
        .options(selectinload(TeamMember.farm))
        .where(TeamMember.id == member_id)
    )
    member = result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    if member.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update member
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(member, field, value)
    
    await db.commit()
    await db.refresh(member)
    
    return member


@router.delete("/team/{member_id}", status_code=204)
async def delete_team_member(
    member_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a team member (soft delete by setting is_active=False)"""
    # Get member
    result = await db.execute(
        select(TeamMember)
        .options(selectinload(TeamMember.farm))
        .where(TeamMember.id == member_id)
    )
    member = result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    if member.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Soft delete
    member.is_active = False
    await db.commit()
    
    return None


@router.get("/team/{member_id}/tasks", response_model=List[dict])
async def get_member_tasks(
    member_id: UUID,
    status: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get tasks assigned to a team member"""
    # Verify member access
    result = await db.execute(
        select(TeamMember)
        .options(selectinload(TeamMember.farm))
        .where(TeamMember.id == member_id)
    )
    member = result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    if member.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get tasks
    query = select(FarmTask).where(FarmTask.assigned_to == member_id)
    
    if status:
        query = query.where(FarmTask.status == status)
    
    query = query.order_by(FarmTask.due_date)
    
    result = await db.execute(query)
    tasks = result.scalars().all()
    
    return tasks
