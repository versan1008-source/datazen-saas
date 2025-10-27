"""
Webhook model for user-configured webhooks
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from config.database import Base


class Webhook(Base):
    """Model for user-configured webhooks"""
    
    __tablename__ = "webhooks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    url = Column(String(2048), nullable=False)
    secret = Column(String(255), nullable=False)  # Secret key for HMAC verification
    events = Column(JSON, default=list)  # List of events to subscribe to
    active = Column(Boolean, default=True)
    last_triggered = Column(DateTime, nullable=True)
    last_response_status = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="webhooks")
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "url": self.url,
            "secret": self.secret,
            "events": self.events,
            "active": self.active,
            "last_triggered": self.last_triggered.isoformat() if self.last_triggered else None,
            "last_response_status": self.last_response_status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

