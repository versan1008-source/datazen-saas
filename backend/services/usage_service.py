"""
Usage tracking service for DataZen SaaS
"""

from datetime import datetime, timedelta
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from models.user import User
from models.usage_log import UsageLog
from models.subscription import Subscription, SubscriptionStatus
from models.plan import Plan
from services.auth_service import AuthService

class UsageService:
    """Service for tracking and managing user usage"""
    
    @staticmethod
    def log_usage(
        db: Session,
        user_id: str,
        url: str,
        data_type: str,
        pages_scraped: int = 1,
        source: str = "api",
        success: bool = True,
        error_message: Optional[str] = None,
        processing_time_seconds: Optional[int] = None
    ) -> UsageLog:
        """Log a scraping usage event"""
        
        # Check if quota reset is needed
        user = AuthService.get_user_by_id(db, user_id)
        if user and AuthService.check_quota_reset_needed(user):
            AuthService.reset_monthly_quota(db, user_id)
        
        # Create usage log
        usage_log = UsageLog(
            user_id=user_id,
            url=url,
            data_type=data_type,
            pages_scraped=pages_scraped,
            source=source,
            success=success,
            error_message=error_message,
            processing_time_seconds=processing_time_seconds
        )
        
        db.add(usage_log)
        
        # Update user quota
        if success and user:
            user.quota_used += pages_scraped
        
        db.commit()
        db.refresh(usage_log)
        
        return usage_log
    
    @staticmethod
    def check_quota(
        db: Session,
        user_id: str,
        pages_to_scrape: int = 1
    ) -> Tuple[bool, Optional[str]]:
        """Check if user has quota available"""
        
        user = AuthService.get_user_by_id(db, user_id)
        if not user:
            return False, "User not found"
        
        # Check if quota reset is needed
        if AuthService.check_quota_reset_needed(user):
            AuthService.reset_monthly_quota(db, user_id)
            user = AuthService.get_user_by_id(db, user_id)
        
        # Get user's plan
        if not user.plan_id:
            return False, "No active plan"
        
        plan = db.query(Plan).filter(Plan.id == user.plan_id).first()
        if not plan:
            return False, "Plan not found"
        
        # Check quota
        remaining_quota = plan.monthly_quota - user.quota_used
        if remaining_quota < pages_to_scrape:
            return False, f"Insufficient quota. Remaining: {remaining_quota} pages"
        
        return True, None
    
    @staticmethod
    def get_usage_stats(
        db: Session,
        user_id: str,
        days: int = 30
    ) -> dict:
        """Get usage statistics for a user"""
        
        user = AuthService.get_user_by_id(db, user_id)
        if not user:
            return {}
        
        # Get plan
        plan = db.query(Plan).filter(Plan.id == user.plan_id).first() if user.plan_id else None
        
        # Get usage logs for the period
        start_date = datetime.utcnow() - timedelta(days=days)
        usage_logs = db.query(UsageLog).filter(
            UsageLog.user_id == user_id,
            UsageLog.created_at >= start_date
        ).all()
        
        # Calculate statistics
        total_pages = sum(log.pages_scraped for log in usage_logs)
        successful_scrapes = len([log for log in usage_logs if log.success])
        failed_scrapes = len([log for log in usage_logs if not log.success])
        avg_processing_time = (
            sum(log.processing_time_seconds for log in usage_logs if log.processing_time_seconds) / 
            len([log for log in usage_logs if log.processing_time_seconds])
            if any(log.processing_time_seconds for log in usage_logs) else 0
        )
        
        # Get breakdown by source
        source_breakdown = {}
        for log in usage_logs:
            if log.source not in source_breakdown:
                source_breakdown[log.source] = 0
            source_breakdown[log.source] += log.pages_scraped
        
        # Get breakdown by data type
        type_breakdown = {}
        for log in usage_logs:
            if log.data_type not in type_breakdown:
                type_breakdown[log.data_type] = 0
            type_breakdown[log.data_type] += log.pages_scraped
        
        return {
            "user_id": user_id,
            "plan": plan.to_dict() if plan else None,
            "quota_used": user.quota_used,
            "quota_limit": plan.monthly_quota if plan else 0,
            "quota_remaining": (plan.monthly_quota - user.quota_used) if plan else 0,
            "quota_percentage": (user.quota_used / plan.monthly_quota * 100) if plan and plan.monthly_quota > 0 else 0,
            "total_pages_scraped": total_pages,
            "successful_scrapes": successful_scrapes,
            "failed_scrapes": failed_scrapes,
            "avg_processing_time_seconds": round(avg_processing_time, 2),
            "source_breakdown": source_breakdown,
            "type_breakdown": type_breakdown,
            "period_days": days
        }
    
    @staticmethod
    def get_user_usage_logs(
        db: Session,
        user_id: str,
        limit: int = 100,
        offset: int = 0
    ) -> list:
        """Get usage logs for a user"""
        
        logs = db.query(UsageLog).filter(
            UsageLog.user_id == user_id
        ).order_by(
            UsageLog.created_at.desc()
        ).limit(limit).offset(offset).all()
        
        return [log.to_dict() for log in logs]

