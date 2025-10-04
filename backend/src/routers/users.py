"""
Users router for user profile management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional

from src.core.database import get_db
from src.models import User, Thread, Farm, UserRole
from src.schemas import UserResponse, UserUpdate
from src.core.auth import get_current_user, AuthUser, require_role


router = APIRouter(tags=["users"])


async def get_user_with_counts(user_id, db: AsyncSession) -> tuple[User, int, int]:
    """Helper to fetch user with thread and farm counts."""
    # Fetch user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Get counts in parallel
    thread_count_result = await db.execute(
        select(func.count(Thread.id)).where(Thread.user_id == user.id)
    )
    farm_count_result = await db.execute(
        select(func.count(Farm.id)).where(Farm.owner_id == user.id)
    )
    
    thread_count = thread_count_result.scalar() or 0
    farm_count = farm_count_result.scalar() or 0
    
    return user, thread_count, farm_count


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current authenticated user's profile with stats."""
    user, thread_count, farm_count = await get_user_with_counts(current_user.id, db)
    return UserResponse.from_orm_with_counts(user, thread_count, farm_count)


@router.patch("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current authenticated user's profile."""
    # Fetch user
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Update fields
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    await db.commit()
    await db.refresh(user)
    
    return UserResponse.from_orm_with_counts(user)


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: str,
    current_user: AuthUser = Depends(require_role(UserRole.agronomist)),
    db: AsyncSession = Depends(get_db),
):
    """Get user by ID (agronomist and admin only)."""
    user, thread_count, farm_count = await get_user_with_counts(user_id, db)
    return UserResponse.from_orm_with_counts(user, thread_count, farm_count)
