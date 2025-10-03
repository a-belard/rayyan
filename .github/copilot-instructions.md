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
- **Documentation directories** (`docs/`, component READMEs) are placeholders - don't assume existing patterns
- **ML modules** are structured but empty - follow naming conventions when implementing
- **Infra files** (Dockerfiles, CI/CD) - design for multi-service deployment
- **No existing API contracts** yet - design RESTful/GraphQL patterns consistent with FastAPI + Next.js best practices

## When Implementing New Features
**Backend**: Follow FastAPI async patterns, use Pydantic models for validation, SQLAlchemy for ORM with Supabase PostgreSQL
**Frontend**: Create components in `src/components/`, pages in `src/app/`, use TypeScript strict types. Consider @supabase/supabase-js for client-side auth and real-time
**Database**: Use Supabase for PostgreSQL, authentication, storage, and real-time subscriptions
**ML Models**: Place training code in respective subdirectories, export models as ONNX/TFLite for edge deployment
**Docker**: Design for multi-stage builds (backend.Dockerfile, frontend.Dockerfile patterns in `infra/docker/`)


When in doubt, ask for clarification or propose patterns consistent with modern best practices.
When in doubt, follow modern FastAPI + Next.js 15 + IoT best practices.
