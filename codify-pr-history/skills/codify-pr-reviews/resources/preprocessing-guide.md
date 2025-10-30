# Comment Preprocessing Guide

How PR comments are deduplicated and grouped using a hybrid CLI + LLM approach.

## Purpose

Reduce 450 raw comments to ~20 meaningful groups through intelligent deduplication:

- **Phase 1**: Exact matching (CLI - instant)
- **Phase 2**: Fuzzy matching (simhash - fast)
- **Phase 3**: Semantic grouping (lightweight LLM - edge cases only)

## Hybrid Approach

### Phase 1: Exact Matching

Simple string comparison removes identical comments:

```bash
"SQL injection vulnerability" == "SQL injection vulnerability"  ✓ Match
```text

**Result**: ~40 duplicates removed (450 → 410 comments)

### Phase 2: Fuzzy Matching

Uses simhash algorithm for near-duplicates:

```bash
"SQL injection vulnerability" ≈ "SQL injection risk"  ✓ Similar
"SQL injection vulnerability" ≈ "Missing error handling"  ✗ Different
```text

**Tool**: `simhash` CLI or similar fuzzy matching tool

**Result**: ~60 near-duplicates grouped (410 → 350 comments)

### Phase 3: Semantic Grouping

For remaining ambiguous cases, lightweight LLM call:

```text
Are these about the same issue?
- "Concatenating user input in query"
- "SQL injection via string building"

Answer: Yes (both about SQL injection)
```text

**Result**: ~10 ambiguous resolved (350 → 340 comments)

## Frequency Filtering

Keep only groups with ≥3 occurrences (configurable):

- Result: 15 groups kept, 325 filtered out

## Red Flag Override

Comments matching red flags ALWAYS kept regardless of frequency:

- Result: +5 red flag groups

## Final Output

**20 groups** representing 120 comments (330 filtered out = 73% reduction)

**Token savings**: 50k tokens → 5k tokens (90% reduction)

## See Also

- [fetching-guide.md](fetching-guide.md) - What gets fetched
- [pattern-analysis-guide.md](pattern-analysis-guide.md) - How groups become patterns
- [stack-analysis-guide.md](stack-analysis-guide.md) - Red flag generation
