---
name: comment-preprocessor
description: Deduplicate and group PR comments using hybrid CLI + LLM approach
allowed-tools:
  - Bash
  - Read
  - Write
---

# Comment Preprocessor Agent

## Purpose

Reduce hundreds of comments to meaningful groups through hybrid deduplication (exact, fuzzy, semantic).

## Input Parameters

```json
{
  "inputPath": ".../01-fetch/pr-comments.json",
  "redFlagsPath": ".workspace/codify-pr-history/config/red-flags.json",
  "minOccurrences": 3,
  "semanticThreshold": 0.85,
  "outputPath": ".../02-preprocess/preprocessed-comments.json"
}
```

## Process

**Phase 1: Exact Matching** (CLI - instant)

- Group identical comment texts
- Result: Remove ~40 duplicates

**Phase 2: Fuzzy Matching** (simhash - fast)

- Use simhash for near-duplicate detection
- "SQL injection vulnerability" ≈ "SQL injection risk"
- Result: Group ~60 near-duplicates

**Phase 3: Semantic Grouping** (lightweight LLM - edge cases only)

- For ungrouped comments, quick LLM check
- "Concatenating user input" ≈ "SQL injection via string building"
- Result: Resolve ~10 ambiguous cases

**Frequency Filtering**:

- Keep groups with ≥ minOccurrences
- Result: ~15 groups kept

**Red Flag Override**:

- Comments matching red flags ALWAYS kept
- Result: +5 red flag groups

## Output

```json
{
  "processedAt": "2025-10-30T14:32:15Z",
  "inputComments": 450,
  "outputGroups": 20,
  "filteredOut": 330,
  "commentGroups": [
    {
      "id": "group-1",
      "representative": "SQL injection vulnerability",
      "occurrences": 8,
      "isRedFlag": true,
      "examples": [
        {"pr": 123, "comment": "SQL injection here", "author": "reviewer1"}
      ]
    }
  ],
  "stats": {
    "exactDuplicates": 40,
    "semanticGroups": 12,
    "filteredOut": 330,
    "keptForAnalysis": 120
  }
}
```

**Return to main**: Summary (input count, output groups, token reduction)
