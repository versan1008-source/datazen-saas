# 🔧 DataZen - Troubleshooting Guide

## ❌ Website Shows 404 Error

### Why This Happens

When you visit `https://www.versan.in`, you see a 404 error because:

1. **DNS Propagation**: The domain nameservers were just changed to Vercel's nameservers
2. **Propagation Time**: DNS changes can take 24-48 hours to propagate globally
3. **Caching**: Your ISP or browser might be caching old DNS records

### ✅ Solutions

#### Option 1: Wait for DNS Propagation (Recommended)
- DNS typically propagates within 1-24 hours
- Check status at: https://www.whatsmydns.net/?domain=versan.in
- Once all nameservers show Vercel's DNS, the site will be live

#### Option 2: Access via Vercel URL (Immediate)
Use the Vercel URL directly:
```
https://datazen-saas-42hvu5tey-pranaos-projects.vercel.app
```

#### Option 3: Clear DNS Cache
**Windows:**
```bash
ipconfig /flushdns
```

**macOS:**
```bash
sudo dscacheutil -flushcache
```

**Linux:**
```bash
sudo systemctl restart systemd-resolved
```

#### Option 4: Use Different DNS
Try using Google DNS (8.8.8.8) or Cloudflare DNS (1.1.1.1) in your network settings.

---

## 🔌 Browser Extension Not Working

### Issue: Extension doesn't load

**Solution:**
1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension` folder
5. Refresh the page

### Issue: Scraping returns no data

**Solution:**
1. Check browser console for errors (F12)
2. Verify the website allows scraping (check robots.txt)
3. Try a different website
4. Check if JavaScript is enabled

### Issue: "Failed to connect to API"

**Solution:**
1. Update API URL in `extension/popup.js`:
   ```javascript
   const API_URL = 'https://your-backend-url.com';
   ```
2. Ensure backend is deployed and running
3. Check CORS settings in backend

---

## 🚀 Backend Deployment Issues

### Issue: Railway deployment fails

**Solution:**
1. Check Railway logs: `railway logs`
2. Verify Dockerfile is correct
3. Ensure all dependencies are in `requirements.txt`
4. Check environment variables are set

### Issue: Backend returns 500 error

**Solution:**
1. Check backend logs
2. Verify database connection
3. Check environment variables
4. Ensure all required packages are installed

### Issue: API endpoints return 404

**Solution:**
1. Verify backend is running
2. Check endpoint paths in `routes/` folder
3. Ensure CORS is configured correctly
4. Test with: `curl https://your-backend-url/health`

---

## 🌐 Frontend Issues

### Issue: Page doesn't load

**Solution:**
1. Check browser console (F12)
2. Verify Vercel deployment succeeded
3. Clear browser cache
4. Try incognito mode

### Issue: API calls fail

**Solution:**
1. Check `NEXT_PUBLIC_API_URL` environment variable
2. Verify backend is running
3. Check CORS settings
4. Test API directly: `curl https://api-url/health`

### Issue: Styling looks broken

**Solution:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check Tailwind CSS build
4. Verify all CSS files are loaded

---

## 💾 Database Issues

### Issue: Database file not found

**Solution:**
```bash
cd backend
python -c "from config.database import init_db; init_db()"
```

### Issue: Tables don't exist

**Solution:**
```bash
cd backend
python -c "
from config.database import init_db, SessionLocal, Base, engine
from models.user import User
from models.plan import Plan
from models.subscription import Subscription
from models.usage_log import UsageLog

Base.metadata.create_all(bind=engine)
print('Tables created successfully')
"
```

### Issue: Subscription plans missing

**Solution:**
```bash
cd backend
python -c "
from config.database import SessionLocal
from models.plan import Plan

db = SessionLocal()
plans = [
    Plan(name='Starter', price=4.99, pages_per_month=2000),
    Plan(name='Pro', price=14.99, pages_per_month=25000),
    Plan(name='Business', price=39.99, pages_per_month=100000)
]

for plan in plans:
    db.add(plan)

db.commit()
print('Plans created successfully')
db.close()
"
```

---

## 🔐 Authentication Issues

### Issue: Login fails

**Solution:**
1. Verify user exists in database
2. Check password is correct
3. Verify JWT_SECRET is set
4. Check token expiration

### Issue: JWT token invalid

**Solution:**
1. Ensure JWT_SECRET is consistent
2. Check token hasn't expired
3. Verify token format in headers
4. Regenerate token

---

## 💳 Payment Issues

### Issue: Razorpay integration not working

**Solution:**
1. Verify Razorpay credentials are set
2. Check webhook URL is correct
3. Test payment flow in sandbox mode
4. Check Razorpay logs

### Issue: Payment verification fails

**Solution:**
1. Verify payment ID is correct
2. Check signature verification
3. Ensure webhook secret is correct
4. Check database for payment record

---

## 📊 Performance Issues

### Issue: Website is slow

**Solution:**
1. Check Vercel analytics
2. Optimize images
3. Enable caching
4. Check API response times
5. Use CDN for static assets

### Issue: API is slow

**Solution:**
1. Check database queries
2. Add indexes to frequently queried columns
3. Implement caching
4. Check server resources
5. Monitor Railway dashboard

---

## 🆘 Getting Help

### Check These First
1. Browser console (F12)
2. Network tab (F12 → Network)
3. Backend logs
4. Vercel logs
5. Railway logs

### Useful Commands

**Check backend health:**
```bash
curl https://your-backend-url/health
```

**Check frontend build:**
```bash
cd frontend && npm run build
```

**Test API endpoint:**
```bash
curl -X POST https://your-backend-url/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Check DNS:**
```bash
nslookup versan.in
```

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Chrome Extension Docs**: https://developer.chrome.com/docs/extensions/

---

**Last Updated**: October 16, 2025

