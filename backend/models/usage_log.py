"""
Usage log model for tracking scraping usage
"""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from config.database import Base

class UsageLog(Base):
    """Usage log model for tracking scraping activity"""
    
    __tablename__ = "usage_logs"
    
    # Primary key
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign key
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    
    # Usage details
    url = Column(Text, nullable=False)
    data_type = Column(String(50), nullable=False)  # text, images, links, emails
    pages_scraped = Column(Integer, default=1)
    
    # Source of request
    source = Column(String(50), default="api")  # api, extension, cli, dashboard
    
    # Status
    success = Column(Boolean, default=True)
    error_message = Column(Text, nullable=True)
    
    # Performance
    processing_time_seconds = Column(Integer, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = relationship("User", back_populates="usage_logs")
    
    def __repr__(self):
        return f"<UsageLog {self.user_id} - {self.pages_scraped} pages>"
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "url": self.url,
            "data_type": self.data_type,
            "pages_scraped": self.pages_scraped,
            "source": self.source,
            "success": self.success,
            "error_message": self.error_message,
            "processing_time_seconds": self.processing_time_seconds,
            "created_at": self.created_at.isoformat()
        }

