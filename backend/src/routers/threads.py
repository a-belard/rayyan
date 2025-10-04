"""
API routes for chat threads management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from pydantic import BaseModel
from datetime import datetime

from src.core.database import get_db
from src.models import Thread, MessageRole


router = APIRouter(prefix="/threads", tags=["threads"])


# --- Schemas ---

class ThreadCreate(BaseModel):
    """Request to create a new thread."""
    title: str | None = None
    metadata: dict = {}


class ThreadUpdate(BaseModel):
    """Request to update a thread."""
    title: str | None = None
    is_pinned: bool | None = None


class ThreadResponse(BaseModel):
    """Thread response model."""
    id: str
    user_id: str
    title: str | None
    is_pinned: bool
    metadata: dict
    last_message_at: datetime | None
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    class Config:
        from_attributes = True


# --- Routes ---

@router.get("/", response_model=List[ThreadResponse])
async def list_threads(
    user_id: str,  # TODO: Get from auth dependency
    db: AsyncSession = Depends(get_db)
):
    """List all threads for the current user."""
    stmt = (
        select(Thread)
        .where(Thread.user_id == user_id)
        .order_by(Thread.last_message_at.desc().nullslast(), Thread.created_at.desc())
    )
    result = await db.execute(stmt)
    threads = result.scalars().all()
    
    response = []
    for thread in threads:
        # Count messages
        from src.models import Message
        count_stmt = select(func.count()).select_from(Message).where(Message.thread_id == thread.id)
        count_result = await db.execute(count_stmt)
        msg_count = count_result.scalar() or 0
        
        thread_dict = {
            "id": str(thread.id),
            "user_id": str(thread.user_id),
            "title": thread.title,
            "is_pinned": thread.is_pinned,
            "metadata": thread.metadata_,
            "last_message_at": thread.last_message_at,
            "created_at": thread.created_at,
            "updated_at": thread.updated_at,
            "message_count": msg_count,
        }
        response.append(ThreadResponse(**thread_dict))
    
    return response


@router.post("/", response_model=ThreadResponse, status_code=status.HTTP_201_CREATED)
async def create_thread(
    payload: ThreadCreate,
    user_id: str,  # TODO: Get from auth dependency
    db: AsyncSession = Depends(get_db)
):
    """Create a new chat thread."""
    thread = Thread(
        user_id=user_id,
        title=payload.title,
        metadata_=payload.metadata,
    )
    db.add(thread)
    await db.commit()
    await db.refresh(thread)
    
    return ThreadResponse(
        id=str(thread.id),
        user_id=str(thread.user_id),
        title=thread.title,
        is_pinned=thread.is_pinned,
        metadata=thread.metadata_,
        last_message_at=thread.last_message_at,
        created_at=thread.created_at,
        updated_at=thread.updated_at,
        message_count=0,
    )


@router.get("/{thread_id}", response_model=ThreadResponse)
async def get_thread(
    thread_id: str,
    user_id: str,  # TODO: Get from auth dependency
    db: AsyncSession = Depends(get_db)
):
    """Get a specific thread by ID."""
    stmt = select(Thread).where(Thread.id == thread_id, Thread.user_id == user_id)
    result = await db.execute(stmt)
    thread = result.scalar_one_or_none()
    
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    # Count messages
    from src.models import Message
    count_stmt = select(func.count()).select_from(Message).where(Message.thread_id == thread.id)
    count_result = await db.execute(count_stmt)
    msg_count = count_result.scalar() or 0
    
    return ThreadResponse(
        id=str(thread.id),
        user_id=str(thread.user_id),
        title=thread.title,
        is_pinned=thread.is_pinned,
        metadata=thread.metadata_,
        last_message_at=thread.last_message_at,
        created_at=thread.created_at,
        updated_at=thread.updated_at,
        message_count=msg_count,
    )


@router.patch("/{thread_id}", response_model=ThreadResponse)
async def update_thread(
    thread_id: str,
    payload: ThreadUpdate,
    user_id: str,  # TODO: Get from auth dependency
    db: AsyncSession = Depends(get_db)
):
    """Update a thread."""
    stmt = select(Thread).where(Thread.id == thread_id, Thread.user_id == user_id)
    result = await db.execute(stmt)
    thread = result.scalar_one_or_none()
    
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    if payload.title is not None:
        thread.title = payload.title
    if payload.is_pinned is not None:
        thread.is_pinned = payload.is_pinned
    
    await db.commit()
    await db.refresh(thread)
    
    # Count messages
    from src.models import Message
    count_stmt = select(func.count()).select_from(Message).where(Message.thread_id == thread.id)
    count_result = await db.execute(count_stmt)
    msg_count = count_result.scalar() or 0
    
    return ThreadResponse(
        id=str(thread.id),
        user_id=str(thread.user_id),
        title=thread.title,
        is_pinned=thread.is_pinned,
        metadata=thread.metadata_,
        last_message_at=thread.last_message_at,
        created_at=thread.created_at,
        updated_at=thread.updated_at,
        message_count=msg_count,
    )


@router.delete("/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_thread(
    thread_id: str,
    user_id: str,  # TODO: Get from auth dependency
    db: AsyncSession = Depends(get_db)
):
    """Delete a thread."""
    stmt = select(Thread).where(Thread.id == thread_id, Thread.user_id == user_id)
    result = await db.execute(stmt)
    thread = result.scalar_one_or_none()
    
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    await db.delete(thread)
    await db.commit()
    
    return None
