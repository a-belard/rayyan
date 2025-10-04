# Rayyan Backend - Restructured ✨

## New Directory Structure

```
backend/
├── src/                           # 📦 All source code
│   ├── __init__.py
│   ├── main.py                    # 🚀 FastAPI application entry point
│   │
│   ├── core/                      # ⚙️ Core infrastructure
│   │   ├── __init__.py
│   │   ├── config.py              # Configuration & settings
│   │   ├── database.py            # Database connection (Supabase/PostgreSQL)
│   │   └── auth.py                # Authentication utilities
│   │
│   ├── models/                    # 📊 Database models (SQLAlchemy ORM)
│   │   ├── __init__.py
│   │   └── base.py                # All models (User, Farm, Thread, Message, Run)
│   │
│   ├── schemas/                   # ✅ Pydantic validation schemas
│   │   ├── __init__.py
│   │   └── base.py                # All schemas (User, Farm, Thread, etc.)
│   │
│   ├── routers/                   # 🛣️ API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py                # POST /auth/register, /auth/login
│   │   ├── users.py               # GET /me, PATCH /me, GET /users/{id}
│   │   ├── farms.py               # Farm CRUD endpoints
│   │   ├── threads.py             # Thread management endpoints
│   │   └── agent.py               # AI agent chat endpoints (SSE streaming)
│   │
│   ├── services/                  # 🔧 Business logic (future)
│   │   └── __init__.py
│   │
│   ├── agent/                     # 🤖 AI Agent functionality
│   │   ├── __init__.py
│   │   ├── builder.py             # LangGraph agent builder
│   │   ├── tools.py               # Agricultural tools (weather, soil, pest)
│   │   ├── llm_config.py          # LLM configuration
│   │   └── system_prompt.py       # System prompts
│   │
│   └── utils/                     # 🛠️ Utility functions (future)
│       └── __init__.py
│
├── migrations/                    # 📜 Database migrations
│   ├── 001_user_management.sql
│   └── 002_performance_indexes.sql
│
├── tests/                         # 🧪 Tests (to be created)
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_users.py
│   └── test_farms.py
│
├── logs/                          # 📝 Application logs
├── pyproject.toml                 # 📦 Dependencies (uv)
├── Dockerfile                     # 🐳 Docker configuration
├── docker-compose.yml             # 🐳 Docker Compose
├── .env.example                   # 🔐 Environment variables template
└── README.md                      # 📚 This file
```

## Benefits of New Structure

### ✅ **Organized & Professional**

- Clear separation: infrastructure (core), data (models/schemas), API (routers), logic (services)
- Follows Python best practices and Flask/Django patterns
- Easy to navigate for new developers

### ✅ **Scalable**

- Add new models: create file in `src/models/`
- Add new endpoints: create file in `src/routers/`
- Add business logic: create service in `src/services/`

### ✅ **Maintainable**

- Smaller files (split models.py into separate files if needed)
- Related code grouped together
- Import paths are explicit: `from src.models.base import User`

### ✅ **Testable**

- Proper structure for unit tests
- Mock services easily
- Test routers, services, models separately

## Running the Application

### Development (Local)

```bash
# From backend/ directory
python -m src.main

# Or with uvicorn directly
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Development (Docker)

```bash
cd backend/
docker-compose up -d
```

### Production

```bash
# Build
docker build -t rayyan-backend .

