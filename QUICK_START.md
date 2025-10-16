# Quick Start - Testing & Integration

## 5-Minute Quick Start

### Step 1: Verify Fixes (2 minutes)
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

### Step 2: Start Backend (1 minute)
```bash
cd backend
python main.py
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Start Frontend (1 minute)
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
> ready - started server on 0.0.0.0:3000
```

### Step 4: Test in Browser (1 minute)
1. Open http://localhost:3000
2. Enter URL: `https://www.mit.edu`
3. Select data type: `text`
4. Click "Scrape"
5. See results with 20+ items extracted

## What Was Fixed

| Issue | Status | Impact |
|-------|--------|--------|
| University detection | ✅ FIXED | MIT: 26 items, Stanford: 147 items |
| Anti-bot headers | ✅ FIXED | Better website compatibility |
| Retry logic | ✅ FIXED | Handles rate limiting automatically |
| Error handling | ✅ FIXED | Specific error messages |
| LinkedIn scraping | ⚠️ Cannot fix | Use LinkedIn API instead |

## Testing Checklist

### Backend Tests
- [ ] Run `python test_fixes.py` - all tests pass
- [ ] Start `python main.py` - server runs
- [ ] Test health: `curl http://localhost:8000/health`

### API Tests
- [ ] Test university: `curl -X POST http://localhost:8000/api/scrape-enhanced -H "Content-Type: application/json" -d '{"url":"https://www.mit.edu","data_type":"text","ai_mode":false}'`
- [ ] Test general: `curl -X POST http://localhost:8000/api/scrape -H "Content-Type: application/json" -d '{"url":"https://example.com","data_type":"text","ai_mode":false}'`

### Frontend Tests
- [ ] Start `npm run dev` - frontend runs
- [ ] Open http://localhost:3000
- [ ] Scrape MIT: 20+ items ✅
- [ ] Scrape Stanford: 100+ items ✅
- [ ] Scrape Example.com: 2+ items ✅
- [ ] Download results as JSON ✅
- [ ] Download results as CSV ✅

## Common Commands

### Backend
```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run tests
python test_fixes.py

# Start server
python main.py

# Check health
curl http://localhost:8000/health
```

### Frontend
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

### Scraping
```
POST /api/scrape              # Standard scraper
POST /api/scrape-enhanced     # Enhanced scraper (university detection)
```

### Information
```
GET /api/health               # Health check
GET /api/supported-types      # Supported data types
GET /api/test-ai              # Test AI connection
GET /                          # API info
```

## Environment Variables

```bash
# Backend timeout (seconds)
SCRAPE_TIMEOUT_SECONDS=120

# Maximum HTML size (MB)
MAX_HTML_SIZE_MB=2

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r requirements.txt

# Check port 8000 is available
netstat -an | grep 8000
```

### Frontend won't start
```bash
# Check Node version
node --version  # Should be 16+

# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check port 3000 is available
netstat -an | grep 3000
```

### Can't connect backend to frontend
```bash
# Ensure backend is running on 8000
curl http://localhost:8000/health

# Ensure frontend is running on 3000
curl http://localhost:3000

# Check CORS is enabled (it is by default)
```

### Scraper returns no data
```bash
# Check logs for errors
cd backend
python main.py 2>&1 | grep -i error

# Try with a different website
# Try with AI mode disabled
# Check if website is JavaScript-heavy
```

## Next Steps

1. ✅ Run tests: `cd backend && python test_fixes.py`
2. ✅ Start backend: `cd backend && python main.py`
3. ✅ Start frontend: `cd frontend && npm run dev`
4. ✅ Test in browser: http://localhost:3000
5. 📖 Read detailed guides:
   - `TESTING_GUIDE.md` - Comprehensive testing
   - `INTEGRATION_GUIDE.md` - Integration details
   - `FIXES_README.md` - Feature documentation

## Key Features

### University Detection
- Automatically detects .edu domains
- Extracts institution name, programs, contact info
- Test: https://www.mit.edu (26 items), https://www.stanford.edu (147 items)

### Retry Logic
- 3 automatic retries with exponential backoff
- Handles rate limiting (429) and access denial (403)
- Configurable delays

### Anti-Bot Detection Evasion
- Comprehensive security headers
- Realistic User-Agent
- Sec-Fetch-* headers for browser legitimacy

### Better Error Handling
- Specific error messages
- Detailed logging
- Clear indication of failure reason

## Support

For detailed information, see:
- `TESTING_GUIDE.md` - How to test
- `INTEGRATION_GUIDE.md` - How to integrate
- `FIXES_README.md` - Feature details
- `INVESTIGATION_SUMMARY.md` - Investigation results
- `LINKEDIN_ALTERNATIVES.md` - LinkedIn alternatives

## Summary

Your web scraper has been significantly improved with:
- ✅ University website support (MIT: 26 items, Stanford: 147 items)
- ✅ Automatic retry logic with exponential backoff
- ✅ Better anti-bot detection evasion
- ✅ Improved error handling and logging

All fixes are already integrated into your extension. Just run the tests and start using it!

