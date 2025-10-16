"""
Quota enforcement middleware for DataZen SaaS
"""

from typing import Optional
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session

from config.database import get_db
from models.user import User
from models.subscription import Subscription, SubscriptionStatus
from models.plan import Plan
from services.usage_service import UsageService

async def check_quota(
    user: User,
    db: Session = Depends(get_db),
    pages_to_scrape: int = 1
) -> bool:
    """Check if user has quota available"""
    
    # Check if user has active subscription
    if not user.subscription_id:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="No active subscription. Please subscribe to use this service."
        )
    
    subscription = db.query(Subscription).filter(
        Subscription.id == user.subscription_id
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Subscription not found"
        )
    
    # Check subscription status
    if subscription.status == SubscriptionStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Subscription has been cancelled"
        )
    
    if subscription.status == SubscriptionStatus.EXPIRED:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Subscription has expired"
        )
    
    # Allow grace period for failed payments
    if subscription.status == SubscriptionStatus.FAILED:
        if subscription.is_in_grace_period():
            # Allow usage during grace period
            pass
        else:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Payment failed. Please update your payment method."
            )
    
    # Check quota
    has_quota, error_message = UsageService.check_quota(db, user.id, pages_to_scrape)
    
    if not has_quota:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=error_message or "Quota exceeded. Please upgrade your plan."
        )
    
    return True

async def check_feature_access(
    user: User,
    feature_name: str,
    db: Session = Depends(get_db)
) -> bool:
    """Check if user's plan has access to a specific feature"""
    
    if not user.plan_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active plan"
        )
    
    plan = db.query(Plan).filter(Plan.id == user.plan_id).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Plan not found"
        )
    
    if not plan.has_feature(feature_name):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Feature '{feature_name}' is not available in your plan. Please upgrade."
        )
    
    return True

async def check_concurrent_jobs(
    user: User,
    db: Session = Depends(get_db)
) -> int:
    """Get max concurrent jobs allowed for user's plan"""
    
    if not user.plan_id:
        return 1
    
    plan = db.query(Plan).filter(Plan.id == user.plan_id).first()
    
    if not plan:
        return 1
    
    return plan.max_concurrent_jobs

async def check_team_seats(
    user: User,
    db: Session = Depends(get_db)
) -> int:
    """Get max team seats allowed for user's plan"""
    
    if not user.plan_id:
        return 1
    
    plan = db.query(Plan).filter(Plan.id == user.plan_id).first()
    
    if not plan:
        return 1
    
    return plan.max_team_seats

