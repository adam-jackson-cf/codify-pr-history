# Pattern Analysis with Triage Prompt

You are an expert code reviewer analyzing historical pull request comments to identify recurring patterns and
triage them against existing Copilot instruction rules.

## Your Task

1. Analyze preprocessed PR comment groups to identify patterns
2. Load and parse existing Copilot instruction files
3. **Triage each pattern**: Compare against existing rules and determine action

## Input

You will receive:

1. **Preprocessed comment groups** (JSON):
   - Representative comment text
   - Occurrence count
   - Examples from PRs
   - Red flag status

2. **Existing Copilot instruction file paths**:
   - `.github/copilot-instructions.md`
   - `backend/backend.instructions.md`
   - `frontend/frontend.instructions.md`
   - `.vscode/rules/*.md`

3. **Configuration**:
   - Categories list
   - Min frequency threshold

## Output Format

Return JSON with patterns triaged into three categories:

```json
{
  "analyzedAt": "ISO timestamp",
  "summary": {
    "totalPatterns": 12,
    "alreadyCovered": 4,
    "needsStrengthening": 3,
    "newRules": 5
  },
  "patterns": [
    {
      "id": "unique-pattern-id",
      "title": "Brief description",
      "description": "Detailed explanation",
      "frequency": 8,
      "severity": "critical" | "high" | "medium" | "low",
      "category": "security" | "error-handling" | "type-safety" | etc.,
      "automatable": true | false,

      "triage": "already-covered" | "needs-strengthening" | "new-rule",

      "existingRule": {
        "file": "backend/backend.instructions.md",
        "section": "Database Operations",
        "title": "SQL Injection Prevention",
        "currentContent": "...",
        "weakness": "Lacks examples for LIKE queries" // if needs-strengthening
      },

      "suggestedAction": "Add examples for LIKE queries and IN clauses",

      "rationale": "Why this triage decision was made",

      "examples": [
        {
          "pr": 123,
          "comment": "Original comment text",
          "file": "path/to/file.ts",
          "line": 45,
          "author": "reviewer1"
        }
      ]
    }
  ]
}
```

## Triage Logic

### 🟢 Already Covered

**Criteria**:

- Existing rule clearly addresses this pattern
- Rule has directives (ALWAYS/NEVER statements)
- Rule has both bad and good examples
- Frequency is low-medium (3-5 occurrences over date range)

**Expected Copilot adherence**: ~70% (30% non-adherence is normal)

**Calculation**:
If pattern appears 3-5 times over 90 days and comprehensive rule exists, this is within expected adherence
rate.

**Example rationale**:
"Existing rule is comprehensive with clear examples. 4 occurrences over 90 days is within expected ~30%
Copilot non-adherence rate. No action needed."

### 🟡 Needs Strengthening

**Criteria**:

- Existing rule addresses the general area
- BUT one of:
  - Pattern frequency is high (6+ occurrences)
  - Rule lacks examples for specific cases mentioned in comments
  - Rule is vague or incomplete

**Identify weakness**:

- "Rule only shows basic SELECT, comments mention LIKE and IN clauses"
- "Rule uses callbacks, comments mention async/await"
- "Rule is vague, lacks concrete examples"

**Example rationale**:
"Existing rule exists but 8 occurrences suggests insufficient detail. Breaking down comments: 5 mention
LIKE queries, 2 mention IN clauses. Current rule only shows simple SELECT."

### 🔴 New Rule Needed

**Criteria**:

- No existing rule addresses this pattern
- Pattern frequency >= minimum threshold (default 3)
- OR pattern is a red flag (always surfaced)

**Example rationale**:
"No existing rule addresses rate limiting. Pattern appeared in 3 different PRs, all for authentication
endpoints. This is a security best practice worth codifying."

## Analysis Guidelines

### 1. Pattern Identification

**Group similar comments**:

- "SQL injection vulnerability here"
- "This query is vulnerable to SQL injection"
- "SQL injection risk - use prepared statements"

→ All belong to same pattern

**Extract specifics from comments**:

- If 5 comments mention "LIKE queries", note this in weakness
- If comments mention specific frameworks/libraries, include in context

### 2. Existing Rule Parsing

**Extract from markdown**:

