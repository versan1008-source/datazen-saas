"""
Authentication service for DataZen SaaS
"""

import os
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Tuple
import jwt
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from models.user import User
from models.plan import Plan

load_dotenv()

# JWT configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

class AuthService:
    """Authentication service for user management"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        return AuthService.hash_password(password) == password_hash
    
    @staticmethod
    def generate_api_key() -> str:
        """Generate a secure API key"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def create_jwt_token(user_id: str, email: str) -> Tuple[str, datetime]:
        """Create JWT token for user"""
        expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
        payload = {
            "user_id": user_id,
            "email": email,
            "exp": expiration,
            "iat": datetime.utcnow()
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return token, expiration
    
    @staticmethod
    def verify_jwt_token(token: str) -> Optional[dict]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    @staticmethod
    def register_user(
        db: Session,
        email: str,
        password: str,
        full_name: str = ""
    ) -> Tuple[Optional[User], Optional[str]]:
        """Register a new user"""
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            return None, "Email already registered"
        
        # Create new user
        user = User(
            email=email,
            password_hash=AuthService.hash_password(password),
            full_name=full_name,
            api_key=AuthService.generate_api_key(),
            quota_reset_date=datetime.utcnow()
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return user, None
    
    @staticmethod
    def login_user(
        db: Session,
        email: str,
        password: str
    ) -> Tuple[Optional[User], Optional[str]]:
        """Authenticate user and return user object"""
        
        # Find user by email
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None, "Invalid email or password"
        
        # Verify password
        if not AuthService.verify_password(password, user.password_hash):
            return None, "Invalid email or password"
        
        # Check if user is active
        if not user.is_active:
            return None, "User account is inactive"
        
        return user, None
    
    @staticmethod
    def get_user_by_api_key(db: Session, api_key: str) -> Optional[User]:
        """Get user by API key"""
        return db.query(User).filter(User.api_key == api_key).first()
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def regenerate_api_key(db: Session, user_id: str) -> Optional[str]:
        """Regenerate API key for user"""
        user = AuthService.get_user_by_id(db, user_id)
        if not user:
            return None
        
        user.api_key = AuthService.generate_api_key()
        db.commit()
        return user.api_key
    
    @staticmethod
    def reset_monthly_quota(db: Session, user_id: str) -> bool:
        """Reset monthly quota for user"""
        user = AuthService.get_user_by_id(db, user_id)
        if not user:
            return False
        
        user.quota_used = 0
        user.quota_reset_date = datetime.utcnow()
        db.commit()
        return True
    
    @staticmethod
    def check_quota_reset_needed(user: User) -> bool:
        """Check if user's monthly quota needs to be reset"""
        if not user.quota_reset_date:
            return True
        
        # Reset if more than 30 days have passed
        days_since_reset = (datetime.utcnow() - user.quota_reset_date).days
        return days_since_reset >= 30

