"""
Billing and usage routes for DataZen SaaS
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from config.database import get_db
from services.usage_service import UsageService
from middleware.auth_middleware import get_current_user
from models.user import User

router = APIRouter(prefix="/billing", tags=["billing"])

# Response models
class UsageStatsResponse(BaseModel):
    """Usage statistics response"""
    user_id: str
    plan: dict
    quota_used: int
    quota_limit: int
    quota_remaining: int
    quota_percentage: float
    total_pages_scraped: int
    successful_scrapes: int
    failed_scrapes: int
    avg_processing_time_seconds: float
    source_breakdown: dict
    type_breakdown: dict
    period_days: int

class UsageLogResponse(BaseModel):
    """Usage log response"""
    id: str
    user_id: str
    url: str
    data_type: str
    pages_scraped: int
    source: str
    success: bool
    error_message: str
    processing_time_seconds: int
    created_at: str

@router.get("/usage/stats", response_model=UsageStatsResponse)
async def get_usage_stats(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get usage statistics for current user"""
    
    stats = UsageService.get_usage_stats(db, current_user.id, days)
    
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usage statistics not found"
        )
    
    return UsageStatsResponse(**stats)

@router.get("/usage/logs", response_model=list[UsageLogResponse])
async def get_usage_logs(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get usage logs for current user"""
    
    logs = UsageService.get_user_usage_logs(db, current_user.id, limit, offset)
    
    return [UsageLogResponse(**log) for log in logs]

@router.get("/quota-status")
async def get_quota_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current quota status"""
    
    stats = UsageService.get_usage_stats(db, current_user.id, 30)
    
    if not stats:
        return {
            "quota_used": 0,
            "quota_limit": 0,
            "quota_remaining": 0,
            "quota_percentage": 0,
            "status": "no_plan"
        }
    
    return {
        "quota_used": stats["quota_used"],
        "quota_limit": stats["quota_limit"],
        "quota_remaining": stats["quota_remaining"],
        "quota_percentage": stats["quota_percentage"],
        "status": "active" if stats["quota_remaining"] > 0 else "exceeded"
    }

@router.post("/check-quota")
async def check_quota(
    pages_to_scrape: int = 1,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if user has quota for scraping"""
    
    has_quota, error_message = UsageService.check_quota(db, current_user.id, pages_to_scrape)
    
    if not has_quota:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=error_message or "Quota exceeded"
        )
    
    return {
        "success": True,
        "message": "Quota available",
        "pages_to_scrape": pages_to_scrape
    }

@router.get("/billing-history")
async def get_billing_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get billing history for current user"""
    
    if not current_user.subscription_id:
        return {
            "billing_history": [],
            "message": "No active subscription"
        }
    
    # This would typically fetch from Razorpay API
    # For now, return a placeholder
    return {
        "user_id": current_user.id,
        "subscription_id": current_user.subscription_id,
        "billing_history": [],
        "message": "Billing history will be populated after first payment"
    }

@router.get("/invoice/{invoice_id}")
async def get_invoice(
    invoice_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get invoice details"""
    
    # This would typically fetch from Razorpay API
    return {
        "invoice_id": invoice_id,
        "user_id": current_user.id,
        "message": "Invoice details would be fetched from Razorpay"
    }

