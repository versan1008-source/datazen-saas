"""
Razorpay configuration for DataZen SaaS
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Razorpay API credentials
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

# Razorpay webhook secret for signature verification
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")

# Currency for all transactions (USD)
RAZORPAY_CURRENCY = "USD"

# Subscription settings
SUBSCRIPTION_INTERVAL = 12  # Monthly (12 months = 1 year, but we use monthly)
SUBSCRIPTION_PERIOD = "monthly"

# Grace period for failed renewals (in days)
GRACE_PERIOD_DAYS = 3

# Razorpay plan IDs (to be created in Razorpay dashboard)
RAZORPAY_PLANS = {
    "free": os.getenv("RAZORPAY_PLAN_FREE", ""),
    "starter": os.getenv("RAZORPAY_PLAN_STARTER", ""),
    "pro": os.getenv("RAZORPAY_PLAN_PRO", ""),
    "business": os.getenv("RAZORPAY_PLAN_BUSINESS", "")
}

# Pricing in USD (in cents for Razorpay)
PRICING = {
    "free": {
        "name": "Free",
        "price_usd": 0.00,
        "price_cents": 0,  # Free
        "monthly_quota": 500,
        "max_concurrent_jobs": 1,
        "max_team_seats": 1,
        "features": {
            "scheduling": False,
            "webhooks": False,
            "csv_export": False,
            "json_export": True,
            "dedicated_proxy": False,
            "captcha_solver": False,
            "priority_queue": False,
            "api_access": False,
            "basic_extraction": True,
            "email_support": True
        }
    },
    "starter": {
        "name": "Starter",
        "price_usd": 4.99,
        "price_cents": 499,  # $4.99 in cents
        "monthly_quota": 2000,
        "max_concurrent_jobs": 1,
        "max_team_seats": 1,
        "features": {
            "scheduling": False,
            "webhooks": False,
            "csv_export": False,
            "json_export": True,
            "dedicated_proxy": False,
            "captcha_solver": False,
            "priority_queue": False,
            "api_access": False,
            "basic_extraction": True,
            "email_support": True
        }
    },
    "pro": {
        "name": "Pro",
        "price_usd": 14.99,
        "price_cents": 1499,  # $14.99 in cents
        "monthly_quota": 25000,
        "max_concurrent_jobs": 10,
        "max_team_seats": 1,
        "features": {
            "scheduling": True,
            "webhooks": True,
            "csv_export": True,
            "json_export": True,
            "dedicated_proxy": False,
            "captcha_solver": False,
            "priority_queue": False,
            "api_access": True,
            "advanced_extraction": True,
            "priority_email_support": True
        }
    },
    "business": {
        "name": "Business",
        "price_usd": 39.99,
        "price_cents": 3999,  # $39.99 in cents
        "monthly_quota": 100000,
        "max_concurrent_jobs": 999,  # Unlimited
        "max_team_seats": 3,
        "features": {
            "scheduling": True,
            "webhooks": True,
            "csv_export": True,
            "json_export": True,
            "dedicated_proxy": True,
            "captcha_solver": True,
            "priority_queue": True,
            "api_access": True,
            "enterprise_extraction": True,
            "phone_support_24_7": True
        }
    }
}

# Webhook event types to handle
WEBHOOK_EVENTS = {
    "subscription.started": "subscription_started",
    "subscription.renewed": "subscription_renewed",
    "subscription.cancelled": "subscription_cancelled",
    "subscription.paused": "subscription_paused",
    "subscription.resumed": "subscription_resumed",
    "subscription.pending": "subscription_pending",
    "subscription.halted": "subscription_halted",
    "subscription.completed": "subscription_completed",
    "payment.authorized": "payment_authorized",
    "payment.failed": "payment_failed",
    "payment.captured": "payment_captured"
}

# Razorpay API endpoints
RAZORPAY_API_BASE = "https://api.razorpay.com/v1"

# Webhook endpoint (to be configured in Razorpay dashboard)
WEBHOOK_ENDPOINT = os.getenv("WEBHOOK_ENDPOINT", "https://yourdomain.com/api/webhooks/razorpay")

# Verify Razorpay credentials are set
def verify_razorpay_config():
    """Verify Razorpay configuration is complete"""
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise ValueError(
            "Razorpay credentials not configured. "
            "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables."
        )
    return True

