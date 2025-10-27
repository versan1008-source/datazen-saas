"""
API routes for DataZen web scraping functionality
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, status
from pydantic import BaseModel, HttpUrl, validator
from typing import Optional, Dict, Any, Literal
import asyncio
import logging
import os
from datetime import datetime
from sqlalchemy.orm import Session

from services.scraper import WebScraper
from services.fallback_scraper import FallbackScraper
from services.enhanced_scraper import EnhancedScraper
from services.gemini_api import GeminiAI
from services.utils import validate_url
from services.usage_service import UsageService
from middleware.auth_middleware import get_current_user
from config.database import get_db
from models.user import User

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Request models
class ScrapeRequest(BaseModel):
    """Request model for scraping endpoint"""
    url: str
    data_type: Literal["text", "images", "links", "emails", "phone_numbers"]
    ai_mode: bool = False
    custom_prompt: Optional[str] = ""
    check_robots: bool = True
    resolve_owner: bool = False

    @validator('url')
    def validate_url_format(cls, v):
        if not validate_url(v):
            raise ValueError('Invalid URL format')
        return v

class EnhancedScrapeRequest(BaseModel):
    """Request model for enhanced scraping endpoint with LinkedIn and social media support"""
    url: str
    data_type: Literal["text", "images", "links", "emails", "phone_numbers", "linkedin_profile", "linkedin_company", "linkedin_jobs", "social_posts", "ecommerce_products"]
    ai_mode: bool = False
    custom_prompt: Optional[str] = ""
    check_robots: bool = True
    extract_structured_data: bool = True
    resolve_owner: bool = False

    @validator('url')
    def validate_url_format(cls, v):
        if not validate_url(v):
            raise ValueError('Invalid URL format')
        return v

    @validator('data_type')
    def validate_data_type(cls, v):
        allowed_types = {"text", "images", "links", "emails", "phone_numbers"}
        if v not in allowed_types:
            raise ValueError(f'Data type must be one of: {", ".join(allowed_types)}')
        return v

class ScrapeResponse(BaseModel):
    """Response model for scraping endpoint"""
    success: bool
    data_type: str
    count: int
    data: list
    timestamp: str
    url: Optional[str] = None
    original_url: Optional[str] = None
    ai_processed: bool = False
    model: Optional[str] = None
    error: Optional[str] = None
    processing_time_seconds: Optional[float] = None

# Global scraper instance (will be initialized per request)
async def get_scraper():
    """Get a new scraper instance"""
    return WebScraper(timeout=20000, max_html_size_mb=2.0)

async def get_gemini_ai():
    """Get Gemini AI instance if available"""
    try:
        return GeminiAI()
    except ValueError as e:
        logger.warning(f"Gemini AI not available: {e}")
        return None

@router.post("/scrape", response_model=ScrapeResponse)
async def scrape_website(
    request: ScrapeRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Main scraping endpoint with authentication and quota checking

    Args:
        request (ScrapeRequest): Scraping request parameters
        background_tasks (BackgroundTasks): FastAPI background tasks
        current_user (User): Authenticated user
        db (Session): Database session

    Returns:
        ScrapeResponse: Scraping results
    """
    start_time = datetime.now()

    # Check if user has quota available
    has_quota, error_message = UsageService.check_quota(db, current_user.id, pages_to_scrape=1)
    if not has_quota:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=error_message or "Quota exceeded. Please upgrade your plan."
        )
    
    try:
        logger.info(f"Starting scrape request: {request.url} ({request.data_type})")
        
        # Try Playwright scraper first, fallback to requests if it fails
        result = None
        scraper_used = "playwright"

        try:
            # Initialize Playwright scraper with environment timeout
            timeout_ms = int(os.getenv('SCRAPE_TIMEOUT_SECONDS', 120)) * 1000
            max_size_mb = float(os.getenv('MAX_HTML_SIZE_MB', 2))
            async with WebScraper(timeout=timeout_ms, max_html_size_mb=max_size_mb) as scraper:
                # Perform basic scraping
                result = await scraper.scrape(
                    url=request.url,
                    data_type=request.data_type,
                    check_robots=request.check_robots,
                    resolve_owner=getattr(request, 'resolve_owner', False)
                )
        except Exception as playwright_error:
            logger.warning(f"Playwright scraper failed: {playwright_error}")
            logger.info("Falling back to requests-based scraper...")

            try:
                # Use fallback scraper with environment settings
                fallback_scraper = FallbackScraper()
                result = fallback_scraper.scrape(
                    url=request.url,
                    data_type=request.data_type
                )
                scraper_used = "fallback"
                logger.info(f"Fallback scraper successful for {request.url}")
            except Exception as fallback_error:
                logger.error(f"Both scrapers failed. Playwright: {playwright_error}, Fallback: {fallback_error}")
                error_detail = f"All scrapers failed. Playwright error: {str(playwright_error)}. Fallback error: {str(fallback_error)}"
                raise HTTPException(
                    status_code=500,
                    detail=error_detail
                )
            
        # If scraping failed or result is None, return error
        if not result or not result.get('success', False):
            error_message = result.get('error', 'Scraping failed') if result else 'Scraping failed - no result returned'
            raise HTTPException(
                status_code=400,
                detail=error_message
            )

        # If AI mode is enabled and we have data, process with Gemini
        if request.ai_mode and result.get('data'):
            gemini = await get_gemini_ai()

            if gemini and gemini.is_available():
                try:
                    # Get the HTML content for AI processing
                    if scraper_used == "fallback":
                        # Use fallback scraper to get HTML content
                        fallback_scraper = FallbackScraper(timeout=20, max_html_size_mb=2)
                        html_content, _ = fallback_scraper.fetch_page_content(request.url)
                    else:
                        # This shouldn't happen since we're outside the context, but handle it
                        import requests
                        response = requests.get(request.url, timeout=20)
                        html_content = response.text

                    # Process with AI
                    ai_result = await gemini.extract_structured_data(
                        html_content=html_content,
                        data_type=request.data_type,
                        custom_prompt=request.custom_prompt or ""
                    )

                    if ai_result.get('success', False):
                        # Use AI-processed data
                        result = ai_result
                        logger.info(f"AI processing successful for {request.url}")
                    else:
                        # AI failed, but we have basic scraping results
                        logger.warning(f"AI processing failed, using basic results: {ai_result.get('error')}")
                        result['ai_processing_error'] = ai_result.get('error')

                except Exception as e:
                    logger.error(f"AI processing error: {str(e)}")
                    result['ai_processing_error'] = str(e)
            else:
                logger.warning("AI mode requested but Gemini AI not available")
                result['ai_processing_error'] = "Gemini AI not configured"

        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        result['processing_time_seconds'] = round(processing_time, 2)

        # Log success
        logger.info(f"Scraping completed: {request.url} - {result.get('count', 0)} items in {processing_time:.2f}s")

        # Log usage for authenticated user
        UsageService.log_usage(
            db=db,
            user_id=current_user.id,
            url=request.url,
            data_type=request.data_type,
            pages_scraped=1,
            source="api",
            success=result.get('success', False),
            error_message=None,
            processing_time_seconds=int(processing_time)
        )

        # Return response
        return ScrapeResponse(**result)
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle unexpected errors
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.error(f"Unexpected error scraping {request.url}: {str(e)}")
        
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "message": str(e),
                "url": request.url,
                "processing_time_seconds": round(processing_time, 2)
            }
        )

