"""
Scheduling routes for managing scheduled scraping jobs
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from config.database import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from models.scheduled_job import ScheduledJob

router = APIRouter(prefix="/scheduling", tags=["scheduling"])


# Request/Response models
class CreateJobRequest(BaseModel):
    """Create scheduled job request"""
    url: str
    data_type: str
    frequency: str  # hourly, daily, weekly, monthly
    time: str  # HH:MM format
    ai_mode: bool = False
    custom_prompt: Optional[str] = None


class UpdateJobRequest(BaseModel):
    """Update scheduled job request"""
    url: Optional[str] = None
    data_type: Optional[str] = None
    frequency: Optional[str] = None
    time: Optional[str] = None
    ai_mode: Optional[bool] = None
    custom_prompt: Optional[str] = None
    active: Optional[bool] = None


class JobResponse(BaseModel):
    """Scheduled job response"""
    id: int
    url: str
    data_type: str
    frequency: str
    time: str
    ai_mode: bool
    custom_prompt: Optional[str]
    active: bool
    last_run: Optional[str]
    next_run: Optional[str]
    created_at: str
    updated_at: str


@router.post("/jobs", response_model=JobResponse)
async def create_job(
    request: CreateJobRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new scheduled job"""
    
    # Check if user's plan supports scheduling
    if current_user.plan.name not in ["Pro", "Business"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Scheduling is only available in Pro and Business plans"
        )
    
    # Check job limit
    job_count = db.query(ScheduledJob).filter(
        ScheduledJob.user_id == current_user.id,
        ScheduledJob.active == True
    ).count()
    
    max_jobs = 10 if current_user.plan.name == "Pro" else float('inf')
    if job_count >= max_jobs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {max_jobs} active jobs allowed for your plan"
        )
    
    # Create job
    job = ScheduledJob(
        user_id=current_user.id,
        url=request.url,
        data_type=request.data_type,
        frequency=request.frequency,
        time=request.time,
        ai_mode=request.ai_mode,
        custom_prompt=request.custom_prompt
    )
    
    db.add(job)
    db.commit()
    db.refresh(job)
    
    return JobResponse(**job.to_dict())


@router.get("/jobs", response_model=List[JobResponse])
async def list_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all scheduled jobs for current user"""
    
    jobs = db.query(ScheduledJob).filter(
        ScheduledJob.user_id == current_user.id
    ).all()
    
    return [JobResponse(**job.to_dict()) for job in jobs]


@router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific scheduled job"""
    
    job = db.query(ScheduledJob).filter(
        ScheduledJob.id == job_id,
        ScheduledJob.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    return JobResponse(**job.to_dict())


@router.put("/jobs/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: int,
    request: UpdateJobRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a scheduled job"""
    
    job = db.query(ScheduledJob).filter(
        ScheduledJob.id == job_id,
        ScheduledJob.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Update fields
    if request.url is not None:
        job.url = request.url
    if request.data_type is not None:
        job.data_type = request.data_type
    if request.frequency is not None:
        job.frequency = request.frequency
    if request.time is not None:
        job.time = request.time
    if request.ai_mode is not None:
        job.ai_mode = request.ai_mode
    if request.custom_prompt is not None:
        job.custom_prompt = request.custom_prompt
    if request.active is not None:
        job.active = request.active
    
    job.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(job)
    
    return JobResponse(**job.to_dict())


@router.delete("/jobs/{job_id}")
async def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a scheduled job"""
    
    job = db.query(ScheduledJob).filter(
        ScheduledJob.id == job_id,
        ScheduledJob.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    db.delete(job)
    db.commit()
    
    return {"status": "success", "message": "Job deleted"}

