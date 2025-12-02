#!/bin/bash
# Validate that all mandatory checkpoint documentation is in place

set -e  # Exit on error

echo "=== Validating Checkpoint Documentation ==="
echo ""

SKILL_FILE="../../skills/codify-pr-reviews/SKILL.md"
FETCHER_FILE="../../agents/pr-comment-fetcher.md"
REVIEW_GUIDE="../../skills/codify-pr-reviews/resources/interactive-review-guide.md"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Test 1: Check SKILL.md has Critical Checkpoints section
echo "Test 1: SKILL.md has Critical Checkpoints section..."
if grep -q "⚠️ CRITICAL: Mandatory User Confirmation Checkpoints" "$SKILL_FILE"; then
    echo -e "${GREEN}✓ PASS${NC}: Found Critical Checkpoints section"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Missing Critical Checkpoints section"
    ((FAILED++))
fi
echo ""

# Test 2: Check all 4 checkpoints are documented
echo "Test 2: All 4 checkpoints documented in SKILL.md..."
if grep -q "Checkpoint 1: After Preflight" "$SKILL_FILE" && \
   grep -q "Checkpoint 2: Stage 5 - Pattern Review" "$SKILL_FILE" && \
   grep -q "Checkpoint 3: Stage 7 - Rule Wording Review" "$SKILL_FILE" && \
   grep -q "Checkpoint 4: Before Stage 8 - Final Confirmation" "$SKILL_FILE"; then
    echo -e "${GREEN}✓ PASS${NC}: All 4 checkpoints documented"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Missing one or more checkpoint documentation"
    ((FAILED++))
fi
echo ""

# Test 3: Check AskUserQuestion is in allowed-tools
echo "Test 3: AskUserQuestion in allowed-tools..."
if grep -q "- AskUserQuestion" "$SKILL_FILE"; then
    echo -e "${GREEN}✓ PASS${NC}: AskUserQuestion in allowed-tools"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: AskUserQuestion missing from allowed-tools"
    ((FAILED++))
fi
echo ""

# Test 4: Check Stage 2 has MANDATORY CHECKPOINT 1
echo "Test 4: Stage 2 has MANDATORY CHECKPOINT 1..."
if grep -q "MANDATORY CHECKPOINT 1" "$SKILL_FILE"; then
    echo -e "${GREEN}✓ PASS${NC}: Stage 2 has checkpoint marker"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Stage 2 missing checkpoint marker"
    ((FAILED++))
fi
echo ""

# Test 5: Check Stage 5 has MANDATORY CHECKPOINT 2
echo "Test 5: Stage 5 has MANDATORY CHECKPOINT 2..."
if grep -q "MANDATORY CHECKPOINT 2" "$SKILL_FILE"; then
    echo -e "${GREEN}✓ PASS${NC}: Stage 5 has checkpoint marker"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Stage 5 missing checkpoint marker"
    ((FAILED++))
fi
echo ""

# Test 6: Check Stage 7 has MANDATORY CHECKPOINT 3
echo "Test 6: Stage 7 has MANDATORY CHECKPOINT 3..."
if grep -q "MANDATORY CHECKPOINT 3" "$SKILL_FILE"; then
    echo -e "${GREEN}✓ PASS${NC}: Stage 7 has checkpoint marker"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Stage 7 missing checkpoint marker"
    ((FAILED++))
fi
echo ""

# Test 7: Check Stage 8 has MANDATORY CHECKPOINT 4
echo "Test 7: Stage 8 has MANDATORY CHECKPOINT 4..."
if grep -q "MANDATORY CHECKPOINT 4" "$SKILL_FILE"; then
    echo -e "${GREEN}✓ PASS${NC}: Stage 8 has checkpoint marker"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Stage 8 missing checkpoint marker"
    ((FAILED++))
fi
echo ""

# Test 8: Check pr-comment-fetcher has preflight check
echo "Test 8: pr-comment-fetcher has Step 0: Preflight Check..."
if grep -q "Step 0: Preflight Check (MANDATORY)" "$FETCHER_FILE"; then
    echo -e "${GREEN}✓ PASS${NC}: Preflight check found"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Preflight check missing"
    ((FAILED++))
fi
echo ""

# Test 9: Check fetcher has STOP instruction
echo "Test 9: pr-comment-fetcher has STOP instruction..."
if grep -q "STOP and return to main skill" "$FETCHER_FILE"; then
    echo -e "${GREEN}✓ PASS${NC}: STOP instruction found"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: STOP instruction missing"
    ((FAILED++))
fi
echo ""

# Test 10: Check interactive-review-guide has enforcement section
echo "Test 10: interactive-review-guide has enforcement section..."
if grep -q "⚠️ ENFORCEMENT: These Reviews are MANDATORY" "$REVIEW_GUIDE"; then
    echo -e "${GREEN}✓ PASS${NC}: Enforcement section found"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Enforcement section missing"
    ((FAILED++))
fi
echo ""

# Test 11: Check ENFORCEMENT section in SKILL.md
echo "Test 11: SKILL.md has ENFORCEMENT subsection..."
if grep -q "You MUST use AskUserQuestion at each checkpoint" "$SKILL_FILE"; then
    echo -e "${GREEN}✓ PASS${NC}: ENFORCEMENT subsection found"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: ENFORCEMENT subsection missing"
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
    echo -e "${GREEN}✓ All checkpoint validation tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some checkpoint validation tests failed${NC}"
    exit 1
fi
