"""
Webhook handlers for Razorpay events
"""

from fastapi import APIRouter, HTTPException, Depends, status, Header, Request
from sqlalchemy.orm import Session
import json
import logging

from config.database import get_db
from config.razorpay import WEBHOOK_EVENTS
from services.razorpay_service import RazorpayService

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

logger = logging.getLogger(__name__)

@router.post("/razorpay")
async def handle_razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    """Handle Razorpay webhook events"""
    
    try:
        # Get request body
        body = await request.body()
        body_str = body.decode('utf-8')
        
        # Verify webhook signature
        if not RazorpayService.verify_webhook_signature(body_str, x_razorpay_signature):
            logger.warning("Invalid webhook signature")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid webhook signature"
            )
        
        # Parse event data
        event_data = json.loads(body_str)
        event_type = event_data.get("event")
        payload = event_data.get("payload", {})
        
        logger.info(f"Received webhook event: {event_type}")
        
        # Handle subscription events
        if event_type in WEBHOOK_EVENTS:
            if "subscription" in event_type:
                subscription_data = payload.get("subscription", {})
                success = RazorpayService.handle_subscription_event(
                    db=db,
                    event_type=event_type,
                    event_data=subscription_data
                )
                
                if success:
                    logger.info(f"Successfully processed {event_type}")
                    return {"status": "success", "event": event_type}
                else:
                    logger.error(f"Failed to process {event_type}")
                    return {"status": "failed", "event": event_type}
            
            elif "payment" in event_type:
                payment_data = payload.get("payment", {})
                # Handle payment events
                logger.info(f"Payment event: {event_type}")
                return {"status": "success", "event": event_type}
        
        else:
            logger.warning(f"Unknown event type: {event_type}")
            return {"status": "ignored", "event": event_type}
        
    except json.JSONDecodeError:
        logger.error("Invalid JSON in webhook body")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON"
        )
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/test")
async def test_webhook():
    """Test webhook endpoint"""
    return {
        "status": "ok",
        "message": "Webhook endpoint is working"
    }

