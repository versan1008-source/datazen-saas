# Testing Guide - Web Scraper Fixes

## Quick Start Testing

### 1. Run Unit Tests
```bash
cd backend
python test_fixes.py
```

**Expected Output:**
```
✅ MIT University: 26 items extracted
✅ Stanford University: 147 items extracted
✅ HTTPBin: 2 items extracted
✅ Example.com: 2 items extracted
✅ Fallback Scraper: 3-5 items extracted
```

### 2. Test with Your Extension

#### Start Backend Server
```bash
cd backend
python main.py
```

Server will run on `http://localhost:8000`

#### Test API Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Get supported types
curl http://localhost:8000/api/supported-types

# Test enhanced scraper (university)
curl -X POST http://localhost:8000/api/scrape-enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.mit.edu",
    "data_type": "text",
    "ai_mode": false
  }'

# Test fallback scraper
curl -X POST http://localhost:8000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "data_type": "text",
    "ai_mode": false
  }'
```

## Manual Testing Scenarios

### Scenario 1: University Website Scraping
**URL**: https://www.mit.edu
**Expected**: 
- Website type detected as "university"
- 20+ items extracted
- Includes institution name, programs, contact info

**Test Command**:
```bash
curl -X POST http://localhost:8000/api/scrape-enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.mit.edu",
    "data_type": "text",
    "ai_mode": false
  }'
```

### Scenario 2: General Website Scraping
**URL**: https://example.com
**Expected**:
- Website type detected as "general"
- 2+ items extracted
- Basic text content

**Test Command**:
```bash
curl -X POST http://localhost:8000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "data_type": "text",
    "ai_mode": false
  }'
```

### Scenario 3: Rate Limiting Handling
**URL**: https://httpbin.org/status/429
**Expected**:
- Scraper retries 3 times
- Exponential backoff applied
- Proper error message if all retries fail

**Test Command**:
```bash
curl -X POST http://localhost:8000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://httpbin.org/status/429",
    "data_type": "text",
    "ai_mode": false
  }'
```

### Scenario 4: Access Denied Handling
**URL**: https://httpbin.org/status/403
**Expected**:
- Scraper retries 3 times
- Proper error message
- Logs indicate access denied

**Test Command**:
```bash
curl -X POST http://localhost:8000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://httpbin.org/status/403",
    "data_type": "text",
    "ai_mode": false
  }'
```

## Frontend Testing

### 1. Start Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

### 2. Test in Browser

#### Test University Scraping
1. Go to http://localhost:3000
2. Enter URL: `https://www.mit.edu`
3. Select data type: `text`
4. Click "Scrape"
5. Verify: 20+ items extracted, website type shows "university"

#### Test General Website
1. Enter URL: `https://example.com`
2. Select data type: `text`
3. Click "Scrape"
4. Verify: 2+ items extracted

#### Test with AI Mode
1. Enter URL: `https://www.mit.edu`
2. Select data type: `text`
3. Enable "AI Mode"
4. Click "Scrape"
5. Verify: AI processes results (if Gemini API configured)

## Automated Testing

### Create Test Suite
```python
# backend/test_integration.py
import asyncio
from services.enhanced_scraper import EnhancedScraper
from services.fallback_scraper import FallbackScraper

async def test_university_detection():
    scraper = EnhancedScraper()
    result = scraper.scrape('https://www.mit.edu', data_type='text')
    assert result['success'] == True
    assert result['website_type'] == 'university'
    assert result['count'] > 0
    print("✅ University detection test passed")

async def test_retry_logic():
    scraper = FallbackScraper()
    # This should retry and eventually fail gracefully
    result = scraper.scrape('https://httpbin.org/status/429', data_type='text')
    print("✅ Retry logic test passed")

async def main():
    await test_university_detection()
    await test_retry_logic()

if __name__ == "__main__":
    asyncio.run(main())
```

Run with:
```bash
cd backend
python test_integration.py
```

## Performance Testing

### Test Response Times
```bash
# Time a scrape request
time curl -X POST http://localhost:8000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "data_type": "text",
    "ai_mode": false
  }'
```

**Expected Times**:
- Simple website: 2-5 seconds
- University website: 3-8 seconds
- With AI mode: 10-30 seconds

## Debugging

### Enable Debug Logging
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Check Logs
```bash
# Backend logs
cd backend
python main.py 2>&1 | grep -i "error\|warning\|retry"
```

### Test Individual Scrapers
```python
from services.enhanced_scraper import EnhancedScraper

scraper = EnhancedScraper()
result = scraper.scrape('https://www.mit.edu', data_type='text')
print(f"Success: {result['success']}")
print(f"Website Type: {result.get('website_type')}")
print(f"Items: {result['count']}")
print(f"Data: {result['data'][:2]}")  # First 2 items
```

## Troubleshooting

### Issue: "Connection refused"
**Solution**: Ensure backend is running
```bash
cd backend
python main.py
```

### Issue: "Rate limited (429)"
**Solution**: This is expected behavior, scraper will retry automatically

### Issue: "Access forbidden (403)"
**Solution**: Website may block scrapers, try with different User-Agent or proxy

### Issue: "Timeout"
**Solution**: Increase timeout in environment variables
```bash
export SCRAPE_TIMEOUT_SECONDS=180
```

### Issue: "No items extracted"
**Solution**: 
- Check if website is JavaScript-heavy (use Playwright)
- Verify website structure hasn't changed
- Check robots.txt restrictions

## Test Checklist

- [ ] Backend server starts without errors
- [ ] Health check endpoint responds
- [ ] University website detected correctly
- [ ] 20+ items extracted from MIT
- [ ] 100+ items extracted from Stanford
- [ ] General websites work
- [ ] Retry logic works (test with 429 status)
- [ ] Error handling works (test with 403 status)
- [ ] Frontend connects to backend
- [ ] Scrape form submits successfully
- [ ] Results display correctly
- [ ] Download functionality works
- [ ] AI mode works (if configured)

## Next Steps

1. Run `python test_fixes.py` to verify all fixes
2. Start backend with `python main.py`
3. Start frontend with `npm run dev`
4. Test in browser at http://localhost:3000
5. Try different websites and data types
6. Check logs for any errors
7. Adjust configuration as needed

