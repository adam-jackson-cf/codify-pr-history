#!/bin/bash
# Validate mock data structure and content

set -e

echo "=== Validating Mock Data Structure ==="
echo ""

MOCK_DATA_DIR="../../tests/integration/mock-data"
PR_COMMENTS="$MOCK_DATA_DIR/pr-comments.json"
RED_FLAGS="$MOCK_DATA_DIR/red-flags.json"
REPO_INSTRUCTIONS="$MOCK_DATA_DIR/existing-instructions/copilot-instructions.md"
BACKEND_INSTRUCTIONS="$MOCK_DATA_DIR/existing-instructions/backend.instructions.md"
FRONTEND_INSTRUCTIONS="$MOCK_DATA_DIR/existing-instructions/frontend.instructions.md"

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

PASSED=0
FAILED=0

# Test 1: PR comments file exists and is valid JSON
echo "Test 1: pr-comments.json exists and is valid JSON..."
if [ -f "$PR_COMMENTS" ] && jq empty "$PR_COMMENTS" 2>/dev/null; then
    echo -e "${GREEN}✓ PASS${NC}: pr-comments.json is valid JSON"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: pr-comments.json is missing or invalid JSON"
    ((FAILED++))
fi
echo ""

# Test 2: PR comments has required fields
echo "Test 2: pr-comments.json has required fields..."
if jq -e '.fetchedAt and .repository and .pullRequests' "$PR_COMMENTS" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}: Required fields present"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Missing required fields"
    ((FAILED++))
fi
echo ""

# Test 3: Count total comments (should be 15)
echo "Test 3: pr-comments.json has 15 comments..."
COMMENT_COUNT=$(jq '[.pullRequests[].comments[]] | length' "$PR_COMMENTS")
if [ "$COMMENT_COUNT" -eq 15 ]; then
    echo -e "${GREEN}✓ PASS${NC}: Found 15 comments"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Expected 15 comments, found $COMMENT_COUNT"
    ((FAILED++))
fi
echo ""

# Test 4: Comments cover expected categories
echo "Test 4: Comments cover SQL injection, error handling, React keys..."
SQL_COUNT=$(jq '[.pullRequests[].comments[] | select(.body | test("SQL injection|sql injection|parameterized|placeholders"))] | length' "$PR_COMMENTS")
ERROR_COUNT=$(jq '[.pullRequests[].comments[] | select(.body | test("error handling|try-catch|try catch"))] | length' "$PR_COMMENTS")
REACT_COUNT=$(jq '[.pullRequests[].comments[] | select(.body | test("[Kk]ey prop|key=|unique key"))] | length' "$PR_COMMENTS")

echo "  SQL injection comments: $SQL_COUNT (expected ~5)"
echo "  Error handling comments: $ERROR_COUNT (expected ~3)"
echo "  React key comments: $REACT_COUNT (expected ~3)"

if [ "$SQL_COUNT" -ge 4 ] && [ "$ERROR_COUNT" -ge 2 ] && [ "$REACT_COUNT" -ge 2 ]; then
    echo -e "${GREEN}✓ PASS${NC}: Good distribution of comment types"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Comment distribution doesn't match expected"
    ((FAILED++))
fi
echo ""

# Test 5: Red flags file exists and is valid
echo "Test 5: red-flags.json exists and is valid..."
if [ -f "$RED_FLAGS" ] && jq -e '.stack and .redFlags' "$RED_FLAGS" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}: red-flags.json is valid"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: red-flags.json is missing or invalid"
    ((FAILED++))
fi
echo ""

# Test 6: Repository instructions exist
echo "Test 6: Repository instructions exist..."
if [ -f "$REPO_INSTRUCTIONS" ]; then
    echo -e "${GREEN}✓ PASS${NC}: copilot-instructions.md exists"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: copilot-instructions.md missing"
    ((FAILED++))
fi
echo ""

# Test 7: Repository instructions have error handling rule
echo "Test 7: Repository instructions have error handling rule..."
if grep -q "Error Handling" "$REPO_INSTRUCTIONS" && grep -q "try-catch" "$REPO_INSTRUCTIONS"; then
    echo -e "${GREEN}✓ PASS${NC}: Error handling rule found"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Error handling rule missing"
    ((FAILED++))
fi
echo ""

# Test 8: Backend instructions have SQL injection rule
echo "Test 8: Backend instructions have SQL injection rule..."
if grep -q "SQL Injection" "$BACKEND_INSTRUCTIONS" && grep -q "parameterized" "$BACKEND_INSTRUCTIONS"; then
    echo -e "${GREEN}✓ PASS${NC}: SQL injection rule found"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: SQL injection rule missing"
    ((FAILED++))
fi
echo ""

# Test 9: Frontend instructions exist but NO React key rule
echo "Test 9: Frontend instructions exist without React key rule..."
if [ -f "$FRONTEND_INSTRUCTIONS" ] && ! grep -q "key prop" "$FRONTEND_INSTRUCTIONS"; then
    echo -e "${GREEN}✓ PASS${NC}: Frontend instructions exist, React key rule absent (as expected)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Frontend instructions missing or React key rule unexpectedly present"
    ((FAILED++))
fi
echo ""

# Test 10: Backend instructions have applyTo frontmatter
echo "Test 10: Backend instructions have applyTo frontmatter..."
if grep -q "applyTo:" "$BACKEND_INSTRUCTIONS"; then
    echo -e "${GREEN}✓ PASS${NC}: applyTo frontmatter found"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: applyTo frontmatter missing"
    ((FAILED++))
fi
echo ""

# Summary
echo "=========================================="
echo "RESULTS:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All mock data validation tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some mock data validation tests failed${NC}"
    exit 1
fi
