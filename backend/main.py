"""
DataZen - Real-Time Web Scraper Backend
FastAPI application for web scraping with optional AI integration
"""

import asyncio
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from dotenv import load_dotenv
import os

# Fix for Windows subprocess issue
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

# Load environment variables
load_dotenv()

# Initialize database
from config.database import init_db
init_db()

# Import routes
from routes.scrape import router as scrape_router
from routes.auth import router as auth_router
from routes.subscription import router as subscription_router
from routes.billing import router as billing_router
from routes.webhooks import router as webhooks_router
from routes.scheduling import router as scheduling_router
from routes.user_webhooks import router as user_webhooks_router

# Create FastAPI app
app = FastAPI(
    title="DataZen API",
    description="Real-time web scraper with AI-powered data extraction",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://versan.in",
        "https://www.versan.in",
        "https://datazen-saas-42hvu5tey-pranaos-projects.vercel.app",
        "http://localhost:3000",
        "http://localhost:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(scrape_router, prefix="/api", tags=["scraping"])
app.include_router(auth_router, prefix="/api", tags=["authentication"])
app.include_router(subscription_router, prefix="/api", tags=["subscriptions"])
app.include_router(billing_router, prefix="/api", tags=["billing"])
app.include_router(webhooks_router, prefix="/api", tags=["webhooks"])
app.include_router(scheduling_router, prefix="/api", tags=["scheduling"])
app.include_router(user_webhooks_router, prefix="/api", tags=["user-webhooks"])

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to DataZen API",
        "description": "Real-time web scraper with AI-powered data extraction",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "scrape": "/api/scrape",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "DataZen API",
        "version": "1.0.0"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "type": type(exc).__name__
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
