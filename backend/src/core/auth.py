"""
Authentication and authorization utilities for Supabase Auth integration.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import jwt
from datetime import datetime

from src.core.database import get_db, get_supabase_client
from src.models import User, UserRole
from src.core.config import settings


# HTTP Bearer token scheme for FastAPI
security = HTTPBearer()


class AuthUser:
    """Authenticated user information."""
    
    def __init__(
        self,
        id: str,
        email: str,
        role: UserRole,
        full_name: Optional[str] = None,
        metadata: dict = None,
    ):
        self.id = id
        self.email = email
        self.role = role
        self.full_name = full_name
        self.metadata = metadata or {}
    
    def is_admin(self) -> bool:
        """Check if user is admin."""
        return self.role == UserRole.admin
    
    def has_permission(self, required_role: UserRole) -> bool:
        """Check if user has required role permission."""
        role_hierarchy = {
            UserRole.viewer: 0,
            UserRole.farmer: 1,
            UserRole.agronomist: 2,
            UserRole.admin: 3,
        }
        return role_hierarchy.get(self.role, 0) >= role_hierarchy.get(required_role, 0)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> AuthUser:
    """
    Get current authenticated user from JWT token.
    
    Validates the Supabase JWT token and returns user information.
    
    Args:
        credentials: HTTP Bearer token from request header
        db: Database session
    
    Returns:
        AuthUser: Authenticated user information
    
    Raises:
        HTTPException: If token is invalid or user not found
    
    Example:
        @app.get("/me")
        async def get_profile(user: AuthUser = Depends(get_current_user)):
            return {"user_id": user.id, "email": user.email}
    """
    token = credentials.credentials
    
    try:
        # Verify JWT token with Supabase
        supabase = get_supabase_client()
        auth_response = supabase.auth.get_user(token)
        
        if not auth_response or not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )
        
        auth_user = auth_response.user
        user_id = auth_user.id
        
        # Get user from database
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found in database",
            )
        
        # Update last login time
        user.last_login_at = datetime.utcnow()
        await db.commit()
        
        return AuthUser(
            id=user.id,
            email=user.email,
            role=user.role,
            full_name=user.full_name,
            metadata=user.metadata_,
        )
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
        )


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[AuthUser]:
    """
    Get current user if authenticated, None otherwise.
    
    Use this for endpoints that work with or without authentication.
    
    Example:
        @app.get("/public-data")
        async def get_data(user: Optional[AuthUser] = Depends(get_optional_user)):
            if user:
                return {"data": "personalized", "user": user.email}
            return {"data": "public"}
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None


def require_role(required_role: UserRole):
    """
    Dependency to require specific user role.
    
    Args:
        required_role: Minimum role required
    
    Returns:
        Dependency function that checks user role
    
    Example:
        @app.delete("/users/{user_id}")
        async def delete_user(
            user_id: str,
            current_user: AuthUser = Depends(require_role(UserRole.admin))
        ):
            # Only admins can access this endpoint
            pass
    """
    async def role_checker(user: AuthUser = Depends(get_current_user)) -> AuthUser:
        if not user.has_permission(required_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires {required_role.value} role or higher",
            )
        return user
    
    return role_checker


# Note: require_active() function removed since user status field was removed
# All authenticated users are considered active by default


async def verify_thread_ownership(
    thread_id: str,
    user: AuthUser,
    db: AsyncSession,
) -> bool:
    """
    Verify that a thread belongs to the user.
    
    Args:
        thread_id: Thread ID to check
        user: Current authenticated user
        db: Database session
    
    Returns:
        bool: True if user owns the thread
    
    Example:
        @app.get("/threads/{thread_id}")
        async def get_thread(
            thread_id: str,
            user: AuthUser = Depends(get_current_user),
            db: AsyncSession = Depends(get_db)
        ):
            if not await verify_thread_ownership(thread_id, user, db):
                raise HTTPException(403, "Access denied")
            # ... rest of logic
    """
    from src.models import Thread
    
    result = await db.execute(
        select(Thread).where(
            Thread.id == thread_id,
            Thread.user_id == user.id,
        )
    )
    thread = result.scalar_one_or_none()
    return thread is not None


async def verify_farm_ownership(
    farm_id: str,
    user: AuthUser,
    db: AsyncSession,
) -> bool:
    """
    Verify that a farm belongs to the user.
    
    Args:
        farm_id: Farm ID to check
        user: Current authenticated user
        db: Database session
    
    Returns:
        bool: True if user owns the farm
    """
    from src.models import Farm
    
    result = await db.execute(
        select(Farm).where(
            Farm.id == farm_id,
            Farm.owner_id == user.id,
        )
    )
    farm = result.scalar_one_or_none()
    return farm is not None


# Convenience dependencies for common use cases
RequireAdmin = Depends(require_role(UserRole.admin))
RequireAgronomist = Depends(require_role(UserRole.agronomist))
RequireFarmer = Depends(require_role(UserRole.farmer))
