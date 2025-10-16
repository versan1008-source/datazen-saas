# Integration Guide - Web Scraper Fixes

## Overview

Your extension already has the enhanced scraper integrated! The fixes are automatically used through the existing API endpoints. Here's how to use them:

## Architecture

```
Frontend (Next.js)
    ↓
API Client (frontend/src/lib/api.ts)
    ↓
Backend API (backend/routes/scrape.py)
    ↓
Scrapers:
  - EnhancedScraper (with fixes)
  - FallbackScraper (with retry logic)
  - WebScraper (Playwright)
```

## Using the Enhanced Scraper

### 1. University Website Scraping

The enhanced scraper automatically detects and handles university websites:

```typescript
// frontend/src/components/ScrapeForm.tsx
import { apiService } from '@/lib/api';

const result = await apiService.scrapeWebsiteEnhanced({
  url: 'https://www.mit.edu',
  data_type: 'text',
  ai_mode: false
});

// Result includes:
// - website_type: 'university'
// - count: 26 (items extracted)
// - data: [...] (extracted content)
```

### 2. Automatic Retry Logic

The scraper automatically retries with exponential backoff:

```typescript
// No code changes needed! Retry logic is automatic
const result = await apiService.scrapeWebsite({
  url: 'https://example.com',
  data_type: 'text',
  ai_mode: false
});

// If request fails with 429 or 403:
// - Retries automatically (3 attempts)
// - Waits 2s, then 4s, then 8s between retries
// - Returns result if successful
```

### 3. Better Error Handling

Errors now include specific information:

```typescript
try {
  const result = await apiService.scrapeWebsite({
    url: 'https://example.com',
    data_type: 'text'
  });
} catch (error) {
  // Error messages are now specific:
  // - "Rate limited after retries"
  // - "Access forbidden - website may block scrapers"
  // - "Connection error"
  console.error(error.message);
}
```

## API Endpoints

### 1. Enhanced Scraper Endpoint
```
POST /api/scrape-enhanced
```

**Request**:
```json
{
  "url": "https://www.mit.edu",
  "data_type": "text",
  "ai_mode": false,
  "check_robots": true,
  "extract_structured_data": true
}
```

**Response**:
```json
{
  "success": true,
  "website_type": "university",
  "data_type": "text",
  "count": 26,
  "data": [...],
  "timestamp": "2025-10-16T...",
  "processing_time_seconds": 3.45
}
```

### 2. Standard Scraper Endpoint
```
POST /api/scrape
```

**Request**:
```json
{
  "url": "https://example.com",
  "data_type": "text",
  "ai_mode": false,
  "check_robots": true
}
```

**Response**:
```json
{
  "success": true,
  "data_type": "text",
  "count": 2,
  "data": [...],
  "timestamp": "2025-10-16T...",
  "processing_time_seconds": 1.23
}
```

## Frontend Integration

### 1. Update ScrapeForm Component

The form already supports the enhanced scraper. To use it:

```typescript
// frontend/src/components/ScrapeForm.tsx
import { apiService } from '@/lib/api';

export default function ScrapeForm() {
  const handleSubmit = async (formData) => {
    try {
      // Use enhanced scraper for better results
      const result = await apiService.scrapeWebsiteEnhanced({
        url: formData.url,
        data_type: formData.dataType,
        ai_mode: formData.aiMode,
        check_robots: true,
        extract_structured_data: true
      });
      
      // Display results
      setResults(result);
    } catch (error) {
      setError(error.message);
    }
  };
  
  return (
    // Your form JSX
  );
}
```

### 2. Display Website Type

Show the detected website type in results:

```typescript
// frontend/src/components/ResultTable.tsx
export default function ResultTable({ result }) {
  return (
    <div>
      <div className="info-bar">
        <span>Website Type: {result.website_type || 'general'}</span>
        <span>Items: {result.count}</span>
        <span>Time: {result.processing_time_seconds}s</span>
      </div>
      
      <table>
        {/* Display results */}
      </table>
    </div>
  );
}
```

