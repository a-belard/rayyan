"""
Rayyan Backend API - FastAPI application with Supabase integration.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from db import get_db, get_supabase_client, init_db, close_db
from routers import threads, agent


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    print("🚀 Starting Rayyan Backend API...")
    await init_db()
    print("✅ Database initialized")
    yield
    # Shutdown
    print("🛑 Shutting down...")
    await close_db()
    print("✅ Cleanup completed")


app = FastAPI(
    title=settings.app_name,
    description="Agricultural Intelligence Platform API",
    version="0.1.0",
    debug=settings.debug,
    lifespan=lifespan,
)

# CORS middleware - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (like RiskNav)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(threads.router, prefix=settings.api_v1_prefix)
app.include_router(agent.router, prefix=settings.api_v1_prefix)


@app.get("/")
async def root():
    """Root endpoint - health check."""
    return {
        "message": "Welcome to Rayyan Backend API",
        "status": "healthy",
        "version": "0.1.0",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


# Example route using database
@app.get(f"{settings.api_v1_prefix}/example")
async def example_db_route(db: AsyncSession = Depends(get_db)):
    """
    Example route demonstrating database dependency injection.
    Replace with actual routes for your application.
    """
    # Example query would go here
    return {
        "message": "Database connection successful",
        "note": "This is an example endpoint - replace with actual routes",
    }


# Example route using Supabase client
@app.get(f"{settings.api_v1_prefix}/supabase-example")
async def example_supabase_route(supabase=Depends(get_supabase_client)):
    """
    Example route demonstrating Supabase client usage.
    Use this for auth, storage, and realtime operations.
    """
    return {
        "message": "Supabase client ready",
        "note": "Use this client for auth, storage, and realtime features",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )

