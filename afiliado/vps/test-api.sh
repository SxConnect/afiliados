#!/bin/bash

# Script de teste da VPS License API
# Usage: ./test-api.sh [base-url]

BASE_URL="${1:-http://localhost:3000}"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "  VPS License API - Test Suite"
echo "========================================="
echo "Base URL: $BASE_URL"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - HTTP $HTTP_CODE"
    echo "$BODY" | jq '.'
else
    echo -e "${RED}✗ FAILED${NC} - HTTP $HTTP_CODE"
    echo "$BODY"
fi
echo ""

# Test 2: License Status
echo -e "${YELLOW}Test 2: License Status${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/license/status")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - HTTP $HTTP_CODE"
    echo "$BODY" | jq '.'
else
    echo -e "${RED}✗ FAILED${NC} - HTTP $HTTP_CODE"
    echo "$BODY"
fi
echo ""

# Test 3: Validate User
echo -e "${YELLOW}Test 3: Validate User${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/validate" \
    -H "Content-Type: application/json" \
    -d '{"phone":"5511999999999","fingerprint":"test-fingerprint-123"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - HTTP $HTTP_CODE"
    echo "$BODY" | jq '.'
    
    # Extract token and userId for next tests
    TOKEN=$(echo "$BODY" | jq -r '.token.token')
    USER_ID=$(echo "$BODY" | jq -r '.user.id')
else
    echo -e "${RED}✗ FAILED${NC} - HTTP $HTTP_CODE"
    echo "$BODY"
    exit 1
fi
echo ""

# Test 4: Check Quota
echo -e "${YELLOW}Test 4: Check Quota${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/v1/quota/$USER_ID" \
    -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - HTTP $HTTP_CODE"
    echo "$BODY" | jq '.'
else
    echo -e "${RED}✗ FAILED${NC} - HTTP $HTTP_CODE"
    echo "$BODY"
fi
echo ""

# Test 5: Increment Usage
echo -e "${YELLOW}Test 5: Increment Usage${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/usage/$USER_ID" \
    -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - HTTP $HTTP_CODE"
    echo "$BODY" | jq '.'
else
    echo -e "${RED}✗ FAILED${NC} - HTTP $HTTP_CODE"
    echo "$BODY"
fi
echo ""

# Test 6: Invalid Endpoint (404)
echo -e "${YELLOW}Test 6: Invalid Endpoint (404)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/invalid")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - HTTP $HTTP_CODE"
    echo "$BODY" | jq '.'
else
    echo -e "${RED}✗ FAILED${NC} - Expected 404, got $HTTP_CODE"
    echo "$BODY"
fi
echo ""

# Test 7: Invalid Token (401)
echo -e "${YELLOW}Test 7: Invalid Token (401)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/v1/quota/$USER_ID" \
    -H "Authorization: Bearer invalid-token")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - HTTP $HTTP_CODE"
    echo "$BODY" | jq '.'
else
    echo -e "${RED}✗ FAILED${NC} - Expected 401, got $HTTP_CODE"
    echo "$BODY"
fi
echo ""

echo "========================================="
echo "  Test Suite Complete"
echo "========================================="
