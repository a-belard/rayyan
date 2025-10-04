"""
Authentication router for user registration and login using Supabase Auth.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from src.core.database import get_db, get_supabase_client
from src.models import User, UserRole
from src.schemas import UserCreate, UserResponse, LoginRequest, LoginResponse
from src.core.auth import get_current_user, AuthUser


router = APIRouter(tags=["auth"])


DEFAULT_USER_PREFERENCES = {
    "language": "en",
    "timezone": "UTC",
    "notifications_enabled": True,
    "default_units": "metric",
    "theme": "light"
}


async def create_local_user(user_id: uuid.UUID, user_data: UserCreate, db: AsyncSession) -> User:
    """Helper to create user in local database."""
    db_user = User(
        id=user_id,
        email=user_data.email,
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=user_data.role,
        organization_name=user_data.organization_name,
        farm_location=user_data.farm_location,
        farm_size_hectares=user_data.farm_size_hectares,
        preferences=DEFAULT_USER_PREFERENCES,
        metadata_={}
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user using Supabase Auth."""
    import traceback
    import logging
    
    logger = logging.getLogger(__name__)
    
    try:
        # Check if user already exists in local database
        result = await db.execute(select(User).where(User.email == user_data.email))
        existing_user = result.scalar_one_or_none()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        
        # Create user in Supabase Auth
        supabase = get_supabase_client()
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user in authentication system",
            )
        
        user_id = uuid.UUID(auth_response.user.id)
        
        # Check if user with this ID already exists (orphaned from previous failed attempt)
        result = await db.execute(select(User).where(User.id == user_id))
        existing_user_by_id = result.scalar_one_or_none()
        
        if existing_user_by_id:
            # User exists from a previous attempt, just return it
            logger.info(f"Found existing user with ID {user_id}, returning existing user")
            return UserResponse.from_orm_with_counts(existing_user_by_id)
        
        # Create user in local database
        db_user = await create_local_user(user_id, user_data, db)
        
        # Build response
        return UserResponse.from_orm_with_counts(db_user)
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        error_msg = str(e).lower()
        
        logger.error(f"Registration error: {str(e)}")
        logger.error(traceback.format_exc())
        
        # More specific error checking
        if "user already registered" in error_msg or "email address already in use" in error_msg or "duplicate key" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        
        # Return the actual error for debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}",
        )


@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """Login user using Supabase Auth and return JWT token."""
    try:
        supabase = get_supabase_client()
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password,
        })
        
        if not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        
        return LoginResponse(
            access_token=auth_response.session.access_token,
            token_type="bearer",
            expires_in=auth_response.session.expires_in,
            refresh_token=auth_response.session.refresh_token,
            user={
                "id": auth_response.user.id,
                "email": auth_response.user.email,
            }
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )


@router.post("/logout")
async def logout(current_user: AuthUser = Depends(get_current_user)):
    """Logout current user (invalidate token)."""
    try:
        supabase = get_supabase_client()
        supabase.auth.sign_out()
    except Exception:
        pass  # Even if Supabase logout fails, return success
    
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current authenticated user profile."""
    result = await db.execute(
        select(User).where(User.id == current_user.id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return UserResponse.from_orm_with_counts(user)


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Refresh access token using refresh token."""
    try:
        supabase = get_supabase_client()
        auth_response = supabase.auth.refresh_session(refresh_token)
        
        if not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
        
        return {
            "access_token": auth_response.session.access_token,
            "token_type": "bearer",
            "expires_in": auth_response.session.expires_in,
            "refresh_token": auth_response.session.refresh_token,
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to refresh token",
        )
