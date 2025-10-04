"""
Rayyan Backend API - FastAPI application with Supabase integration.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import settings
from src.core.database import init_db, close_db
from src.routers import threads, agent, auth, users, farms, zones, team, tasks, yields_water, pesticides


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
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

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"{settings.api_v1_prefix}/auth", tags=["auth"])
app.include_router(users.router, prefix=settings.api_v1_prefix, tags=["users"])
app.include_router(farms.router, prefix=settings.api_v1_prefix, tags=["farms"])
app.include_router(threads.router, prefix=settings.api_v1_prefix, tags=["threads"])
app.include_router(agent.router, prefix=settings.api_v1_prefix, tags=["agent"])

# Dashboard routers
app.include_router(zones.router, prefix=settings.api_v1_prefix, tags=["zones"])
app.include_router(team.router, prefix=settings.api_v1_prefix, tags=["team"])
app.include_router(tasks.router, prefix=settings.api_v1_prefix, tags=["tasks"])
app.include_router(yields_water.router, prefix=settings.api_v1_prefix, tags=["yields", "water"])
app.include_router(pesticides.router, prefix=settings.api_v1_prefix, tags=["pesticides"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Rayyan Agricultural AI Assistant API",
        "version": "0.1.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "service": "rayyan-backend"}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",  # Bind to all interfaces for Docker accessibility
        port=8000,
        reload=True,
        log_level="info",
    )
