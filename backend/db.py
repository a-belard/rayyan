"""
Database connection and Supabase client initialization.
Provides both direct PostgreSQL access via SQLAlchemy and Supabase client for auth/storage/realtime.
"""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base
from supabase import create_client, Client

from config import settings

# SQLAlchemy Base for ORM models
Base = declarative_base()

# Async SQLAlchemy Engine (for direct PostgreSQL access)
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    future=True,
)

# Async Session Factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Supabase Client (for auth, storage, realtime)
supabase_client: Client = create_client(
    settings.supabase_url,
    settings.supabase_key,
)


async def get_db() -> AsyncSession:
    """
    Dependency for getting async database sessions.
    Use this in FastAPI route dependencies.
    
    Example:
        @app.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(Item))
            return result.scalars().all()
    """
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def get_supabase_client() -> Client:
    """
    Dependency for getting Supabase client.
    Use this for auth, storage, and realtime operations.
    
    Example:
        @app.post("/upload")
        async def upload_file(
            file: UploadFile,
            supabase: Client = Depends(get_supabase_client)
        ):
            supabase.storage.from_("bucket").upload(file.filename, file.file)
    """
    return supabase_client


async def init_db():
    """
    Initialize database tables.
    Call this during application startup.
    """
    async with engine.begin() as conn:
        # Uncomment to drop all tables (use with caution!)
        # await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """
    Close database connections.
    Call this during application shutdown.
    """
    await engine.dispose()