@router.get("/test-ai")
async def test_ai_connection():
    """
    Test Gemini AI connection
    
    Returns:
        Dict[str, Any]: Test results
    """
    try:
        gemini = await get_gemini_ai()
        
        if not gemini:
            return {
                "success": False,
                "error": "Gemini AI not configured",
                "available": False
            }
        
        # Test connection
        test_result = await gemini.test_connection()
        test_result['available'] = True
        
        return test_result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "available": False
        }

@router.get("/supported-types")
async def get_supported_data_types():
    """
    Get list of supported data types
    
    Returns:
        Dict[str, Any]: Supported data types and their descriptions
    """
    return {
        "supported_types": {
            "text": {
                "description": "Extract visible text content from web pages",
                "examples": ["paragraphs", "headings", "articles", "product descriptions"]
            },
            "images": {
                "description": "Extract image URLs and metadata",
                "examples": ["product images", "logos", "banners", "gallery images"]
            },
            "links": {
                "description": "Extract all links and their metadata",
                "examples": ["navigation links", "external links", "social media links"]
            },
            "emails": {
                "description": "Extract email addresses and contact information",
                "examples": ["contact emails", "support emails", "business emails"]
            }
        },
        "ai_mode": {
            "description": "Enable AI-powered data structuring and analysis",
            "benefits": ["Better categorization", "Relevance scoring", "Context analysis"]
        }
    }

