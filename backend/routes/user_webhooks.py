"""
User webhook management routes
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import secrets

from config.database import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from models.webhook import Webhook

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


# Request/Response models
class CreateWebhookRequest(BaseModel):
    """Create webhook request"""
    url: str
    events: List[str]  # List of events to subscribe to


class UpdateWebhookRequest(BaseModel):
    """Update webhook request"""
    url: Optional[str] = None
    events: Optional[List[str]] = None
    active: Optional[bool] = None


class WebhookResponse(BaseModel):
    """Webhook response"""
    id: int
    url: str
    secret: str
    events: List[str]
    active: bool
    last_triggered: Optional[str]
    last_response_status: Optional[int]
    created_at: str
    updated_at: str


@router.post("/", response_model=WebhookResponse)
async def create_webhook(
    request: CreateWebhookRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new webhook"""
    
    # Check if user's plan supports webhooks
    if current_user.plan.name not in ["Pro", "Business"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Webhooks are only available in Pro and Business plans"
        )
    
    # Generate secret key
    secret = "whk_" + secrets.token_hex(32)
    
    # Create webhook
    webhook = Webhook(
        user_id=current_user.id,
        url=request.url,
        secret=secret,
        events=request.events
    )
    
    db.add(webhook)
    db.commit()
    db.refresh(webhook)
    
    return WebhookResponse(**webhook.to_dict())


@router.get("/", response_model=List[WebhookResponse])
async def list_webhooks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all webhooks for current user"""
    
    webhooks = db.query(Webhook).filter(
        Webhook.user_id == current_user.id
    ).all()
    
    return [WebhookResponse(**webhook.to_dict()) for webhook in webhooks]


@router.get("/{webhook_id}", response_model=WebhookResponse)
async def get_webhook(
    webhook_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific webhook"""
    
    webhook = db.query(Webhook).filter(
        Webhook.id == webhook_id,
        Webhook.user_id == current_user.id
    ).first()
    
    if not webhook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook not found"
        )
    
    return WebhookResponse(**webhook.to_dict())


@router.put("/{webhook_id}", response_model=WebhookResponse)
async def update_webhook(
    webhook_id: int,
    request: UpdateWebhookRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a webhook"""
    
    webhook = db.query(Webhook).filter(
        Webhook.id == webhook_id,
        Webhook.user_id == current_user.id
    ).first()
    
    if not webhook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook not found"
        )
    
    # Update fields
    if request.url is not None:
        webhook.url = request.url
    if request.events is not None:
        webhook.events = request.events
    if request.active is not None:
        webhook.active = request.active
    
    webhook.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(webhook)
    
    return WebhookResponse(**webhook.to_dict())


@router.delete("/{webhook_id}")
async def delete_webhook(
    webhook_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a webhook"""
    
    webhook = db.query(Webhook).filter(
        Webhook.id == webhook_id,
        Webhook.user_id == current_user.id
    ).first()
    
    if not webhook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook not found"
        )
    
    db.delete(webhook)
    db.commit()
    
    return {"status": "success", "message": "Webhook deleted"}


@router.post("/{webhook_id}/test")
async def test_webhook(
    webhook_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test a webhook by sending a test event"""
    
    webhook = db.query(Webhook).filter(
        Webhook.id == webhook_id,
        Webhook.user_id == current_user.id
    ).first()
    
    if not webhook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook not found"
        )
    
    # TODO: Implement webhook test logic
    # This would send a test event to the webhook URL
    
    return {
        "status": "success",
        "message": "Test event sent",
        "webhook_id": webhook_id
    }

