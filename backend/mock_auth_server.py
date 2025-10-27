"""
Mock Authentication Server for Development
Provides mock auth endpoints for testing without full backend setup
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import jwt
import json
import os

app = FastAPI(
    title="DataZen Mock Auth API",
    description="Mock authentication server for development",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock database
mock_users = {}
JWT_SECRET = "mock-secret-key-for-development"
JWT_ALGORITHM = "HS256"

# Request/Response models
class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict
    expires_at: str

# Helper functions
def create_token(user_id: str, email: str):
    """Create JWT token"""
    expires = datetime.utcnow() + timedelta(days=7)
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expires
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token, expires

def create_user_response(user_id: str, email: str, full_name: str):
    """Create user response object"""
    return {
        "id": user_id,
        "email": email,
        "full_name": full_name,
        "plan_id": "free",
        "quota_used": 0,
        "quota_limit": 50,
        "created_at": datetime.utcnow().isoformat()
    }

# Routes
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "DataZen Mock Auth API",
        "version": "1.0.0"
    }

@app.post("/api/auth/register", response_model=LoginResponse)
async def register(request: RegisterRequest):
    """Register a new user"""
    
    # Check if user already exists
    if request.email in mock_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate password
    if len(request.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters"
        )
    
    # Create user
    user_id = f"user_{len(mock_users) + 1}"
    mock_users[request.email] = {
        "id": user_id,
        "email": request.email,
        "full_name": request.full_name,
        "password": request.password  # In production, this would be hashed
    }
    
    # Create token
    token, expires = create_token(user_id, request.email)
    user_data = create_user_response(user_id, request.email, request.full_name)
    
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=user_data,
        expires_at=expires.isoformat()
    )

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Login user"""
    
    # Check if user exists
    if request.email not in mock_users:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    user = mock_users[request.email]
    
    # Check password
    if user["password"] != request.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create token
    token, expires = create_token(user["id"], user["email"])
    user_data = create_user_response(user["id"], user["email"], user["full_name"])
    
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=user_data,
        expires_at=expires.isoformat()
    )

@app.post("/api/auth/google", response_model=LoginResponse)
async def google_login():
    """Google OAuth login endpoint"""
    
    # Create a test Google user
    user_id = f"google_user_{len(mock_users) + 1}"
    email = f"google_user_{len(mock_users)}@google.com"
    full_name = "Google User"
    
    # Store user if not exists
    if email not in mock_users:
        mock_users[email] = {
            "id": user_id,
            "email": email,
            "full_name": full_name,
            "password": "google_oauth"
        }
    
    user = mock_users[email]
    
    # Create token
    token, expires = create_token(user["id"], user["email"])
    user_data = create_user_response(user["id"], user["email"], user["full_name"])
    
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=user_data,
        expires_at=expires.isoformat()
    )

@app.get("/api/auth/me")
async def get_current_user(authorization: str = None):
    """Get current user info"""
    
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("email")
        
        if email not in mock_users:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        user = mock_users[email]
        return create_user_response(user["id"], user["email"], user["full_name"])
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

@app.post("/api/auth/logout")
async def logout():
    """Logout user"""
    return {
        "message": "Logged out successfully",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "DataZen Mock Auth API",
        "description": "Mock authentication server for development",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "register": "/api/auth/register",
            "login": "/api/auth/login",
            "google": "/api/auth/google",
            "me": "/api/auth/me",
            "logout": "/api/auth/logout"
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Mock Auth Server on http://localhost:8000")
    print("📝 This is a development server with mock data")
    print("🔐 All auth endpoints are available")
    uvicorn.run(app, host="0.0.0.0", port=8000)

