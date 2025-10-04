# Rayyan - AI Coding Agent Instructions

## Architecture

### Component Structure
- **`backend/`**: FastAPI-based API server (Python 3.11+, uv package manager)
  - Dependencies: FastAPI, Pydantic, SQLAlchemy, Uvicorn
  - Database: **Supabase** (PostgreSQL with real-time, auth, and storage)
  - Uses Black (line-length=88) and isort for code formatting

- **`frontend/`**: Next.js 15.5+ with React 19 (App Router, Turbopack)
  - Package manager: **pnpm** (not npm/yarn)
  - Run dev: `pnpm dev` (uses Turbopack for faster builds)
  - Build: `pnpm build --turbopack`
  - TypeScript with path aliases: `@/*` → `./src/*`
  - Styling: Tailwind CSS v4 with PostCSS
  - Fonts: Geist Sans and Geist Mono (via next/font)


## Development Conventions

### Python (Backend & ML)
- **Package Manager**: Use `uv` for backend (modern pip replacement)
- **Formatting**: Black with 88-character line length + isort with Black profile
- **Type Hints**: Pydantic v2 for data validation
- **Database**: Supabase (PostgreSQL) via SQLAlchemy 2.0+ or supabase-py client
  - Use async SQLAlchemy patterns for direct PostgreSQL access
  - Consider supabase-py for auth, storage, and real-time features
  - Connection via DATABASE_URL from Supabase project settings

### Frontend (TypeScript/React)
- **Always use pnpm**, never npm or yarn
- **Next.js App Router** (not Pages Router) - files in `src/app/`
- **Turbopack enabled** by default for dev and build
- **Import aliases**: Use `@/` prefix (e.g., `import { x } from '@/components/x'`)
- **Styling**: Tailwind utility classes, follow existing `className` patterns
- **TypeScript strict mode** enabled - all components need proper types

### Edge Computing
- Optimized for lightweight inference (ONNX/TFLite models)
- MQTT protocol for IoT communication (paho-mqtt)
- Design for resource-constrained environments

## Critical Notes
- **Backend structure**: `main.py` (FastAPI app with routers), `config.py` (settings), `db.py` (Supabase/SQLAlchemy setup), `models.py` (database models)
- **Environment setup**: Copy `backend/.env.example` to `.env` and configure Supabase credentials + OpenAI/Anthropic API keys
- **Database access**: Use `Depends(get_db)` for SQLAlchemy, `Depends(get_supabase_client)` for auth/storage/realtime
- **Agent system**: LangGraph-based AI agent in `backend/agent/` with agricultural tools
  - System prompt in `system_prompt.py` defines agent role and behavior
  - Tools in `tools.py` provide weather, soil, water, pest, irrigation, fertigation analysis
  - Agent builder in `builder.py` creates ReAct agent with LLM + tools
- **API patterns**: Routers in `backend/routers/` - threads for CRUD, agent for SSE streaming
- **Chat UI**: Next.js chat interface at `/chat` with thread sidebar and streaming messages
- **Docker deployment**: Multi-stage build with uv in `infra/docker/backend.Dockerfile`
- **ML modules** are structured but empty - follow naming conventions when implementing

## When Implementing New Features
**Backend**: Follow FastAPI async patterns, use Pydantic models for validation, SQLAlchemy for ORM with Supabase PostgreSQL
  - See `backend/db.py` for database access patterns
  - Use `Depends(get_db)` for SQLAlchemy sessions
  - Use `Depends(get_supabase_client)` for auth/storage/realtime
  - Add routers in `backend/routers/` and include them in `main.py`
**Agent Tools**: Add new tools in `backend/agent/tools.py` with `@tool` decorator
  - Follow pattern: clear docstring, type hints, return Dict[str, Any]
  - Update system prompt if adding new capabilities
  - Tools should return actionable data with traffic-light indicators (🟢🟡🔴)
**Frontend**: Create components in `src/components/`, pages in `src/app/`, use TypeScript strict types
  - Chat UI in `src/app/chat/` with streaming SSE support
  - Components use Tailwind CSS utility classes
  - API calls to `NEXT_PUBLIC_API_URL` from `.env.local`
**Database**: Use Supabase for PostgreSQL, authentication, storage, and real-time subscriptions
  - Models in `backend/models.py` (Thread, Message, Run)
  - Always use async SQLAlchemy patterns
**ML Models**: Place training code in respective subdirectories, export models as ONNX/TFLite for edge deployment
**Docker**: Use multi-stage builds with uv (see `infra/docker/backend.Dockerfile` for reference)

## Key Development Workflows

### Backend Development
```bash
cd backend
uv pip install -e .              # Install dependencies
cp .env.example .env             # Configure environment
python main.py                   # Run dev server (with auto-reload)
# or: uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Docker Deployment
```bash
# Build backend
docker build -f infra/docker/backend.Dockerfile -t rayyan-backend .

# Run with docker-compose (from infra/docker/)
docker-compose up backend
```


When in doubt, ask for clarification or propose patterns consistent with modern best practices.
When in doubt, follow modern FastAPI + Next.js 15 + IoT best practices.
