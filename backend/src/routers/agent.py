"""
API routes for agent execution with streaming responses.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, AsyncGenerator
from pydantic import BaseModel
from datetime import datetime, timezone
import json
import logging

from src.core.database import get_db
from src.models import Thread, Message, Run, MessageRole, RunStatus
from src.agent.builder import build_agricultural_agent
from src.agent.system_prompt import get_system_prompt
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage


router = APIRouter(prefix="/agent", tags=["agent"])
logger = logging.getLogger(__name__)


# --- Schemas ---

class AgentRunRequest(BaseModel):
    """Request to run the agent."""
    content: str
    user_id: str  # TODO: Get from auth


class MessageResponse(BaseModel):
    """Message response model."""
    id: str
    thread_id: str
    position: int
    role: str
    content: str
    metadata: dict
    created_at: datetime

    class Config:
        from_attributes = True


# --- Helper Functions ---

def sse_event(event: str, data: dict) -> str:
    """Format a Server-Sent Event."""
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


async def get_thread_or_404(db: AsyncSession, thread_id: str, user_id: str) -> Thread:
    """Get thread or raise 404."""
    stmt = select(Thread).where(Thread.id == thread_id, Thread.user_id == user_id)
    result = await db.execute(stmt)
    thread = result.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    return thread


async def create_message(
    db: AsyncSession,
    thread_id: str,
    role: MessageRole,
    content: str,
    metadata: dict = None
) -> Message:
    """Create a new message in the thread."""
    # Get next position
    pos_stmt = select(func.coalesce(func.max(Message.position), 0) + 1).where(Message.thread_id == thread_id)
    pos_result = await db.execute(pos_stmt)
    next_pos = pos_result.scalar_one()
    
    message = Message(
        thread_id=thread_id,
        position=next_pos,
        role=role,
        content=content,
        metadata_=metadata or {},
    )
    db.add(message)
    
    # Update thread last_message_at
    thread_stmt = select(Thread).where(Thread.id == thread_id)
    thread_result = await db.execute(thread_stmt)
    thread = thread_result.scalar_one_or_none()
    if thread:
        thread.last_message_at = func.now()
    
    await db.commit()
    await db.refresh(message)
    return message


async def get_chat_history(db: AsyncSession, thread_id: str, limit: int = 20) -> List[Message]:
    """Get recent messages from the thread."""
    stmt = (
        select(Message)
        .where(Message.thread_id == thread_id)
        .order_by(Message.position.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    messages = list(result.scalars().all())
    messages.reverse()  # Oldest first
    return messages


# --- Routes ---

@router.get("/threads/{thread_id}/messages", response_model=List[MessageResponse])
async def get_thread_messages(
    thread_id: str,
    user_id: str,  # TODO: Get from auth
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Get messages for a thread."""
    thread = await get_thread_or_404(db, thread_id, user_id)
    
    stmt = (
        select(Message)
        .where(Message.thread_id == thread_id)
        .order_by(Message.position.asc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    messages = result.scalars().all()
    
    return [
        MessageResponse(
            id=str(m.id),
            thread_id=str(m.thread_id),
            position=m.position,
            role=m.role.value,
            content=m.content,
            metadata=m.metadata_,
            created_at=m.created_at,
        )
        for m in messages
    ]


@router.post("/threads/{thread_id}/run")
async def run_agent_stream(
    thread_id: str,
    payload: AgentRunRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Run the agent on a user message and stream the response.
    Returns Server-Sent Events with agent progress.
    """
    user_id = payload.user_id  # TODO: Get from auth dependency
    
    # Verify thread exists and belongs to user
    thread = await get_thread_or_404(db, thread_id, user_id)
    
    # Create user message
    user_msg = await create_message(
        db, thread_id, MessageRole.user, payload.content
    )
    
    # Create run record
    run = Run(thread_id=thread_id, status=RunStatus.running, started_at=datetime.now(timezone.utc))
    db.add(run)
    await db.commit()
    await db.refresh(run)
    
    async def event_generator() -> AsyncGenerator[str, None]:
        """Generate SSE events for the agent run."""
        logger.info(f"[Agent] Starting run for thread={thread_id}")
        
        try:
            # Build the agent
            agent = build_agricultural_agent()
            
            # Get system prompt
            system_prompt = get_system_prompt()
            
            # Get chat history
            history = await get_chat_history(db, thread_id, limit=20)
            
            # Build message list for the agent - prepend system prompt
            messages = [SystemMessage(content=system_prompt)]
            
            for msg in history:
                if msg.id == user_msg.id:
                    continue  # Skip the just-created user message
                
                if msg.role == MessageRole.user:
                    messages.append(HumanMessage(content=msg.content))
                elif msg.role == MessageRole.assistant:
                    messages.append(AIMessage(content=msg.content))
                elif msg.role == MessageRole.system:
                    messages.append(SystemMessage(content=msg.content))
            
            # Add current user message
            messages.append(HumanMessage(content=payload.content))
            
            # Stream agent execution
            final_content = ""
            current_tokens = ""
            reasoning_steps = []
            tool_calls_made = []
            
            async for event in agent.astream_events(
                {"messages": messages},
                version="v2",
            ):
                event_type = event.get("event")
                event_name = event.get("name")
                event_data = event.get("data", {})
                
                # Stream tokens from LLM
                if event_type == "on_chat_model_stream":
                    chunk = event_data.get("chunk")
                    if chunk and hasattr(chunk, "content"):
                        token = chunk.content
                        if token:
                            current_tokens += token
                            yield sse_event("token", {"content": token})
                
                # Tool calls
                elif event_type == "on_tool_start":
                    tool_name = event_name
                    tool_input = event_data.get("input", {})
                    
                    # Track reasoning steps
                    if tool_name == "reason_step":
                        step = {
                            "type": "reasoning",
                            "title": tool_input.get("title", ""),
                            "detail": tool_input.get("detail", ""),
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        }
                        reasoning_steps.append(step)
                        yield sse_event("reasoning", step)
                    else:
                        step = {
                            "type": "tool_call",
                            "tool": tool_name,
                            "input": tool_input,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        }
                        tool_calls_made.append(step)
                        yield sse_event("tool_start", step)
                
                elif event_type == "on_tool_end":
                    tool_name = event_name
                    tool_output = event_data.get("output")
                    yield sse_event("tool_end", {
                        "tool": tool_name,
                        "output": tool_output,
                    })
            
            # Get final answer
            if current_tokens:
                final_content = current_tokens
            
            # Create assistant message
            assistant_msg = await create_message(
                db,
                thread_id,
                MessageRole.assistant,
                final_content,
                metadata={
                    "reasoning_steps": reasoning_steps,
                    "tool_calls": tool_calls_made,
                    "run_id": run.id,
                }
            )
            
            # Update run status
            run.status = RunStatus.completed
            run.completed_at = datetime.now(timezone.utc)
            run.metadata_ = {
                "reasoning_steps": reasoning_steps,
                "tool_calls": tool_calls_made,
            }
            await db.commit()
            
            # Send completion event
            yield sse_event("done", {
                "message_id": assistant_msg.id,
                "run_id": run.id,
                "content": final_content,
            })
            
            logger.info(f"[Agent] Completed run for thread={thread_id}")
        
        except Exception as e:
            logger.error(f"[Agent] Error in run for thread={thread_id}: {e}", exc_info=True)
            
            # Update run status
            run.status = RunStatus.failed
            run.completed_at = datetime.now(timezone.utc)
            run.metadata_ = {"error": str(e)}
            await db.commit()
            
            yield sse_event("error", {"message": str(e)})
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )
