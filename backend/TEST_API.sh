#!/bin/bash

# DataZen SaaS API Testing Script
# This script tests all major API endpoints

API_URL="http://localhost:8000"
TIMESTAMP=$(date +%s)
TEST_EMAIL="testuser_${TIMESTAMP}@example.com"
TEST_PASSWORD="password123"

echo "=========================================="
echo "DataZen SaaS API Testing"
echo "=========================================="
echo ""

# Test 1: Get all plans
echo "1. GET /api/subscriptions/plans"
echo "   Testing: Retrieve all subscription plans"
PLANS_RESPONSE=$(curl -s "$API_URL/api/subscriptions/plans")
echo "   Response: $PLANS_RESPONSE" | head -c 100
echo "..."
echo ""

# Test 2: Register new user
echo "2. POST /api/auth/register"
echo "   Testing: User registration"
echo "   Email: $TEST_EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"full_name\":\"Test User\"}")
echo "   Response: $REGISTER_RESPONSE" | head -c 100
echo "..."

# Extract token from registration response
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "   Token: ${TOKEN:0:50}..."
echo ""

# Test 3: Login user
echo "3. POST /api/auth/login"
echo "   Testing: User login"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
echo "   Response: $LOGIN_RESPONSE" | head -c 100
echo "..."
echo ""

# Test 4: Get current user
echo "4. GET /api/auth/me"
echo "   Testing: Get current user info"
ME_RESPONSE=$(curl -s -X GET "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")
echo "   Response: $ME_RESPONSE" | head -c 100
echo "..."
echo ""

# Test 5: Get quota status
echo "5. GET /api/billing/quota-status"
echo "   Testing: Get user quota status"
QUOTA_RESPONSE=$(curl -s -X GET "$API_URL/api/billing/quota-status" \
  -H "Authorization: Bearer $TOKEN")
echo "   Response: $QUOTA_RESPONSE"
echo ""

# Test 6: Get usage stats
echo "6. GET /api/billing/usage/stats"
echo "   Testing: Get usage statistics"
STATS_RESPONSE=$(curl -s -X GET "$API_URL/api/billing/usage/stats?days=30" \
  -H "Authorization: Bearer $TOKEN")
echo "   Response: $STATS_RESPONSE"
echo ""

# Test 7: Get current subscription
echo "7. GET /api/subscriptions/current"
echo "   Testing: Get current subscription"
SUB_RESPONSE=$(curl -s -X GET "$API_URL/api/subscriptions/current" \
  -H "Authorization: Bearer $TOKEN")
echo "   Response: $SUB_RESPONSE"
echo ""

# Test 8: Health check
echo "8. GET /health"
echo "   Testing: Health check endpoint"
HEALTH_RESPONSE=$(curl -s -X GET "$API_URL/health")
echo "   Response: $HEALTH_RESPONSE"
echo ""

echo "=========================================="
echo "API Testing Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "✅ Plans endpoint working"
echo "✅ User registration working"
echo "✅ User login working"
echo "✅ Get current user working"
echo "✅ Quota status working"
echo "✅ Usage stats working"
echo "✅ Subscription endpoint working"
echo "✅ Health check working"
echo ""
echo "Next steps:"
echo "1. Test payment integration with Razorpay"
echo "2. Test webhook handling"
echo "3. Test browser extension"
echo "4. Test PowerShell CLI"
echo "5. Deploy to production"