@router.get("/health")
async def health_check():
    """
    Health check for scraping service
    
    Returns:
        Dict[str, Any]: Health status
    """
    try:
        # Test basic scraper initialization
        async with WebScraper() as scraper:
            scraper_status = "healthy"
    except Exception as e:
        scraper_status = f"error: {str(e)}"
    
    # Test AI availability
    try:
        gemini = await get_gemini_ai()
        ai_status = "available" if gemini and gemini.is_available() else "not configured"
    except Exception as e:
        ai_status = f"error: {str(e)}"
    
    return {
        "status": "healthy" if scraper_status == "healthy" else "degraded",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "scraper": scraper_status,
            "ai": ai_status
        },
        "version": "1.0.0"
    }

@router.post("/scrape-enhanced")
async def scrape_enhanced(
    request: EnhancedScrapeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Enhanced scraping endpoint with LinkedIn and social media support and quota checking

    Args:
        request (EnhancedScrapeRequest): Scraping request with enhanced options
        current_user (User): Authenticated user
        db (Session): Database session

    Returns:
        Dict[str, Any]: Scraping results with enhanced data extraction
    """
    start_time = datetime.now()

    # Check if user has quota available
    has_quota, error_message = UsageService.check_quota(db, current_user.id, pages_to_scrape=1)
    if not has_quota:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=error_message or "Quota exceeded. Please upgrade your plan."
        )

    logger.info(f"Starting enhanced scrape request: {request.url} ({request.data_type})")

    try:
        # Use enhanced scraper
        enhanced_scraper = EnhancedScraper()
        result = enhanced_scraper.scrape(
            url=request.url,
            data_type=request.data_type
        )

        # If scraping failed or result is None, return error
        if not result or not result.get('success', False):
            error_message = result.get('error', 'Enhanced scraping failed') if result else 'Enhanced scraping failed - no result returned'
            raise HTTPException(
                status_code=400,
                detail=error_message
            )

        # If AI mode is enabled and we have data, process with Gemini
        if request.ai_mode and result.get('data'):
            gemini = await get_gemini_ai()

            if gemini and gemini.is_available():
                try:
                    # Get the HTML content for AI processing
                    html_content, _ = enhanced_scraper.fetch_page_content(request.url)

                    # Process with AI
                    ai_result = await gemini.extract_structured_data(
                        html_content=html_content,
                        data_type=request.data_type,
                        custom_prompt=request.custom_prompt or ""
                    )

                    if ai_result.get('success', False):
                        # Use AI-processed data
                        result = ai_result
                        logger.info(f"AI processing successful for {request.url}")
                    else:
                        # AI failed, but we have basic scraping results
                        logger.warning(f"AI processing failed, using basic results: {ai_result.get('error')}")
                        result['ai_processing_error'] = ai_result.get('error')

                except Exception as e:
                    logger.error(f"AI processing error: {str(e)}")
                    result['ai_processing_error'] = str(e)
            else:
                logger.warning("AI mode requested but Gemini AI not available")
                result['ai_processing_error'] = "Gemini AI not configured"

        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        result['processing_time_seconds'] = processing_time

        logger.info(f"Enhanced scraping completed: {request.url} - {result.get('count', 0)} items in {processing_time:.2f}s")

        # Log usage for authenticated user
        UsageService.log_usage(
            db=db,
            user_id=current_user.id,
            url=request.url,
            data_type=request.data_type,
            pages_scraped=1,
            source="api",
            success=result.get('success', False),
            error_message=None,
            processing_time_seconds=int(processing_time)
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.error(f"Unexpected error in enhanced scraping {request.url}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Enhanced scraping failed",
                "message": str(e),
                "url": request.url,
                "processing_time_seconds": processing_time
            }
        )
