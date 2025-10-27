# 📱 Phone Numbers Feature - Local Testing Guide

## Quick Start (5 minutes)

### Prerequisites
- Python 3.8+ (backend)
- Node.js 16+ (frontend)
- Git
- Virtual environment activated

### Step 1: Start the Backend

```powershell
# Navigate to backend directory
cd backend

# Activate virtual environment (if not already activated)
.\.venv\Scripts\Activate.ps1

# Install dependencies (if needed)
pip install -r requirements.txt

# Start the backend server
python main.py
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

The backend will be available at: **http://localhost:8000**

---

### Step 2: Start the Frontend

**In a new terminal:**

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (if needed)
npm install

# Start the development server
npm run dev
```

**Expected output:**
```
> next dev
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
```

The frontend will be available at: **http://localhost:3000**

---

## Testing the Phone Numbers Feature

### Test 1: Basic Phone Number Extraction

1. **Open** http://localhost:3000 in your browser
2. **Select** "Phone Numbers" from the data type options
3. **Enter a test URL** with phone numbers:
   - `https://www.example.com` (has contact info)
   - `https://www.google.com/about/` (has phone numbers)
   - Any business website with contact page
4. **Leave "Resolve Owner" OFF** for now
5. **Click "Extract Data"**
6. **Wait for results** (should show phone numbers found)

**Expected Results:**
- Table shows extracted phone numbers
- Columns: Phone, Owner, Type, Confidence, Context, Details
- Owner shows "Unknown" (since resolve_owner is OFF)
- Confidence shows 50% (default for extracted-only)

---

### Test 2: Phone Number Extraction with Owner Resolution

1. **Select** "Phone Numbers" again
2. **Toggle "Resolve Owner" ON** (cyan gradient switch appears)
3. **Enter a test URL** with business contact info
4. **Click "Extract Data"**

**Expected Results:**
- Phone numbers extracted
- Owner names detected from context
- Owner Type shows "Person" or "Business"
- Confidence scores higher (60-80%)
- Data Source shows "enriched_lookup"

---

### Test 3: Search and Filter

1. **After extraction**, use the search box to:
   - Search by phone number: `555-1234`
   - Search by owner name: `John` or `Company`

2. **Use the filter dropdown** to show:
   - All Types
   - Person only
   - Business only
   - Unknown only

3. **Click the "Confidence" header** to sort by confidence score

---

### Test 4: Expandable Details

1. **Click the chevron (▼)** on any row to expand
2. **View detailed information:**
   - Source CSS selector
   - Data source indicator
   - Carrier (if available)
   - Line type (if available)
   - Website link (if available)

---

### Test 5: Export Functionality

1. **Select individual rows** using checkboxes
2. **Click "CSV" button** to download CSV file
3. **Click "JSON" button** to download JSON file
4. **Verify exported data** contains all columns

**Or export all results:**
- Don't select any rows
- Click CSV/JSON to export everything

---

## API Testing (Advanced)

### Test via cURL or Postman

**Basic Phone Number Extraction:**

```bash
curl -X POST http://localhost:8000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.example.com",
    "data_type": "phone_numbers",
    "ai_mode": false,
    "check_robots": true,
    "resolve_owner": false
  }'
```

**With Owner Resolution:**

```bash
curl -X POST http://localhost:8000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.example.com",
    "data_type": "phone_numbers",
    "ai_mode": false,
    "check_robots": true,
    "resolve_owner": true
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data_type": "phone_numbers",
  "count": 3,
  "data": [
    {
      "phone": "+1-555-123-4567",
      "normalized": "+15551234567",
      "owner": "Example Company",
      "owner_type": "Business",
      "confidence": 75,
      "source": ".contact-phone",
      "context_snippet": "Call us at +1-555-123-4567 today",
      "data_source": "enriched_lookup"
    }
  ],
  "processing_time_seconds": 2.5,
  "url": "https://www.example.com"
}
```

---

## Troubleshooting

### Issue: Backend won't start

**Solution:**
```powershell
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Try running with explicit port
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Issue: Frontend won't start

**Solution:**
```powershell
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Issue: CORS errors

**Solution:**
- Ensure backend is running on http://localhost:8000
- Check `.env` file has correct API URL
- Verify CORS middleware in `backend/main.py`

### Issue: Phone numbers not found

**Try these test URLs:**
- https://www.google.com/about/
- https://www.amazon.com/gp/help/customer/display.html
- https://www.github.com/contact
- Any business website with a "Contact Us" page

---

## Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:3000
- [ ] Phone Numbers option appears in data type list
- [ ] Resolve Owner toggle shows when Phone Numbers selected
- [ ] Basic extraction works (resolve_owner OFF)
- [ ] Owner resolution works (resolve_owner ON)
- [ ] Search filters results correctly
- [ ] Owner type filter works
- [ ] Confidence sorting works
- [ ] Row selection works
- [ ] CSV export downloads correctly
- [ ] JSON export downloads correctly
- [ ] Expandable details show all information
- [ ] Dark theme styling looks correct
- [ ] Cyan/blue accents visible
- [ ] No console errors in browser DevTools

---

## Performance Notes

- **First extraction:** 2-5 seconds (includes page load)
- **Subsequent extractions:** 1-3 seconds
- **Large pages:** May take up to 10 seconds
- **Phone number regex:** Optimized for US and international formats

---

## Next Steps

After successful local testing:

1. **Test on staging** (if available)
2. **Deploy to production** via Vercel/Render
3. **Monitor API logs** for errors
4. **Gather user feedback**
5. **Iterate on owner resolution accuracy**

---

## Support

For issues or questions:
- Check browser console (F12) for errors
- Check backend logs for API errors
- Review `TROUBLESHOOTING.md` for common issues
- Check git commit `d963dad` for implementation details