# Run
docker run -p 8000:8000 --env-file .env rayyan-backend
```

## Import Convention

### ✅ New Way (Explicit)

```python
from src.core.database import get_db
from src.core.auth import get_current_user
from src.models.base import User, Farm
from src.schemas.base import UserResponse, FarmCreate
```

### ❌ Old Way (Implicit)

```python
from db import get_db
from auth import get_current_user
from models import User, Farm
from schemas import UserResponse, FarmCreate
```

## Key Files

| File                   | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `src/main.py`          | FastAPI app, middleware, router registration   |
| `src/core/config.py`   | Settings (DATABASE*URL, SUPABASE*\*, API keys) |
| `src/core/database.py` | SQLAlchemy async engine, session management    |
| `src/core/auth.py`     | JWT validation, user dependencies, permissions |
| `src/models/base.py`   | User, Farm, Thread, Message, Run ORM models    |
| `src/schemas/base.py`  | Pydantic schemas for API validation            |
| `src/routers/*.py`     | FastAPI route handlers (endpoints)             |
| `src/agent/builder.py` | LangGraph ReAct agent with tools               |

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login (returns JWT)
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Users

- `GET /api/v1/me` - Get current user profile
- `PATCH /api/v1/me` - Update current user profile
- `GET /api/v1/users/{id}` - Get user by ID (agronomist+)

### Farms

- `GET /api/v1/farms` - List user's farms
- `POST /api/v1/farms` - Create farm
- `GET /api/v1/farms/{id}` - Get farm details
- `PATCH /api/v1/farms/{id}` - Update farm
- `DELETE /api/v1/farms/{id}` - Delete farm

### Threads

- `GET /api/v1/threads` - List user's threads
- `POST /api/v1/threads` - Create thread
- `GET /api/v1/threads/{id}` - Get thread with messages
- `PATCH /api/v1/threads/{id}` - Update thread
- `DELETE /api/v1/threads/{id}` - Delete thread

### Agent

- `POST /api/v1/agent/stream` - Chat with AI agent (SSE streaming)

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret

# AI Models
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# App
APP_NAME="Rayyan Agricultural AI"
API_V1_PREFIX=/api/v1
DEBUG=true
```

## Development Workflow

### 1. Add a New Feature

```bash
# 1. Create model (if needed)
vim src/models/base.py  # or create src/models/sensor.py

# 2. Create schema (if needed)
vim src/schemas/base.py  # or create src/schemas/sensor.py

# 3. Create service (business logic)
vim src/services/sensor_service.py

# 4. Create router (API endpoints)
vim src/routers/sensors.py

# 5. Register router in main.py
vim src/main.py
# Add: app.include_router(sensors.router, ...)

# 6. Test
python -m src.main
```

### 2. Run Tests (Future)

```bash
# All tests
pytest

# Specific test file
pytest tests/test_users.py

# With coverage
pytest --cov=src tests/
```

## Database Migrations

```bash
# Apply migrations
psql $DATABASE_URL -f migrations/001_user_management.sql
psql $DATABASE_URL -f migrations/002_performance_indexes.sql
```

## Troubleshooting

### Import Errors

If you see `ModuleNotFoundError: No module named 'src'`:

```bash
# Make sure you're running from backend/ directory
cd backend/

# Run with -m flag
python -m src.main

# Or add backend/ to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
python src/main.py
```

### Database Connection Issues

```bash
# Check .env file exists and has correct values
cat .env

# Test database connection
python -c "from src.core.database import engine; print('DB OK')"
```

## Next Steps

- [ ] Split `src/models/base.py` into separate files (user.py, farm.py, etc.)
- [ ] Split `src/schemas/base.py` into separate files
- [ ] Create service layer for business logic
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add API documentation
- [ ] Add logging configuration
- [ ] Add monitoring/metrics

## Documentation

- [Restructuring Guide](./RESTRUCTURING_GUIDE.md) - Detailed migration steps
- [Restructuring Status](./RESTRUCTURING_STATUS.md) - What's done, what's next
- [Database Optimization](./DATABASE_OPTIMIZATION.md) - Schema review & indexes
- [Refactoring Summary](./REFACTORING_SUMMARY.md) - Code quality improvements

## Contributing

1. Follow the directory structure
2. Use explicit imports (`from src.models.base import User`)
3. Add docstrings to functions and classes
4. Write tests for new features
5. Update this README when adding new modules

---

**Version**: 0.1.0  
**Python**: 3.11+  
**Package Manager**: uv  
**Database**: PostgreSQL (Supabase)  
**Framework**: FastAPI + SQLAlchemy 2.0 + Pydantic v2