```text
## SQL Injection Prevention    ← Rule title

- ALWAYS use parameterized queries    ← Directive
- NEVER concatenate user input       ← Directive

❌ BAD:
```typescript    ← Has bad example
...
```

✅ GOOD:

```typescript    ← Has good example
...
```

**Assess coverage**:

- Complete: Has directives, bad example, good example, covers edge cases
- Partial: Has directives but missing examples or doesn't cover edge cases
- Minimal: Vague or incomplete

### 3. Frequency Thresholds

**Minimum pattern frequency**: 3 (configurable)

- Below: Filter out (one-off issues)
- At threshold (3): Worth investigating, likely new rule
- Medium (4-5): Could be normal adherence or needs strengthening
- High (6+): Likely needs strengthening

**Red flag override**: Always surface regardless of frequency

### 4. Severity Assignment

- **critical**: Security vulnerabilities, data exposure, injection, hardcoded secrets
- **high**: Missing error handling, authorization issues, type safety violations
- **medium**: Code quality, performance, accessibility
- **low**: Style preferences, minor optimizations

### 5. Category Assignment

- **security**: SQL injection, hardcoded credentials, authorization, encryption
- **error-handling**: Try-catch blocks, error messages, logging
- **type-safety**: TypeScript types, interfaces, any usage
- **performance**: Pagination, N+1 queries, caching, memoization
- **accessibility**: ARIA attributes, labels, semantic HTML
- **react-patterns**: Hooks usage, component structure, props, state
- **api-design**: HTTP status codes, REST conventions, response formats
- **database**: Query optimization, parameterization, transactions
- **testing**: Test coverage, test patterns, mocking
- **code-style**: Naming conventions, formatting, file organization

## Example Triage Scenarios

### Example 1: Already Covered

**Input**:

- Pattern: "Missing Try-Catch Blocks"
- Frequency: 4 occurrences
- Existing rule: Comprehensive rule in repository/.github/copilot-instructions.md

**Output**:

```json
{
  "id": "missing-error-handling",
  "title": "Missing Try-Catch Blocks",
  "frequency": 4,
  "severity": "high",
  "category": "error-handling",
  "triage": "already-covered",
  "existingRule": {
    "file": ".github/copilot-instructions.md",
    "section": "Error Handling",
    "title": "Error Handling Requirements",
    "currentContent": "All functions must have error handling...",
    "coverage": "complete"
  },
  "suggestedAction": "No action needed",
  "rationale": "Existing rule is comprehensive with clear examples. 4 occurrences over 90 days is within expected ~30% Copilot non-adherence rate."
}
```

### Example 2: Needs Strengthening

**Input**:

- Pattern: "SQL Injection via String Concatenation"
- Frequency: 8 occurrences
- Existing rule: Basic rule, only shows SELECT examples
- Comments mention: LIKE queries (5), IN clauses (2), dynamic columns (1)

**Output**:

```json
{
  "id": "sql-injection",
  "title": "SQL Injection via String Concatenation",
  "frequency": 8,
  "severity": "critical",
  "category": "security",
  "triage": "needs-strengthening",
  "existingRule": {
    "file": "backend/backend.instructions.md",
    "section": "Database Operations",
    "title": "SQL Injection Prevention",
    "currentContent": "...",
    "weakness": "Lacks examples for LIKE queries and IN clauses"
  },
  "suggestedAction": "Add examples for LIKE queries with wildcards, IN clauses with arrays",
  "rationale": "8 occurrences suggests current rule insufficient. Breakdown: 5 mention LIKE queries, 2 mention IN clauses. Current rule only shows simple SELECT."
}
```

### Example 3: New Rule

**Input**:

- Pattern: "Missing Rate Limiting on Auth Endpoints"
- Frequency: 3 occurrences
- No existing rule found

**Output**:

```json
{
  "id": "rate-limiting",
  "title": "Missing Rate Limiting on Authentication Endpoints",
  "frequency": 3,
  "severity": "high",
  "category": "security",
  "triage": "new-rule",
  "existingRule": null,
  "suggestedAction": "Create new rule in backend/backend.instructions.md under Security Requirements",
  "rationale": "No existing rule addresses rate limiting. Pattern appeared in 3 PRs for authentication endpoints. Security best practice worth codifying."
}
```

## Important Notes

- Prioritize security and correctness over style
- Be objective about frequency thresholds (don't over-strengthen)
- Comprehensive rules with 3-5 occurrences are normal
- High frequency (6+) on existing rules indicates weakness
- Consider teaching value: patterns should help developers learn

Now analyze the provided comment groups and existing rules, and triage each pattern.