### 3. Handle University Data

University websites return structured data:

```typescript
if (result.website_type === 'university') {
  // Extract university-specific data
  const institutionName = result.data.find(item => 
    item.text?.includes('MIT') || item.text?.includes('Stanford')
  );
  
  const programs = result.data.filter(item =>
    item.text?.toLowerCase().includes('program')
  );
  
  const contact = result.data.filter(item =>
    item.text?.includes('@') || item.text?.includes('phone')
  );
}
```

## Backend Integration

### 1. The Scrapers Are Already Integrated

Your backend already uses all three scrapers:

```python
# backend/routes/scrape.py (lines 115-146)

# Try Playwright first
try:
    async with WebScraper(...) as scraper:
        result = await scraper.scrape(...)
except Exception:
    # Fallback to requests-based scraper
    fallback_scraper = FallbackScraper()
    result = fallback_scraper.scrape(...)
```

### 2. Enhanced Scraper Endpoint

The enhanced scraper endpoint is already available:

```python
# backend/routes/scrape.py (lines 320-402)

@router.post("/scrape-enhanced")
async def scrape_enhanced(request: EnhancedScrapeRequest):
    enhanced_scraper = EnhancedScraper()
    result = enhanced_scraper.scrape(
        url=request.url,
        data_type=request.data_type
    )
    # ... rest of implementation
```

### 3. Configuration

Configure timeouts and limits via environment variables:

```bash
# .env file
SCRAPE_TIMEOUT_SECONDS=120
MAX_HTML_SIZE_MB=2
```

Or programmatically:

```python
from services.enhanced_scraper import EnhancedScraper

scraper = EnhancedScraper(
    timeout=120,           # seconds
    max_html_size_mb=2     # MB
)
```

## Testing Integration

### 1. Test Backend Only
```bash
cd backend
python test_fixes.py
```

### 2. Test API Endpoints
```bash
# Start backend
cd backend
python main.py

# In another terminal, test endpoint
curl -X POST http://localhost:8000/api/scrape-enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.mit.edu",
    "data_type": "text",
    "ai_mode": false
  }'
```

### 3. Test Full Stack
```bash
# Terminal 1: Start backend
cd backend
python main.py

# Terminal 2: Start frontend
cd frontend
npm run dev

# Terminal 3: Open browser
# Go to http://localhost:3000
# Test scraping
```

## Deployment

### 1. Production Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 2. Production Frontend
```bash
cd frontend
npm install
npm run build
npm start
```

### 3. Docker (Optional)

Create `backend/Dockerfile`:
```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

Build and run:
```bash
docker build -t datazen-backend .
docker run -p 8000:8000 datazen-backend
```

## Troubleshooting Integration

### Issue: Frontend can't connect to backend
**Solution**: Ensure backend is running and CORS is configured
```python
# backend/main.py (already configured)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Scraper returns no data
**Solution**: Check if website is JavaScript-heavy
- Use Playwright scraper (already tried first)
- Check logs for specific errors
- Verify website structure

### Issue: Timeout errors
**Solution**: Increase timeout
```bash
export SCRAPE_TIMEOUT_SECONDS=180
```

### Issue: Rate limiting
**Solution**: Automatic retry logic handles this
- Scraper retries 3 times with backoff
- Check logs for "Rate limited" messages

## Next Steps

1. ✅ Fixes are already integrated
2. Run tests: `cd backend && python test_fixes.py`
3. Start backend: `cd backend && python main.py`
4. Start frontend: `cd frontend && npm run dev`
5. Test in browser: http://localhost:3000
6. Deploy to production

## Summary

Your extension already has all the fixes integrated! The enhanced scraper with university detection, retry logic, and better error handling is automatically used through the existing API endpoints. Just run the tests and start using it!

