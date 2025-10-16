"""
Razorpay integration service for DataZen SaaS
"""

import os
import hmac
import hashlib
import json
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import requests
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from config.razorpay import (
    RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET,
    RAZORPAY_CURRENCY, PRICING, GRACE_PERIOD_DAYS, RAZORPAY_API_BASE
)
from models.subscription import Subscription, SubscriptionStatus
from models.user import User
from models.plan import Plan

load_dotenv()

class RazorpayService:
    """Service for Razorpay payment integration"""
    
    @staticmethod
    def verify_webhook_signature(body: str, signature: str) -> bool:
        """Verify Razorpay webhook signature"""
        expected_signature = hmac.new(
            RAZORPAY_WEBHOOK_SECRET.encode(),
            body.encode(),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected_signature, signature)
    
    @staticmethod
    def create_subscription(
        db: Session,
        user_id: str,
        plan_key: str,
        customer_email: str,
        customer_name: str
    ) -> Dict[str, Any]:
        """Create a Razorpay subscription"""
        
        try:
            # Get plan details
            if plan_key not in PRICING:
                return {"success": False, "error": "Invalid plan"}
            
            plan_details = PRICING[plan_key]
            
            # Create customer in Razorpay
            customer_response = requests.post(
                f"{RAZORPAY_API_BASE}/customers",
                auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
                json={
                    "email": customer_email,
                    "name": customer_name
                }
            )
            
            if customer_response.status_code != 200:
                return {"success": False, "error": "Failed to create customer"}
            
            customer_data = customer_response.json()
            customer_id = customer_data["id"]
            
            # Create subscription
            subscription_response = requests.post(
                f"{RAZORPAY_API_BASE}/subscriptions",
                auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
                json={
                    "plan_id": plan_details.get("razorpay_plan_id"),
                    "customer_notify": 1,
                    "quantity": 1,
                    "total_count": 0,  # Infinite
                    "currency": RAZORPAY_CURRENCY,
                    "notes": {
                        "user_id": user_id,
                        "plan": plan_key
                    }
                }
            )
            
            if subscription_response.status_code != 200:
                return {"success": False, "error": "Failed to create subscription"}
            
            subscription_data = subscription_response.json()
            
            return {
                "success": True,
                "subscription_id": subscription_data["id"],
                "customer_id": customer_id,
                "short_url": subscription_data.get("short_url"),
                "status": subscription_data.get("status")
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def handle_subscription_event(
        db: Session,
        event_type: str,
        event_data: Dict[str, Any]
    ) -> bool:
        """Handle Razorpay subscription webhook events"""
        
        try:
            subscription_id = event_data.get("id")
            
            # Find subscription in database
            subscription = db.query(Subscription).filter(
                Subscription.razorpay_subscription_id == subscription_id
            ).first()
            
            if not subscription:
                return False
            
            # Handle different event types
            if event_type == "subscription.started":
                subscription.status = SubscriptionStatus.ACTIVE
                subscription.current_period_start = datetime.utcnow()
                subscription.current_period_end = datetime.utcnow() + timedelta(days=30)
                subscription.next_billing_date = subscription.current_period_end
                
            elif event_type == "subscription.renewed":
                subscription.status = SubscriptionStatus.ACTIVE
                subscription.current_period_start = datetime.utcnow()
                subscription.current_period_end = datetime.utcnow() + timedelta(days=30)
                subscription.next_billing_date = subscription.current_period_end
                subscription.last_payment_date = datetime.utcnow()
                subscription.failed_payment_count = 0
                subscription.grace_period_end = None
                
            elif event_type == "subscription.cancelled":
                subscription.status = SubscriptionStatus.CANCELLED
                subscription.cancelled_at = datetime.utcnow()
                
            elif event_type == "subscription.paused":
                subscription.status = SubscriptionStatus.PAUSED
                
            elif event_type == "subscription.resumed":
                subscription.status = SubscriptionStatus.ACTIVE
                
            elif event_type == "payment.failed":
                subscription.failed_payment_count += 1
                # Set grace period
                subscription.grace_period_end = datetime.utcnow() + timedelta(days=GRACE_PERIOD_DAYS)
                
                # If too many failures, pause subscription
                if subscription.failed_payment_count >= 3:
                    subscription.status = SubscriptionStatus.FAILED
            
            db.commit()
            return True
            
        except Exception as e:
            print(f"Error handling subscription event: {str(e)}")
            return False
    
    @staticmethod
    def cancel_subscription(subscription_id: str) -> Dict[str, Any]:
        """Cancel a Razorpay subscription"""
        
        try:
            response = requests.post(
                f"{RAZORPAY_API_BASE}/subscriptions/{subscription_id}/cancel",
                auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
                json={"notify_customer": 1}
            )
            
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": "Failed to cancel subscription"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def get_subscription_details(subscription_id: str) -> Dict[str, Any]:
        """Get subscription details from Razorpay"""
        
        try:
            response = requests.get(
                f"{RAZORPAY_API_BASE}/subscriptions/{subscription_id}",
                auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
            )
            
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": "Failed to fetch subscription"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}

