# DataZen SaaS Implementation Guide

## Quick Start

### 1. Environment Setup

Create `.env` file in backend directory:

```env
# Database
DATABASE_URL=sqlite:///./datazen_saas.db
# For production: postgresql://user:password@localhost/datazen

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# Razorpay (Get from https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Webhook
WEBHOOK_ENDPOINT=https://yourdomain.com/api/webhooks/razorpay
```

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Initialize Database

```bash
python -c "from config.database import init_db; init_db()"
```

### 4. Create Default Plans

```python
from config.database import SessionLocal
from models.plan import Plan
from config.razorpay import PRICING

db = SessionLocal()

for plan_key, plan_data in PRICING.items():
    plan = Plan(
        name=plan_data["name"],
        description=f"{plan_data['name']} Plan",
        price_usd=plan_data["price_usd"],
        monthly_quota=plan_data["monthly_quota"],
        max_concurrent_jobs=plan_data["max_concurrent_jobs"],
        max_team_seats=plan_data["max_team_seats"],
        features=plan_data["features"]
    )
    db.add(plan)

db.commit()
print("Plans created successfully!")
```

### 5. Update main.py

Add these imports and routes to `backend/main.py`:

```python
from routes.auth import router as auth_router
from routes.subscription import router as subscription_router
from routes.billing import router as billing_router
from routes.webhooks import router as webhooks_router
from config.database import init_db

# Initialize database
init_db()

# Include new routers
app.include_router(auth_router, prefix="/api")
app.include_router(subscription_router, prefix="/api")
app.include_router(billing_router, prefix="/api")
app.include_router(webhooks_router, prefix="/api")
```

### 6. Update Scrape Routes

Modify `backend/routes/scrape.py` to add quota checking:

```python
from middleware.auth_middleware import get_current_user
from middleware.quota_middleware import check_quota
from services.usage_service import UsageService
from models.user import User

@router.post("/scrape")
async def scrape_website(
    request: ScrapeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks
):
    # Check quota
    await check_quota(current_user, db, pages_to_scrape=1)
    
    # ... existing scraping logic ...
    
    # Log usage
    UsageService.log_usage(
        db=db,
        user_id=current_user.id,
        url=request.url,
        data_type=request.data_type,
        pages_scraped=1,
        source="api",
        success=result.get('success', False),
        processing_time_seconds=int(processing_time)
    )
    
    return ScrapeResponse(**result)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/regenerate-api-key` - Regenerate API key
- `POST /api/auth/logout` - Logout

### Subscriptions
- `GET /api/subscriptions/plans` - Get all plans
- `POST /api/subscriptions/create` - Create subscription
- `GET /api/subscriptions/current` - Get current subscription
- `POST /api/subscriptions/cancel` - Cancel subscription

### Billing & Usage
- `GET /api/billing/usage/stats` - Get usage statistics
- `GET /api/billing/usage/logs` - Get usage logs
- `GET /api/billing/quota-status` - Get quota status
- `POST /api/billing/check-quota` - Check quota availability
- `GET /api/billing/billing-history` - Get billing history

### Webhooks
- `POST /api/webhooks/razorpay` - Razorpay webhook handler

## Razorpay Setup

### 1. Create Account
- Go to https://razorpay.com
- Sign up and verify your account
- Enable international payments in settings

### 2. Create Plans
In Razorpay Dashboard:
1. Go to Subscriptions → Plans
2. Create 3 plans:
   - Starter: $4.99/month
   - Pro: $14.99/month
   - Business: $39.99/month
3. Copy plan IDs to `.env`

### 3. Setup Webhooks
1. Go to Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events:
   - subscription.started
   - subscription.renewed
   - subscription.cancelled
   - payment.failed
4. Copy webhook secret to `.env`

## Testing

### 1. Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 3. Create Subscription
```bash
curl -X POST http://localhost:8000/api/subscriptions/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_key": "pro"
  }'
```

### 4. Check Quota
```bash
curl -X GET http://localhost:8000/api/billing/quota-status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps

1. **Browser Extension** - Create extension with token auth
2. **PowerShell CLI** - Build CLI for automation
3. **Dashboard Frontend** - Build React dashboard
4. **Email Notifications** - Setup email for subscription events
5. **Analytics** - Add usage analytics and reporting
6. **Team Management** - Add team seats and collaboration

---

**Status**: Phase 1-3 Complete
**Next**: Browser Extension & PowerShell CLI

