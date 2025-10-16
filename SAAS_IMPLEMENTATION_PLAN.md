# SaaS Transformation Plan - DataZen Scraper

## Overview
Transform the existing web scraper into a subscription-based SaaS platform with Razorpay USD payments, 3 subscription tiers, browser extension, and PowerShell CLI.

## Architecture Components

### 1. Database Layer
- **Users Table**: user_id, email, password_hash, subscription_id, plan_id, quota_used, quota_reset_date, api_key, created_at
- **Plans Table**: plan_id, plan_name, price_usd, monthly_quota, features (JSON), created_at
- **Subscriptions Table**: subscription_id, user_id, razorpay_subscription_id, status, current_period_start, current_period_end, next_billing_date, created_at
- **Usage Logs Table**: log_id, user_id, pages_scraped, timestamp, url, data_type
- **Webhooks Table**: webhook_id, razorpay_event_id, event_type, payload, processed, created_at

### 2. Subscription Tiers (USD)

| Plan | Price | Monthly Quota | Features |
|------|-------|---------------|----------|
| Starter | $4.99 | 2,000 pages | Manual scraping, Browser extension |
| Pro | $14.99 | 25,000 pages | Scheduling (10 jobs), Full API, Webhooks, CSV/JSON export |
| Business | $39.99 | 100,000 pages | Unlimited jobs, Team seats (3), Captcha solver, Priority queue |

### 3. Backend Services

#### Authentication & Authorization
- JWT token-based auth
- API key management
- Plan-based access control middleware
- Usage quota enforcement

#### Razorpay Integration
- Subscription creation (USD currency)
- Webhook listener for events
- Subscription renewal/cancellation handling
- Payment failure retry logic

#### Usage Tracking
- Real-time quota tracking
- Monthly reset logic
- Grace period for failed renewals (3 days)
- Upgrade/downgrade prorating

#### Job Scheduling
- Background job queue (Celery/APScheduler)
- Priority queue per plan
- Concurrent job limits per plan

### 4. Frontend Components

#### Dashboard
- Pricing page with plan comparison
- Subscription management
- Usage analytics
- API key management
- Billing history

#### Payment Flow
- Plan selection
- Razorpay checkout
- Success/failure handling
- Subscription status display

### 5. Browser Extension
- Token-based authentication
- Plan/quota checking before scrape
- Feature availability based on plan
- Upgrade prompts when limits approach
- Results display and export

### 6. PowerShell CLI
- User registration/login
- API key management
- Scrape command with quota checking
- Results fetching and export
- Upgrade suggestions

## Implementation Phases

### Phase 1: Database & Models (Week 1)
- [ ] Create database schema
- [ ] Create SQLAlchemy models
- [ ] Create Pydantic schemas
- [ ] Database migrations

### Phase 2: Authentication (Week 1)
- [ ] User registration/login endpoints
- [ ] JWT token generation
- [ ] API key management
- [ ] Auth middleware

### Phase 3: Razorpay Integration (Week 2)
- [ ] Razorpay SDK setup
- [ ] Subscription creation endpoint
- [ ] Webhook listener
- [ ] Subscription management

### Phase 4: Access Control (Week 2)
- [ ] Usage tracking middleware
- [ ] Quota enforcement
- [ ] Feature flags per plan
- [ ] Graceful degradation

### Phase 5: Dashboard Frontend (Week 3)
- [ ] Pricing page
- [ ] Subscription management UI
- [ ] Usage analytics
- [ ] Billing history

### Phase 6: Browser Extension (Week 3-4)
- [ ] Extension manifest
- [ ] Authentication flow
- [ ] Scrape integration
- [ ] Results display

### Phase 7: PowerShell CLI (Week 4)
- [ ] CLI commands
- [ ] Authentication
- [ ] Scrape execution
- [ ] Results export

### Phase 8: Testing & Deployment (Week 4-5)
- [ ] Integration tests
- [ ] Load testing
- [ ] Security audit
- [ ] Production deployment

## Key Files to Create

### Backend
- `models/user.py` - User model
- `models/subscription.py` - Subscription model
- `models/plan.py` - Plan model
- `models/usage_log.py` - Usage tracking
- `services/auth.py` - Authentication service
- `services/razorpay_service.py` - Razorpay integration
- `services/subscription_service.py` - Subscription management
- `services/usage_service.py` - Usage tracking
- `routes/auth.py` - Auth endpoints
- `routes/subscription.py` - Subscription endpoints
- `routes/billing.py` - Billing endpoints
- `middleware/auth.py` - Auth middleware
- `middleware/quota.py` - Quota enforcement
- `config/database.py` - Database configuration
- `config/razorpay.py` - Razorpay configuration

### Frontend
- `pages/pricing.tsx` - Pricing page
- `pages/dashboard.tsx` - Dashboard
- `pages/billing.tsx` - Billing page
- `components/PricingCard.tsx` - Pricing card
- `components/SubscriptionForm.tsx` - Subscription form
- `lib/razorpay.ts` - Razorpay integration

### Browser Extension
- `manifest.json` - Extension manifest
- `popup.html/tsx` - Popup UI
- `background.ts` - Background script
- `content.ts` - Content script
- `auth.ts` - Authentication

### PowerShell CLI
- `DataZenCLI.ps1` - Main CLI script
- `auth.ps1` - Authentication functions
- `scrape.ps1` - Scraping functions
- `config.ps1` - Configuration

## Security Considerations

- [ ] HTTPS only in production
- [ ] Rate limiting on auth endpoints
- [ ] API key rotation
- [ ] Webhook signature verification
- [ ] PCI compliance for payment handling
- [ ] GDPR compliance for user data
- [ ] Encryption for sensitive data
- [ ] SQL injection prevention
- [ ] CSRF protection

## Monitoring & Analytics

- [ ] Usage analytics dashboard
- [ ] Payment success/failure tracking
- [ ] API performance monitoring
- [ ] Error tracking and alerting
- [ ] User activity logging

## Success Metrics

- [ ] 100+ active users in first month
- [ ] 95%+ payment success rate
- [ ] <100ms API response time
- [ ] 99.9% uptime
- [ ] <1% churn rate

---

**Status**: Planning Phase
**Last Updated**: 2025-10-16
**Next Step**: Start Phase 1 - Database & Models

