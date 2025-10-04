# Rayyan Backend API

FastAPI-based backend service for the Rayyan agricultural intelligence platform, integrated with Supabase.

## Features

- ⚡ **FastAPI** with async/await support
- 🗄️ **Supabase** integration (PostgreSQL + Auth + Storage + Realtime)
- 🔒 **Type-safe** with Pydantic v2
- 🐳 **Docker** ready with multi-stage builds
- 🚀 **uv** for fast dependency management

## Prerequisites

- Python 3.11+
- [uv](https://github.com/astral-sh/uv) package manager
- Supabase project ([create one here](https://app.supabase.com))

## Quick Start

### 1. Install Dependencies

```bash
cd backend
uv pip install -e .
```

### 2. Configure Environment

Copy the example environment file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase project details:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your anon/public key
- `DATABASE_URL`: PostgreSQL connection string (use `postgresql+asyncpg://` format)

Get these values from your [Supabase project settings](https://app.supabase.com/project/_/settings/api).

### 3. Run Development Server

```bash
# Using Python directly
python main.py

# Or using uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Docker Deployment

### Build and Run with Docker

```bash
# From project root
docker build -f infra/docker/backend.Dockerfile -t rayyan-backend .
docker run -p 8000:8000 --env-file backend/.env rayyan-backend
```

### Using Docker Compose

```bash
# From infra/docker directory
docker-compose up backend
```

## Project Structure

```
backend/
├── main.py           # FastAPI application entry point
├── config.py         # Settings and environment variables
├── db.py            # Database and Supabase client setup
├── pyproject.toml   # Dependencies and project metadata
├── .env.example     # Example environment variables
└── .gitignore       # Git ignore patterns
```

## Database Access Patterns

### SQLAlchemy (Direct PostgreSQL)

Use for traditional ORM operations:

```python
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db import get_db

@app.get("/items")
async def get_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item))
    return result.scalars().all()
```

### Supabase Client

Use for auth, storage, and realtime features:

```python
from fastapi import Depends
from db import get_supabase_client

@app.post("/upload")
async def upload_file(supabase = Depends(get_supabase_client)):
    # Auth
    user = supabase.auth.get_user(token)
    
    # Storage
    supabase.storage.from_("bucket").upload(file_name, file)
    
    # Realtime
    supabase.channel("room").on_broadcast(event, callback).subscribe()
```

## Code Formatting

This project uses Black and isort:

```bash
# Format code
black .
isort .
```

## API Endpoints

- `GET /` - Root endpoint with API info
- `GET /health` - Health check
- `GET /api/v1/example` - Example SQLAlchemy route
- `GET /api/v1/supabase-example` - Example Supabase client route

## Development Notes

- All database operations use async patterns
- Environment variables are managed via Pydantic Settings
- CORS is configured for local frontend development
- Database tables are auto-created on startup (see `init_db()`)

## Troubleshooting

### Import Errors

If you see import errors, ensure dependencies are installed:

```bash
cd backend
uv pip install -e .
```

### Database Connection Issues

Verify your `DATABASE_URL` format:
- Must use `postgresql+asyncpg://` prefix for async support
- Get the correct connection string from Supabase project settings

### CORS Issues

Add your frontend URL to `CORS_ORIGINS` in `.env`:

```bash
CORS_ORIGINS=["http://localhost:3000","http://your-frontend-url"]
```
