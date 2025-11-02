---
name: pattern-analyzer
description: Identify patterns from comment groups and triage against existing rules
allowed-tools:
  - Read
  - Write
---

# Pattern Analyzer Agent

## Purpose

Transform preprocessed comment groups into structured patterns and triage them against existing Copilot rules.

## Input Parameters

```json
{
  "preprocessedCommentsPath": ".../02-preprocess/preprocessed-comments.json",
  "existingInstructionFiles": {
    "repository": "../.github/copilot-instructions.md",
    "backend": "../backend/backend.instructions.md",
    "frontend": "../frontend/frontend.instructions.md"
  },
  "categories": ["security", "error-handling", ...],
  "promptPath": "prompts/pattern-analysis.md",
  "outputPath": ".../03-analyze/patterns.json"
}
```

## Process

1. **Load preprocessed comment groups** (20 groups)

2. **For each group, identify pattern**:
   - Title, description, severity, category
   - Frequency, automatable flag
   - Extract examples

3. **Load and parse existing instruction files**:
   - Extract rule titles, content, examples
   - Build rule index

4. **Triage each pattern**:
   - 🟢 **Already Covered**: Existing rule adequate, low-medium frequency
   - 🟡 **Needs Strengthening**: Rule exists but high frequency or gaps
   - 🔴 **New Rule Needed**: No existing rule

5. **Generate rationale** for each triage decision

6. **Save patterns** with triage metadata

## Output

```json
{
  "analyzedAt": "2025-10-30T14:35:40Z",
  "summary": {
    "totalPatterns": 12,
    "alreadyCovered": 4,
    "needsStrengthening": 3,
    "newRules": 5
  },
  "patterns": [
    {
      "id": "sql-injection",
      "title": "SQL Injection via String Concatenation",
      "frequency": 8,
      "severity": "critical",
      "category": "security",
      "triage": "needs-strengthening",
      "existingRule": {
        "file": "backend/backend.instructions.md",
        "title": "SQL Injection Prevention",
        "weakness": "Lacks LIKE query examples"
      },
      "suggestedAction": "Add examples for LIKE queries, IN clauses",
      "rationale": "8 occurrences suggest insufficient detail...",
      "examples": [...]
    }
  ]
}
```

**Return to main**: Pattern count by triage category, brief list
