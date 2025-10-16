"""
Subscription model for DataZen SaaS
"""

from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from config.database import Base

class SubscriptionStatus(str, enum.Enum):
    """Subscription status enum"""
    ACTIVE = "active"
    PAUSED = "paused"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PENDING = "pending"
    FAILED = "failed"

class Subscription(Base):
    """Subscription model for tracking user subscriptions"""
    
    __tablename__ = "subscriptions"
    
    # Primary key
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign keys
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    plan_id = Column(String(36), ForeignKey("plans.id"), nullable=False)
    
    # Razorpay subscription ID
    razorpay_subscription_id = Column(String(255), unique=True, nullable=True, index=True)
    
    # Status
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.PENDING)
    
    # Billing cycle dates
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    next_billing_date = Column(DateTime, nullable=True)
    
    # Payment tracking
    total_paid = Column(Integer, default=0)  # In cents (USD)
    failed_payment_count = Column(Integer, default=0)
    last_payment_date = Column(DateTime, nullable=True)
    
    # Grace period for failed renewals
    grace_period_end = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    cancelled_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="subscriptions", foreign_keys=[user_id])
    plan = relationship("Plan", foreign_keys=[plan_id])
    
    def __repr__(self):
        return f"<Subscription {self.id} - {self.status}>"
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "plan_id": self.plan_id,
            "razorpay_subscription_id": self.razorpay_subscription_id,
            "status": self.status.value,
            "current_period_start": self.current_period_start.isoformat() if self.current_period_start else None,
            "current_period_end": self.current_period_end.isoformat() if self.current_period_end else None,
            "next_billing_date": self.next_billing_date.isoformat() if self.next_billing_date else None,
            "total_paid": self.total_paid,
            "failed_payment_count": self.failed_payment_count,
            "last_payment_date": self.last_payment_date.isoformat() if self.last_payment_date else None,
            "grace_period_end": self.grace_period_end.isoformat() if self.grace_period_end else None,
            "created_at": self.created_at.isoformat(),
            "cancelled_at": self.cancelled_at.isoformat() if self.cancelled_at else None
        }
    
    def is_active(self) -> bool:
        """Check if subscription is currently active"""
        return self.status == SubscriptionStatus.ACTIVE
    
    def is_in_grace_period(self) -> bool:
        """Check if subscription is in grace period"""
        if not self.grace_period_end:
            return False
        return datetime.utcnow() < self.grace_period_end

