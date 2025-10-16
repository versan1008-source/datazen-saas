"""
Plan model for DataZen SaaS subscription tiers
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from config.database import Base

class Plan(Base):
    """Subscription plan model"""
    
    __tablename__ = "plans"
    
    # Primary key
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Plan info
    name = Column(String(100), unique=True, nullable=False)  # "Starter", "Pro", "Business"
    description = Column(String(500), nullable=True)
    
    # Pricing (in USD)
    price_usd = Column(Float, nullable=False)  # 4.99, 14.99, 39.99
    
    # Quotas and limits
    monthly_quota = Column(Integer, nullable=False)  # Pages per month
    max_concurrent_jobs = Column(Integer, default=1)
    max_team_seats = Column(Integer, default=1)
    
    # Features (JSON for flexibility)
    features = Column(JSON, default={
        "scheduling": False,
        "webhooks": False,
        "csv_export": False,
        "json_export": False,
        "dedicated_proxy": False,
        "captcha_solver": False,
        "priority_queue": False,
        "api_access": False
    })
    
    # Razorpay plan ID
    razorpay_plan_id = Column(String(255), nullable=True, unique=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    users = relationship("User", back_populates="plan")
    
    def __repr__(self):
        return f"<Plan {self.name} - ${self.price_usd}/mo>"
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price_usd": self.price_usd,
            "monthly_quota": self.monthly_quota,
            "max_concurrent_jobs": self.max_concurrent_jobs,
            "max_team_seats": self.max_team_seats,
            "features": self.features,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat()
        }
    
    def has_feature(self, feature_name: str) -> bool:
        """Check if plan has a specific feature"""
        return self.features.get(feature_name, False)

