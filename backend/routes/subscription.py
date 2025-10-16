"""
Subscription management routes for DataZen SaaS
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from config.database import get_db
from config.razorpay import PRICING
from services.razorpay_service import RazorpayService
from middleware.auth_middleware import get_current_user
from models.user import User
from models.subscription import Subscription, SubscriptionStatus
from models.plan import Plan

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

# Request/Response models
class CreateSubscriptionRequest(BaseModel):
    """Request to create a subscription"""
    plan_key: str  # "starter", "pro", "business"

class SubscriptionResponse(BaseModel):
    """Subscription response model"""
    id: str
    user_id: str
    plan_id: str
    status: str
    current_period_start: str
    current_period_end: str
    next_billing_date: str
    total_paid: int
    created_at: str

class CancelSubscriptionRequest(BaseModel):
    """Request to cancel subscription"""
    reason: str = ""

class PlanResponse(BaseModel):
    """Plan response model"""
    id: str
    name: str
    description: str
    price_usd: float
    monthly_quota: int
    max_concurrent_jobs: int
    max_team_seats: int
    features: dict

@router.get("/plans", response_model=list[PlanResponse])
async def get_plans(db: Session = Depends(get_db)):
    """Get all available plans"""
    
    plans = db.query(Plan).filter(Plan.is_active == True).all()
    
    return [
        PlanResponse(
            id=plan.id,
            name=plan.name,
            description=plan.description,
            price_usd=plan.price_usd,
            monthly_quota=plan.monthly_quota,
            max_concurrent_jobs=plan.max_concurrent_jobs,
            max_team_seats=plan.max_team_seats,
            features=plan.features
        )
        for plan in plans
    ]

@router.post("/create", response_model=dict)
async def create_subscription(
    request: CreateSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new subscription"""
    
    # Validate plan
    if request.plan_key not in PRICING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan"
        )
    
    plan_details = PRICING[request.plan_key]
    
    # Get or create plan in database
    plan = db.query(Plan).filter(Plan.name == plan_details["name"]).first()
    if not plan:
        plan = Plan(
            name=plan_details["name"],
            description=f"{plan_details['name']} Plan",
            price_usd=plan_details["price_usd"],
            monthly_quota=plan_details["monthly_quota"],
            max_concurrent_jobs=plan_details["max_concurrent_jobs"],
            max_team_seats=plan_details["max_team_seats"],
            features=plan_details["features"]
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)
    
    # Create Razorpay subscription
    result = RazorpayService.create_subscription(
        db=db,
        user_id=current_user.id,
        plan_key=request.plan_key,
        customer_email=current_user.email,
        customer_name=current_user.full_name or current_user.email
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to create subscription")
        )
    
    # Create subscription in database
    subscription = Subscription(
        user_id=current_user.id,
        plan_id=plan.id,
        razorpay_subscription_id=result["subscription_id"],
        status=SubscriptionStatus.PENDING
    )
    
    db.add(subscription)
    current_user.subscription_id = subscription.id
    current_user.plan_id = plan.id
    db.commit()
    db.refresh(subscription)
    
    return {
        "success": True,
        "subscription_id": subscription.id,
        "razorpay_subscription_id": result["subscription_id"],
        "short_url": result.get("short_url"),
        "message": "Subscription created. Please complete payment."
    }

@router.get("/current", response_model=SubscriptionResponse)
async def get_current_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's subscription"""
    
    if not current_user.subscription_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription"
        )
    
    subscription = db.query(Subscription).filter(
        Subscription.id == current_user.subscription_id
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    return SubscriptionResponse(
        id=subscription.id,
        user_id=subscription.user_id,
        plan_id=subscription.plan_id,
        status=subscription.status.value,
        current_period_start=subscription.current_period_start.isoformat() if subscription.current_period_start else None,
        current_period_end=subscription.current_period_end.isoformat() if subscription.current_period_end else None,
        next_billing_date=subscription.next_billing_date.isoformat() if subscription.next_billing_date else None,
        total_paid=subscription.total_paid,
        created_at=subscription.created_at.isoformat()
    )

@router.post("/cancel")
async def cancel_subscription(
    request: CancelSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel current subscription"""
    
    if not current_user.subscription_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription"
        )
    
    subscription = db.query(Subscription).filter(
        Subscription.id == current_user.subscription_id
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    # Cancel in Razorpay
    result = RazorpayService.cancel_subscription(subscription.razorpay_subscription_id)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to cancel subscription")
        )
    
    # Update in database
    subscription.status = SubscriptionStatus.CANCELLED
    subscription.cancelled_at = datetime.utcnow()
    db.commit()
    
    return {
        "success": True,
        "message": "Subscription cancelled successfully"
    }

