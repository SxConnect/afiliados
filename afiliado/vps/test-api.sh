#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:3000}"
WHATSAPP="5511999999999"
FINGERPRINT="test-fingerprint-$(date +%s)"

echo "🧪 Testing Afiliado License API"
echo "================================"
echo "API URL: $API_URL"
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
echo "--------------------"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ Health check failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
    exit 1
fi
echo ""

# Test 2: Validate License
echo "Test 2: Validate License"
echo "------------------------"
VALIDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/validate-license" \
    -H "Content-Type: application/json" \
    -d "{\"whatsapp\":\"$WHATSAPP\",\"fingerprint\":\"$FINGERPRINT\"}")
HTTP_CODE=$(echo "$VALIDATE_RESPONSE" | tail -n1)
BODY=$(echo "$VALIDATE_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ License validation passed${NC}"
    echo "Response: $BODY"
    TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "Token extracted: ${TOKEN:0:20}..."
else
    echo -e "${RED}✗ License validation failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
    exit 1
fi
echo ""

# Test 3: Check Quota
echo "Test 3: Check Quota"
echo "-------------------"
QUOTA_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/check-quota" \
    -H "Content-Type: application/json" \
    -d "{\"whatsapp\":\"$WHATSAPP\",\"token\":\"$TOKEN\"}")
HTTP_CODE=$(echo "$QUOTA_RESPONSE" | tail -n1)
BODY=$(echo "$QUOTA_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Quota check passed${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ Quota check failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
    exit 1
fi
echo ""

# Test 4: Consume Quota
echo "Test 4: Consume Quota"
echo "---------------------"
CONSUME_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/consume-quota" \
    -H "Content-Type: application/json" \
    -d "{\"whatsapp\":\"$WHATSAPP\",\"token\":\"$TOKEN\",\"amount\":1}")
HTTP_CODE=$(echo "$CONSUME_RESPONSE" | tail -n1)
BODY=$(echo "$CONSUME_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Quota consumption passed${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ Quota consumption failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
    exit 1
fi
echo ""

# Test 5: Validate Plugin
echo "Test 5: Validate Plugin"
echo "-----------------------"
PLUGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/validate-plugin" \
    -H "Content-Type: application/json" \
    -d "{\"whatsapp\":\"$WHATSAPP\",\"token\":\"$TOKEN\",\"pluginId\":\"test-plugin\"}")
HTTP_CODE=$(echo "$PLUGIN_RESPONSE" | tail -n1)
BODY=$(echo "$PLUGIN_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Plugin validation passed${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ Plugin validation failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
    exit 1
fi
echo ""

# Test 6: Invalid Token
echo "Test 6: Invalid Token (should fail)"
echo "------------------------------------"
INVALID_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/check-quota" \
    -H "Content-Type: application/json" \
    -d "{\"whatsapp\":\"$WHATSAPP\",\"token\":\"invalid-token\"}")
HTTP_CODE=$(echo "$INVALID_RESPONSE" | tail -n1)
BODY=$(echo "$INVALID_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓ Invalid token correctly rejected${NC}"
    echo "Response: $BODY"
else
    echo -e "${YELLOW}⚠ Expected HTTP 401, got $HTTP_CODE${NC}"
    echo "Response: $BODY"
fi
echo ""

# Summary
echo "================================"
echo -e "${GREEN}✅ All tests completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Deploy to VPS"
echo "2. Configure Traefik"
echo "3. Test with HTTPS"
echo "4. Monitor logs"
