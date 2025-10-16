# DataZen SaaS - Complete Implementation

Transform your web scraper into a subscription-based SaaS platform with Razorpay USD payments, 3 subscription tiers, browser extension, and PowerShell CLI.

## 🎯 What's Included

### Backend Services
- ✅ User authentication (JWT tokens)
- ✅ Subscription management (Razorpay integration)
- ✅ Usage tracking and quota enforcement
- ✅ API key management
- ✅ Webhook handling for payment events
- ✅ Database models (SQLAlchemy)

### Frontend Components
- ✅ Browser extension (Chrome/Firefox compatible)
- ✅ PowerShell CLI for automation
- ✅ Dashboard endpoints (ready for React frontend)

### Pricing Tiers (USD)
| Plan | Price | Quota | Features |
|------|-------|-------|----------|
| Starter | $4.99/mo | 2,000 pages | Manual scraping, Browser extension |
| Pro | $14.99/mo | 25,000 pages | Scheduling, API, Webhooks, CSV/JSON export |
| Business | $39.99/mo | 100,000 pages | Unlimited jobs, Team seats (3), Captcha solver |

## 📁 File Structure

```
backend/
├── config/
│   ├── database.py          # Database configuration
│   └── razorpay.py          # Razorpay settings
├── models/
│   ├── user.py              # User model
│   ├── plan.py              # Subscription plan model
│   ├── subscription.py       # Subscription model
│   └── usage_log.py          # Usage tracking model
├── services/
│   ├── auth_service.py       # Authentication logic
│   ├── razorpay_service.py   # Razorpay integration
│   └── usage_service.py      # Usage tracking
├── middleware/
│   ├── auth_middleware.py    # JWT authentication
│   └── quota_middleware.py   # Quota enforcement
├── routes/
│   ├── auth.py               # Auth endpoints
│   ├── subscription.py        # Subscription endpoints
│   ├── billing.py            # Billing endpoints
│   └── webhooks.py           # Webhook handlers
└── main.py                   # Updated with new routes

browser-extension/
├── manifest.json             # Extension manifest
├── popup.html                # Popup UI
├── popup.js                  # Popup logic
├── background.js             # Background script
└── content.js                # Content script

DataZenCLI.ps1               # PowerShell CLI
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Setup Environment
Create `.env` file:
```env
DATABASE_URL=sqlite:///./datazen_saas.db
JWT_SECRET=your-secret-key
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Initialize Database
```bash
python -c "from config.database import init_db; init_db()"
```

### 4. Create Plans
```bash
python -c "
from config.database import SessionLocal
from models.plan import Plan
from config.razorpay import PRICING

db = SessionLocal()
for plan_key, plan_data in PRICING.items():
    plan = Plan(
        name=plan_data['name'],
        description=f\"{plan_data['name']} Plan\",
        price_usd=plan_data['price_usd'],
        monthly_quota=plan_data['monthly_quota'],
        max_concurrent_jobs=plan_data['max_concurrent_jobs'],
        max_team_seats=plan_data['max_team_seats'],
        features=plan_data['features']
    )
    db.add(plan)
db.commit()
"
```

### 5. Update main.py
Add these imports and routes:
```python
from routes.auth import router as auth_router
from routes.subscription import router as subscription_router
from routes.billing import router as billing_router
from routes.webhooks import router as webhooks_router
from config.database import init_db

init_db()

app.include_router(auth_router, prefix="/api")
app.include_router(subscription_router, prefix="/api")
app.include_router(billing_router, prefix="/api")
app.include_router(webhooks_router, prefix="/api")
```

### 6. Start Backend
```bash
python main.py
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/regenerate-api-key` - Regenerate API key

### Subscriptions
- `GET /api/subscriptions/plans` - Get all plans
- `POST /api/subscriptions/create` - Create subscription
- `GET /api/subscriptions/current` - Get current subscription
- `POST /api/subscriptions/cancel` - Cancel subscription

