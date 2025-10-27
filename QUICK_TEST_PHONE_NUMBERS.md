# 🚀 Quick Test - Phone Numbers Feature (5 Minutes)

## Option 1: Using PowerShell Script (Easiest)

### Step 1: Run the startup script
```powershell
# From the project root directory
.\START_LOCAL_DEV.ps1
```

This will:
- ✅ Start backend on http://localhost:8000
- ✅ Start frontend on http://localhost:3000
- ✅ Open both in new windows

**Wait for both to show "ready" messages**

---

## Option 2: Manual Setup (More Control)

### Terminal 1: Start Backend

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python main.py
```

**Wait for:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Terminal 2: Start Frontend

```powershell
cd frontend
npm run dev
```

**Wait for:**
```
▲ Next.js ready - started server on 0.0.0.0:3000
```

---

## Step 3: Test in Browser

1. **Open** http://localhost:3000
2. **Scroll down** to the form on the right
3. **Select "Phone Numbers"** from data type options
4. **See the "Resolve Owner" toggle** appear below
5. **Enter a test URL:**
   ```
   https://www.google.com/about/
   ```
6. **Toggle "Resolve Owner" ON** (optional)
7. **Click "Extract Data"**
8. **Wait for results** (2-5 seconds)

---

## Expected Results

### Without Resolve Owner (OFF):
```
Phone: +1-650-253-0000
Owner: Unknown
Type: Unknown
Confidence: 50%
Context: "Call us at +1-650-253-0000"
```

### With Resolve Owner (ON):
```
Phone: +1-650-253-0000
Owner: Google
Type: Business
Confidence: 75%
Context: "Call us at +1-650-253-0000"
```

---

## Test URLs with Phone Numbers

Try these websites:

| Website | Phone Numbers | Type |
|---------|---------------|------|
| https://www.google.com/about/ | Yes | Business |
| https://www.amazon.com/gp/help/customer/display.html | Yes | Business |
| https://www.github.com/contact | Yes | Business |
| https://www.apple.com/contact/ | Yes | Business |
| https://www.microsoft.com/en-us/contact | Yes | Business |

---

## What to Test

### ✅ Basic Functionality
- [ ] Phone numbers are extracted
- [ ] Owner names appear (if resolve_owner ON)
- [ ] Confidence scores show
- [ ] Context snippets display

### ✅ UI Features
- [ ] Search box filters results
- [ ] Owner Type filter works
- [ ] Confidence sorting works
- [ ] Rows can be selected
- [ ] Details expand when clicked

### ✅ Export
- [ ] CSV download works
- [ ] JSON download works
- [ ] Selected rows export correctly

### ✅ Styling
- [ ] Dark theme looks good
- [ ] Cyan/blue accents visible
- [ ] Rounded corners (12-16px)
- [ ] Hover effects work
- [ ] No layout issues

---

## Troubleshooting

### Backend won't start?
```powershell
# Check Python version
python --version

# Reinstall dependencies
pip install -r backend/requirements.txt --force-reinstall

# Try explicit port
python -m uvicorn backend.main:app --port 8000
```

### Frontend won't start?
```powershell
# Clear and reinstall
cd frontend
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Can't connect to backend?
- Check backend is running on http://localhost:8000
- Check browser console (F12) for CORS errors
- Verify `.env` file has `NEXT_PUBLIC_API_URL=http://localhost:8000`

### No phone numbers found?
- Try a different website
- Check browser console for errors
- Verify the website has phone numbers in HTML

---

## Browser DevTools Tips

### Check for Errors
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Look for red error messages
4. Check **Network** tab for failed API calls

### Monitor API Calls
1. Open **Network** tab
2. Click "Extract Data"
3. Look for `/api/scrape` request
4. Check response status (should be 200)
5. View response data

---

## Performance Expectations

| Action | Time |
|--------|------|
| First extraction | 2-5 seconds |
| Subsequent extractions | 1-3 seconds |
| Large pages | Up to 10 seconds |
| Export (CSV/JSON) | <1 second |

---

## Next Steps

After successful testing:

1. **Try different websites** to test accuracy
2. **Test with resolve_owner ON/OFF** to see differences
3. **Export results** and verify data
4. **Check styling** on different screen sizes
5. **Review console logs** for any warnings

---

## Need Help?

- 📖 Full guide: `PHONE_NUMBERS_TESTING_GUIDE.md`
- 🐛 Issues: Check `TROUBLESHOOTING.md`
- 💻 API docs: http://localhost:8000/docs
- 📝 Code: Check commit `d963dad`

---

## Success Checklist

- [ ] Backend running on :8000
- [ ] Frontend running on :3000
- [ ] Phone Numbers option visible
- [ ] Resolve Owner toggle works
- [ ] Phone numbers extracted
- [ ] Results display correctly
- [ ] Export works
- [ ] No console errors

**If all checked ✅ - Feature is working!** 🎉

