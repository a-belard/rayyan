"""Farm tasks router"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.core.database import get_db
from src.core.auth import get_current_user
from src.models import User, Farm, FarmTask
from src.schemas import (
    FarmTaskCreate, FarmTaskUpdate, FarmTaskResponse, FarmTaskWithDetails
)

router = APIRouter()


@router.get("/farms/{farm_id}/tasks", response_model=List[FarmTaskResponse])
async def list_farm_tasks(
    farm_id: UUID,
    status: Optional[str] = Query(default=None),
    priority: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all tasks for a farm"""
    # Verify farm access
    result = await db.execute(
        select(Farm).where(Farm.id == farm_id)
    )
    farm = result.scalar_one_or_none()
    
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    if farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Build query
    query = select(FarmTask).where(FarmTask.farm_id == farm_id)
    
    if status:
        query = query.where(FarmTask.status == status)
    
    if priority:
        query = query.where(FarmTask.priority == priority)
    
    query = query.order_by(FarmTask.due_date, desc(FarmTask.created_at))
    
    result = await db.execute(query)
    tasks = result.scalars().all()
    
    return tasks


@router.get("/tasks/{task_id}", response_model=FarmTaskResponse)
async def get_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific task"""
    result = await db.execute(
        select(FarmTask)
        .options(selectinload(FarmTask.farm))
        .where(FarmTask.id == task_id)
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return task


@router.post("/tasks", response_model=FarmTaskResponse, status_code=201)
async def create_task(
    data: FarmTaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new task"""
    # Verify farm access
    result = await db.execute(
        select(Farm).where(Farm.id == data.farm_id)
    )
    farm = result.scalar_one_or_none()
    
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    if farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Set created_by if not provided
    task_data = data.model_dump()
    if not task_data.get('created_by'):
        task_data['created_by'] = current_user.id
    
    # Create task
    task = FarmTask(**task_data)
    db.add(task)
    await db.commit()
    await db.refresh(task)
    
    return task


@router.patch("/tasks/{task_id}", response_model=FarmTaskResponse)
async def update_task(
    task_id: UUID,
    data: FarmTaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a task"""
    # Get task
    result = await db.execute(
        select(FarmTask)
        .options(selectinload(FarmTask.farm))
        .where(FarmTask.id == task_id)
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update task
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    
    await db.commit()
    await db.refresh(task)
    
    return task


@router.delete("/tasks/{task_id}", status_code=204)
async def delete_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a task"""
    # Get task
    result = await db.execute(
        select(FarmTask)
        .options(selectinload(FarmTask.farm))
        .where(FarmTask.id == task_id)
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.delete(task)
    await db.commit()
    
    return None