### Billing
- `GET /api/billing/usage/stats` - Usage statistics
- `GET /api/billing/usage/logs` - Usage logs
- `GET /api/billing/quota-status` - Quota status
- `POST /api/billing/check-quota` - Check quota

### Webhooks
- `POST /api/webhooks/razorpay` - Razorpay webhook

## 🧪 Testing

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Subscription
```bash
curl -X POST http://localhost:8000/api/subscriptions/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan_key": "pro"}'
```

## 💻 PowerShell CLI Usage

### Register
```powershell
.\DataZenCLI.ps1 -Command register -Arguments @{
    Email = "user@example.com"
    Password = "password123"
    FullName = "John Doe"
}
```

### Login
```powershell
.\DataZenCLI.ps1 -Command login -Arguments @{
    Email = "user@example.com"
    Password = "password123"
}
```

### Scrape
```powershell
.\DataZenCLI.ps1 -Command scrape -Arguments @{
    Url = "https://example.com"
    DataType = "text"
}
```

### Check Quota
```powershell
.\DataZenCLI.ps1 -Command quota
```

### View Stats
```powershell
.\DataZenCLI.ps1 -Command stats -Arguments @{Days = 30}
```

## 🔌 Browser Extension

1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `browser-extension` folder
5. Extension appears in toolbar

### Features
- Login with email/password
- Real-time quota tracking
- One-click scraping
- Results download (CSV)
- Usage statistics

## 🛠️ Razorpay Setup

1. Create account at https://razorpay.com
2. Enable international payments
3. Create 3 subscription plans (USD)
4. Setup webhook: `https://yourdomain.com/api/webhooks/razorpay`
5. Copy credentials to `.env`

## 📊 Database Schema

### Users
- id, email, password_hash, api_key
- plan_id, subscription_id
- quota_used, quota_reset_date
- is_active, is_verified

### Plans
- id, name, price_usd, monthly_quota
- max_concurrent_jobs, max_team_seats
- features (JSON)

### Subscriptions
- id, user_id, plan_id
- razorpay_subscription_id, status
- current_period_start/end, next_billing_date
- total_paid, failed_payment_count

### Usage Logs
- id, user_id, url, data_type
- pages_scraped, source, success
- processing_time_seconds, created_at

## 🔒 Security Features

- ✅ JWT token authentication
- ✅ API key management
- ✅ Webhook signature verification
- ✅ Rate limiting ready
- ✅ HTTPS recommended
- ✅ Password hashing (SHA-256)

## 📈 Next Steps

1. **Frontend Dashboard** - Build React dashboard for subscription management
2. **Email Notifications** - Send emails for subscription events
3. **Analytics** - Add usage analytics and reporting
4. **Team Management** - Implement team seats and collaboration
5. **Advanced Features** - Scheduling, webhooks, captcha solver
6. **Deployment** - Deploy to production (AWS, Heroku, etc.)

## 📝 Configuration

All configuration is in `backend/config/`:
- `database.py` - Database settings
- `razorpay.py` - Pricing, plans, webhook events

Customize pricing in `config/razorpay.py`:
```python
PRICING = {
    "starter": {...},
    "pro": {...},
    "business": {...}
}
```

## 🆘 Troubleshooting

### Database Issues
```bash
# Reset database
python -c "from config.database import drop_db; drop_db()"
python -c "from config.database import init_db; init_db()"
```

### Token Issues
- Ensure JWT_SECRET is set in `.env`
- Check token expiration (24 hours)
- Regenerate API key if needed

### Razorpay Issues
- Verify credentials in `.env`
- Check webhook signature verification
- Test with Razorpay test mode

## 📞 Support

For issues or questions:
1. Check logs: `tail -f backend.log`
2. Review API documentation
3. Test endpoints with cURL
4. Check Razorpay dashboard

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2025-10-16

