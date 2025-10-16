# DataZen SaaS - API Testing Guide

## 🚀 Quick Start

### 1. Start the Backend Server
```bash
cd backend
python main.py
```
Server will run on: `http://localhost:8000`

### 2. Access API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📋 API Endpoints

### Authentication Endpoints

#### 1. Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "plan_id": null,
    "quota_used": 0,
    "is_active": true,
    "created_at": "2025-10-16T09:33:14.857157"
  },
  "expires_at": "2025-10-17T09:33:14.861307"
}
```

#### 2. Login User
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### 3. Get Current User
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

#### 4. Regenerate API Key
```bash
curl -X POST http://localhost:8000/api/auth/regenerate-api-key \
  -H "Authorization: Bearer <TOKEN>"
```

### Subscription Endpoints

#### 1. Get All Plans
```bash
curl -X GET http://localhost:8000/api/subscriptions/plans
```

**Response**:
```json
[
  {
    "id": "plan-id",
    "name": "Starter",
    "price_usd": 4.99,
    "monthly_quota": 2000,
    "max_concurrent_jobs": 1,
    "max_team_seats": 1,
    "features": {
      "scheduling": false,
      "webhooks": false,
      "csv_export": false,
      "api_access": false
    }
  },
  ...
]
```

#### 2. Create Subscription
```bash
curl -X POST http://localhost:8000/api/subscriptions/create \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_key": "starter"
  }'
```

#### 3. Get Current Subscription
```bash
curl -X GET http://localhost:8000/api/subscriptions/current \
  -H "Authorization: Bearer <TOKEN>"
```

#### 4. Cancel Subscription
```bash
curl -X POST http://localhost:8000/api/subscriptions/cancel \
  -H "Authorization: Bearer <TOKEN>"
```

### Billing Endpoints

#### 1. Get Quota Status
```bash
curl -X GET http://localhost:8000/api/billing/quota-status \
  -H "Authorization: Bearer <TOKEN>"
```

**Response**:
```json
{
  "quota_used": 0,
  "quota_limit": 2000,
  "quota_remaining": 2000,
  "quota_percentage": 0,
  "status": "active"
}
```

#### 2. Get Usage Statistics
```bash
curl -X GET "http://localhost:8000/api/billing/usage/stats?days=30" \
  -H "Authorization: Bearer <TOKEN>"
```

#### 3. Get Usage Logs
```bash
curl -X GET "http://localhost:8000/api/billing/usage/logs?limit=100&offset=0" \
  -H "Authorization: Bearer <TOKEN>"
```

#### 4. Check Quota
```bash
curl -X POST http://localhost:8000/api/billing/check-quota \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "pages_to_scrape": 100
  }'
```

### Scraping Endpoints

#### 1. Scrape with Quota Checking
```bash
curl -X POST http://localhost:8000/api/scrape \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "data_type": "text"
  }'
```

## 🧪 Complete Testing Workflow

### Step 1: Register a New User
```bash
RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123",
    "full_name": "Test User"
  }')

TOKEN=$(echo $RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"
```

### Step 2: Get Available Plans
```bash
curl -s http://localhost:8000/api/subscriptions/plans | python -m json.tool
```

### Step 3: Check Quota Status
```bash
curl -s http://localhost:8000/api/billing/quota-status \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
```

### Step 4: Create Subscription
```bash
curl -s -X POST http://localhost:8000/api/subscriptions/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan_key": "starter"}' | python -m json.tool
```

### Step 5: Verify Subscription
```bash
curl -s http://localhost:8000/api/subscriptions/current \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
```

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```bash
Authorization: Bearer <JWT_TOKEN>
```

Tokens expire after 24 hours. Get a new token by logging in again.

## 📊 Error Responses

### 401 Unauthorized
```json
{
  "detail": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "detail": "User account is inactive"
}
```

### 429 Quota Exceeded
```json
{
  "detail": "Monthly quota exceeded",
  "quota_used": 2000,
  "quota_limit": 2000
}
```

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

## 💡 Tips

1. **Save Token**: Store the token in an environment variable for easier testing
   ```bash
   export TOKEN="your-token-here"
   ```

2. **Pretty Print JSON**: Use `python -m json.tool` to format responses
   ```bash
   curl -s http://localhost:8000/api/subscriptions/plans | python -m json.tool
   ```

3. **Test with Postman**: Import the API endpoints into Postman for GUI testing

4. **Check Logs**: Monitor `backend.log` for detailed error information

## 🚀 Next Steps

1. **Configure Razorpay**: Add credentials to `.env` file
2. **Test Payments**: Create subscription with payment
3. **Test Webhooks**: Verify webhook handling
4. **Deploy**: Move to production environment

---

**Last Updated**: 2025-10-16
**API Version**: 1.0.0

