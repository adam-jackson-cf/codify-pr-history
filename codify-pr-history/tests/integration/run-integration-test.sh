#!/bin/bash
# Main integration test runner for codify-pr-history skill

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Codify PR History - Integration Test Suite                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "This test suite validates the skill's workflow and checkpoint"
echo "enforcement using mock PR review data."
echo ""

# Change to the test directory
cd "$(dirname "$0")"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TOTAL_PASSED=0
TOTAL_FAILED=0

# Test Suite 1: Checkpoint Documentation Validation
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test Suite 1: Checkpoint Documentation Validation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if ./validation-scripts/validate-checkpoints.sh; then
    echo -e "${GREEN}✓ Checkpoint validation passed${NC}"
    ((TOTAL_PASSED++))
else
    echo -e "${RED}✗ Checkpoint validation failed${NC}"
    ((TOTAL_FAILED++))
fi

echo ""
echo ""

# Test Suite 2: Mock Data Structure Validation
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test Suite 2: Mock Data Structure Validation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if ./validation-scripts/validate-mock-data.sh; then
    echo -e "${GREEN}✓ Mock data validation passed${NC}"
    ((TOTAL_PASSED++))
else
    echo -e "${RED}✗ Mock data validation failed${NC}"
    ((TOTAL_FAILED++))
fi

echo ""
echo ""

# Final Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  INTEGRATION TEST RESULTS                                      ║"
echo "╠════════════════════════════════════════════════════════════════╣"

if [ $TOTAL_FAILED -eq 0 ]; then
    echo -e "║  ${GREEN}✓ ALL TESTS PASSED${NC}                                             ║"
    echo "║                                                                ║"
    echo "║  Test Suites Passed: $TOTAL_PASSED/$((TOTAL_PASSED + TOTAL_FAILED))                                           ║"
    echo "║                                                                ║"
    echo "║  The skill is properly configured with:                        ║"
    echo "║  - All 4 mandatory checkpoints documented                      ║"
    echo "║  - AskUserQuestion in allowed-tools                            ║"
    echo "║  - Enforcement sections in place                               ║"
    echo "║  - Preflight check in pr-comment-fetcher                       ║"
    echo "║  - Valid mock data for testing                                 ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${GREEN}Ready to commit changes!${NC}"
    echo ""
    exit 0
else
    echo -e "║  ${RED}✗ SOME TESTS FAILED${NC}                                           ║"
    echo "║                                                                ║"
    echo "║  Test Suites Passed: $TOTAL_PASSED/$((TOTAL_PASSED + TOTAL_FAILED))                                           ║"
    echo "║  Test Suites Failed: $TOTAL_FAILED/$((TOTAL_PASSED + TOTAL_FAILED))                                           ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${RED}Please fix failing tests before committing.${NC}"
    echo ""
    exit 1
fi
