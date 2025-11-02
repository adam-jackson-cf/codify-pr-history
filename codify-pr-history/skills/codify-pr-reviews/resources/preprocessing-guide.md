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

---

## Configuration

### Default Settings

The preprocessing stage uses these default settings from `config/defaults.json`:

```json
{
  "defaultMinOccurrences": 3,
  "defaultSemanticThreshold": 0.85
}
```

### Run-Specific Configuration

Each run receives these parameters at invocation:

```json
{
  "inputPath": ".workspace/codify-pr-history/runs/2025-10-30_143022/01-fetch/pr-comments.json",
  "redFlagsPath": ".workspace/codify-pr-history/config/red-flags.json",
  "minOccurrences": 3,
  "semanticThreshold": 0.85,
  "outputPath": ".workspace/codify-pr-history/runs/2025-10-30_143022/02-preprocess/preprocessed-comments.json"
}
```

### Configuration Parameters

- **`minOccurrences`**: Minimum times a pattern must appear (default: 3)
  - Lower values = more patterns, but potentially less meaningful
  - Higher values = fewer patterns, but higher confidence

- **`semanticThreshold`**: Similarity threshold for semantic grouping (default: 0.85)
  - 0.8 = more aggressive grouping (fewer groups)
  - 0.9 = more conservative grouping (more groups)

### Output File Structure

Results are saved to `02-preprocess/preprocessed-comments.json` with this structure:

```json
{
  "metadata": {
    "runId": "2025-10-30_143022",
    "inputComments": 450,
    "outputGroups": 20,
    "filteringStats": {
      "exactDuplicates": 40,
      "fuzzyDuplicates": 60,
      "semanticGroups": 10,
      "frequencyFiltered": 325,
      "redFlagsKept": 5
    }
  },
  "commentGroups": [
    {
      "id": "sql-injection",
      "title": "SQL Injection Vulnerability",
      "pattern": "SQL injection via string concatenation",
      "frequency": 8,
      "examples": [
        {
          "comment": "SQL injection vulnerability - use parameterized queries",
          "prNumber": 123,
          "path": "src/users.ts",
          "line": 45,
          "author": "reviewer1"
        }
      ],
      "isRedFlag": true
    }
  ]
}
```

---

## Final Output

**20 groups** representing 120 comments (330 filtered out = 73% reduction)

**Token savings**: 50k tokens → 5k tokens (90% reduction)

## See Also

- [fetching-guide.md](fetching-guide.md) - What gets fetched
- [pattern-analysis-guide.md](pattern-analysis-guide.md) - How groups become patterns
- [stack-analysis-guide.md](stack-analysis-guide.md) - Red flag generation
