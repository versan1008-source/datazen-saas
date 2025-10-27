"""
User model for DataZen SaaS
"""

from sqlalchemy import Column, String, DateTime, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from config.database import Base

class User(Base):
    """User model for authentication and subscription management"""
    
    __tablename__ = "users"
    
    # Primary key
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # User info
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    
    # API key for programmatic access
    api_key = Column(String(255), unique=True, nullable=True, index=True)
    
    # Subscription info
    plan_id = Column(String(36), ForeignKey("plans.id"), nullable=True)
    subscription_id = Column(String(36), nullable=True)  # Reference to active subscription

    # Usage tracking
    quota_used = Column(Integer, default=0)  # Pages scraped this month
    quota_reset_date = Column(DateTime, nullable=True)
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    plan = relationship("Plan", back_populates="users", foreign_keys=[plan_id])
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    usage_logs = relationship("UsageLog", back_populates="user", cascade="all, delete-orphan")
    scheduled_jobs = relationship("ScheduledJob", back_populates="user", cascade="all, delete-orphan")
    webhooks = relationship("Webhook", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.email}>"
    
    def to_dict(self):
        """Convert to dictionary"""
        # Get quota limit from plan
        quota_limit = 10  # Default to Free plan (10 pages)
        if self.plan:
            quota_limit = self.plan.monthly_quota

        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "plan_id": self.plan_id,
            "subscription_id": self.subscription_id,
            "quota_used": self.quota_used,
            "quota_limit": quota_limit,
            "quota_reset_date": self.quota_reset_date.isoformat() if self.quota_reset_date else None,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

