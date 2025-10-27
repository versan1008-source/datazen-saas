"""
Database configuration and session management for DataZen SaaS
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Database URL from environment or use SQLite for development
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./datazen_saas.db"
)

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=os.getenv("SQL_ECHO", "false").lower() == "true"
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    # Import all models to register them with SQLAlchemy
    from models.user import User
    from models.plan import Plan
    from models.subscription import Subscription
    from models.usage_log import UsageLog
    from models.scheduled_job import ScheduledJob
    from models.webhook import Webhook

    Base.metadata.create_all(bind=engine)

def drop_db():
    """Drop all database tables (for testing)"""
    Base.metadata.drop_all(bind=engine)

