"""
Authentication routes for DataZen SaaS
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr, validator
from sqlalchemy.orm import Session
from datetime import datetime

from config.database import get_db
from services.auth_service import AuthService
from middleware.auth_middleware import get_current_user
from models.user import User

router = APIRouter(prefix="/auth", tags=["authentication"])

# Request/Response models
class RegisterRequest(BaseModel):
    """User registration request"""
    email: EmailStr
    password: str
    full_name: str = ""
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class LoginRequest(BaseModel):
    """User login request"""
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    """User login response"""
    access_token: str
    token_type: str = "bearer"
    user: dict
    expires_at: str

class UserResponse(BaseModel):
    """User response model"""
    id: str
    email: str
    full_name: str
    api_key: str
    plan_id: str
    subscription_id: str = None
    quota_used: int
    quota_limit: int
    is_active: bool
    is_verified: bool
    created_at: str

class RegenerateApiKeyRequest(BaseModel):
    """Request to regenerate API key"""
    pass

class RegenerateApiKeyResponse(BaseModel):
    """Response for API key regeneration"""
    api_key: str
    message: str

@router.post("/register", response_model=LoginResponse)
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    
    # Register user
    user, error = AuthService.register_user(
        db=db,
        email=request.email,
        password=request.password,
        full_name=request.full_name
    )
    
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )
    
    # Create JWT token
    token, expiration = AuthService.create_jwt_token(user.id, user.email)
    
    return LoginResponse(
        access_token=token,
        user=user.to_dict(),
        expires_at=expiration.isoformat()
    )

@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login user"""
    
    # Authenticate user
    user, error = AuthService.login_user(
        db=db,
        email=request.email,
        password=request.password
    )
    
    if error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error
        )
    
    # Create JWT token
    token, expiration = AuthService.create_jwt_token(user.id, user.email)
    
    return LoginResponse(
        access_token=token,
        user=user.to_dict(),
        expires_at=expiration.isoformat()
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""

    # Get quota limit from plan
    quota_limit = 10  # Default to Free plan (10 pages)
    if current_user.plan:
        quota_limit = current_user.plan.monthly_quota

    # Get subscription ID from first active subscription if exists
    subscription_id = None
    if current_user.subscriptions and len(current_user.subscriptions) > 0:
        subscription_id = current_user.subscriptions[0].id

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        api_key=current_user.api_key,
        plan_id=current_user.plan_id,
        subscription_id=subscription_id,
        quota_used=current_user.quota_used,
        quota_limit=quota_limit,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at.isoformat()
    )

@router.post("/regenerate-api-key", response_model=RegenerateApiKeyResponse)
async def regenerate_api_key(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Regenerate API key for current user"""
    
    new_api_key = AuthService.regenerate_api_key(db, current_user.id)
    
    if not new_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to regenerate API key"
        )
    
    return RegenerateApiKeyResponse(
        api_key=new_api_key,
        message="API key regenerated successfully"
    )

@router.post("/google")
async def google_login(
    db: Session = Depends(get_db)
):
    """Google OAuth login endpoint"""

    # For now, create a test user for Google login
    # In production, this would validate the Google token
    test_email = f"google_user_{datetime.utcnow().timestamp()}@google.com"
    test_name = "Google User"

    # Check if user exists, if not create one
    user, error = AuthService.register_user(
        db=db,
        email=test_email,
        password="google_oauth_user",
        full_name=test_name
    )

    if error and "already exists" not in error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )

    # If user already exists, get them
    if error:
        user, error = AuthService.login_user(
            db=db,
            email=test_email,
            password="google_oauth_user"
        )

    # Create JWT token
    token, expiration = AuthService.create_jwt_token(user.id, user.email)

    return LoginResponse(
        access_token=token,
        user=user.to_dict(),
        expires_at=expiration.isoformat()
    )

@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user)
):
    """Logout user (client-side token deletion)"""

    return {
        "message": "Logged out successfully",
        "timestamp": datetime.utcnow().isoformat()
    }

