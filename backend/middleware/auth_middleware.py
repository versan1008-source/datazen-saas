"""
Authentication middleware for DataZen SaaS
"""

from typing import Optional
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer
from starlette.authentication import AuthCredentials
from sqlalchemy.orm import Session

from config.database import get_db
from services.auth_service import AuthService
from models.user import User

security = HTTPBearer()

async def get_current_user(
    credentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token"""

    token = credentials.credentials
    
    # Verify JWT token
    payload = AuthService.verify_jwt_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Get user from database
    user_id = payload.get("user_id")
    user = AuthService.get_user_by_id(db, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user

async def get_current_user_optional(
    credentials = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, otherwise return None"""

    if not credentials:
        return None

    token = credentials.credentials
    payload = AuthService.verify_jwt_token(token)
    
    if not payload:
        return None
    
    user_id = payload.get("user_id")
    user = AuthService.get_user_by_id(db, user_id)
    
    return user if user and user.is_active else None

async def get_user_by_api_key(
    api_key: str,
    db: Session = Depends(get_db)
) -> User:
    """Get user by API key"""
    
    user = AuthService.get_user_by_api_key(db, api_key)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user

