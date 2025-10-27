"""
Scheduled Job model for recurring scraping tasks
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from config.database import Base


class ScheduledJob(Base):
    """Model for scheduled scraping jobs"""
    
    __tablename__ = "scheduled_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    url = Column(String(2048), nullable=False)
    data_type = Column(String(50), nullable=False)  # text, images, links, emails, phone_numbers
    frequency = Column(String(20), nullable=False)  # hourly, daily, weekly, monthly
    time = Column(String(5), nullable=False)  # HH:MM format
    ai_mode = Column(Boolean, default=False)
    custom_prompt = Column(String(1000), nullable=True)
    active = Column(Boolean, default=True)
    last_run = Column(DateTime, nullable=True)
    next_run = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="scheduled_jobs")
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "url": self.url,
            "data_type": self.data_type,
            "frequency": self.frequency,
            "time": self.time,
            "ai_mode": self.ai_mode,
            "custom_prompt": self.custom_prompt,
            "active": self.active,
            "last_run": self.last_run.isoformat() if self.last_run else None,
            "next_run": self.next_run.isoformat() if self.next_run else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

