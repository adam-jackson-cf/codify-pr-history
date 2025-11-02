# Pattern Analysis Guide

How patterns are identified from comment groups and triaged against existing Copilot rules.

---

## Purpose

Pattern analysis transforms grouped comments into structured patterns and determines:

1. What the pattern is (title, category, severity)
2. How to handle it (🟢 covered / 🟡 strengthen / 🔴 new)
3. What action to take (skip / enhance / create)

---

## Input

**From previous stage** (preprocessing):

```json
{
  "commentGroups": [
    {
      "id": "group-1",
      "representative": "SQL injection vulnerability - use parameterized queries",
      "occurrences": 8,
      "isRedFlag": true,
      "examples": [
        {"pr": 123, "comment": "SQL injection here", "file": "auth.ts:45"},
        {"pr": 145, "comment": "SQL injection risk", "file": "users.ts:67"},
        ...
      ]
    }
  ]
}
```text

20 groups representing 120 comments (from original 450).

---

## Configuration

### Default Settings

The pattern analysis stage uses these default settings from `config/defaults.json`:

```json
{
  "categories": [
    "security",
    "error-handling",
    "type-safety",
    "performance",
    "accessibility",
    "react-patterns",
    "api-design",
    "database",
    "testing",
    "code-style"
  ],
  "instructionFiles": {
    "repository": "../copilot-review-demo/.github/copilot-instructions.md",
    "backend": "../copilot-review-demo/backend/backend.instructions.md",
    "frontend": "../copilot-review-demo/frontend/frontend.instructions.md",
    "vsCodeSecurity": "../copilot-review-demo/.vscode/rules/security-patterns.md"
  }
}
```

### Run-Specific Configuration

Each run receives these parameters at invocation:

```json
{
  "preprocessedCommentsPath": ".workspace/codify-pr-history/runs/2025-10-30_143022/02-preprocess/preprocessed-comments.json",
  "existingInstructionFiles": {
    "repository": "../copilot-review-demo/.github/copilot-instructions.md",
    "backend": "../copilot-review-demo/backend/backend.instructions.md",
    "frontend": "../copilot-review-demo/frontend/frontend.instructions.md"
  },
  "categories": ["security", "error-handling", "type-safety", ...],
  "promptPath": "prompts/pattern-analysis.md",
  "outputPath": ".workspace/codify-pr-history/runs/2025-10-30_143022/03-analyze/patterns.json"
}
```

### Output File Structure

Results are saved to `03-analyze/patterns.json` with this structure:

```json
{
  "metadata": {
    "runId": "2025-10-30_143022",
    "inputGroups": 20,
    "totalPatterns": 12,
    "triageSummary": {
      "alreadyCovered": 4,
      "needsStrengthening": 3,
      "newRuleNeeded": 5
    }
  },
  "patterns": [
    {
      "id": "sql-injection-pattern",
      "title": "SQL Injection via String Concatenation",
      "description": "User input concatenated directly into SQL queries",
      "frequency": 8,
      "severity": "critical",
      "category": "security",
      "isRedFlag": true,
      "triage": {
        "decision": "new-rule-needed",
        "rationale": "No existing rule covers SQL injection patterns",
        "matchedRule": null,
        "confidence": 0.95
      },
      "examples": [...]
    }
  ]
}
```

---

## Process

### Step 1: Identify Pattern

For each comment group, create a pattern:

**Pattern attributes**:

```json
{
  "id": "sql-injection-prevention",
  "title": "SQL Injection via String Concatenation",
  "description": "User input concatenated directly into SQL query strings instead of using parameterized queries",
  "frequency": 8,
  "severity": "critical",
  "category": "security",
  "automatable": true,
  "examples": [...],
  "relatedFiles": ["auth.ts", "users.ts", "tasks.ts"]
}
```text

**Severity assignment**:

- **Critical**: Security vulnerabilities, data exposure, injection attacks
- **High**: Missing error handling, authorization issues, type safety violations
- **Medium**: Code quality, performance concerns, accessibility
- **Low**: Style preferences, minor optimizations, documentation

**Category assignment**:

- security
- error-handling
- type-safety
- performance
- accessibility
- react-patterns
- api-design
- database
- testing
- code-style

**Automatable check**:

- Can static analysis or LLM reliably detect this?
- Has clear criteria (not subjective)?

---

### Step 2: Load Existing Rules

Parse all Copilot instruction files:

**Files scanned**:

- `.github/copilot-instructions.md` (repository-level)
- `backend/backend.instructions.md` (backend-specific)
- `frontend/frontend.instructions.md` (frontend-specific)
- `.vscode/rules/*.md` (VS Code rules)

**Extraction logic**:

```markdown
## SQL Injection Prevention    ← Extract as rule title

- ALWAYS use parameterized queries    ← Directive
- NEVER concatenate user input...     ← Directive

❌ BAD:
```typescript    ← Has bad example
...
```text

✅ GOOD:

```typescript    ← Has good example
...
```text

```text

**Parsed rule**:
```json
{
  "file": "backend/backend.instructions.md",
  "section": "Database Operations",
  "title": "SQL Injection Prevention",
  "content": "...",
  "hasDirectives": true,
  "hasBadExample": true,
  "hasGoodExample": true,
  "coverage": "partial"  // or "complete"
}
```text

---

### Step 3: Compare Pattern to Existing Rules

For each pattern, find matching existing rule:

**Matching logic**:

```javascript
// Exact title match
if (pattern.title === existingRule.title) {
  match = existingRule;
}

// Semantic match (keywords)
const patternKeywords = extractKeywords(pattern.title);
const ruleKeywords = extractKeywords(existingRule.title);
const similarity = calculateSimilarity(patternKeywords, ruleKeywords);

if (similarity > 0.8) {
  match = existingRule;
}

// Category match
if (pattern.category === existingRule.category &&
    patternKeywords.some(k => ruleKeywords.includes(k))) {
  possibleMatch = existingRule;
}
```text

---

### Step 4: Triage Decision

For each pattern, determine triage category:

#### 🟢 Already Covered

**Criteria**:

- Existing rule clearly addresses this pattern
- Rule has directives (ALWAYS/NEVER statements)
- Rule has both bad and good examples
- Frequency is LOW-MEDIUM (3-5 occurrences over 90 days)

**Logic**:

```javascript
if (matchedRule &&
    matchedRule.hasDirectives &&
    matchedRule.hasBadExample &&
    matchedRule.hasGoodExample &&
    pattern.frequency <= 5) {

  triage = "already-covered";
  rationale = `Existing rule is comprehensive. ${pattern.frequency} occurrences
               over 90 days is within expected ~30% Copilot non-adherence rate.`;
}
```text

**Expected Copilot adherence**: ~70%

This means 30% of code may not follow instructions - that's normal. If you have 100 instances where a rule applies, expect ~30 review comments over time.

**Calculation**:

- 90 days, 45 PRs
- Pattern appears 4 times
- Existing rule is comprehensive
- **Assessment**: Normal adherence rate, no action needed

#### 🟡 Needs Strengthening

**Criteria**:

- Existing rule addresses the general area
- BUT pattern frequency is HIGH (6+ occurrences over 90 days)
- OR rule lacks examples/details for specific case mentioned in comments

**Logic**:

```javascript
if (matchedRule &&
    (pattern.frequency > 5 ||
     !matchedRule.hasBadExample ||
     !matchedRule.hasGoodExample ||
     specificicGapDetected(pattern, matchedRule))) {

  triage = "needs-strengthening";

  // Analyze gap
  const gap = analyzeGap(pattern, matchedRule);
  // e.g., "5 comments mention LIKE queries, rule only shows SELECT"

  rationale = `Existing rule exists but ${gap}. ${pattern.frequency}
               occurrences suggests rule needs more detail/examples.`;
  suggestedAction = `Add examples for: ${gap}`;
}
```text

**Gap detection examples**:

- Comments mention "LIKE queries" → Rule only shows SELECT
- Comments mention "async/await" → Rule only shows callbacks
- Comments mention "IN clauses" → Rule only shows single values
- Comments mention "React keys" → Rule missing or vague

#### 🔴 New Rule Needed

**Criteria**:

- No existing rule addresses this pattern
- Pattern frequency >= minimum threshold (default 3)
- OR pattern is a red flag (always surfaced)

**Logic**:

```javascript
if (!matchedRule && (pattern.frequency >= 3 || pattern.isRedFlag)) {
  triage = "new-rule";
  rationale = `No existing rule addresses ${pattern.category}:
               ${pattern.title}. Pattern appeared in ${pattern.frequency}
               PRs, indicating systematic gap in coverage.`;
  suggestedAction = `Create new rule in ${determineTargetFile(pattern)}`;
}
```text

---

### Step 5: Determine Target File

For patterns requiring action (strengthen or new), suggest target file:

**Decision tree**:

```text
Is it security-specific and detailed?
├─ YES → .vscode/rules/security-patterns.md
└─ NO  → Is it backend/API code?
   ├─ YES → backend/backend.instructions.md
   └─ NO  → Is it frontend/React code?
      ├─ YES → frontend/frontend.instructions.md
      └─ NO  → Is it a testing pattern?
         ├─ YES → .vscode/rules/testing-standards.md
         └─ NO  → Is it universal?
            ├─ YES → .github/copilot-instructions.md
            └─ NO  → .vscode/rules/general-guidelines.md
```text

**Category-based routing**:

- `security` → backend or vscode-security (depending on detail level)
- `error-handling` → repository (universal)
- `react-patterns` → frontend
- `database` → backend
- `api-design` → backend
- `type-safety` → repository or backend/frontend
- `accessibility` → frontend

**File path analysis**:
If all pattern examples are from `backend/src/**`:

- Likely backend-specific → backend.instructions.md

If all from `frontend/src/components/**`:

- Likely frontend-specific → frontend.instructions.md

---

## Output

### patterns.json

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
      "automatable": true,

      "triage": "needs-strengthening",

      "existingRule": {
        "file": "backend/backend.instructions.md",
        "section": "Database Operations",
        "title": "SQL Injection Prevention",
        "currentContent": "...",
        "weakness": "Lacks examples for LIKE queries and IN clauses"
      },

      "suggestedAction": "Add examples for LIKE queries with wildcards and IN clauses with arrays",

      "rationale": "Existing rule exists but 8 occurrences suggests insufficient detail. Breaking down comments: 5 mention LIKE queries, 2 mention IN clauses. Current rule only shows basic SELECT.",

      "examples": [
        {
          "pr": 123,
          "comment": "SQL injection in search - LIKE '%' + term + '%'",
          "author": "reviewer1",
          "file": "backend/src/routes/tasks.ts",
          "line": 45
        },
        ...
      ]
    },

    {
      "id": "missing-error-handling",
      "title": "Missing Try-Catch Blocks",
      "frequency": 4,
      "severity": "high",
      "category": "error-handling",
      "automatable": true,

      "triage": "already-covered",

      "existingRule": {
        "file": ".github/copilot-instructions.md",
        "section": "Error Handling",
        "title": "Error Handling Requirements",
        "currentContent": "All functions must have error handling...",
        "coverage": "complete"
      },

      "suggestedAction": "No action needed",

      "rationale": "Existing rule is comprehensive with clear examples. 4 occurrences over 90 days is within expected ~30% Copilot non-adherence rate.",

      "examples": [...]
    },

    {
      "id": "rate-limiting",
      "title": "Missing Rate Limiting on Auth Endpoints",
      "frequency": 3,
      "severity": "high",
      "category": "security",
      "automatable": true,

      "triage": "new-rule",

      "existingRule": null,

      "suggestedAction": "Create new rule in backend/backend.instructions.md under Security Requirements or new Rate Limiting section",

      "rationale": "No existing rule addresses rate limiting. Pattern appeared in 3 different PRs, all for authentication endpoints. This is a security best practice worth codifying.",

      "examples": [...]
    }
  ]
}
```text

### triage-report.md

Human-readable summary:

```markdown
# Pattern Analysis Report

Run: 2025-10-30_143022
Date Range: 2025-08-01 to 2025-10-30
Total Comments Analyzed: 450 → 120 (grouped)

## Summary

- **Total Patterns**: 12
- **🟢 Already Covered**: 4 (33%)
- **🟡 Needs Strengthening**: 3 (25%)
- **🔴 New Rules Needed**: 5 (42%)

## 🟢 Already Covered (4 patterns)

### 1. Missing Try-Catch Blocks (4 occurrences)
- **Existing**: .github/copilot-instructions.md (Error Handling)
- **Assessment**: Within expected adherence rate
- **Action**: None

### 2. TypeScript 'any' Usage (3 occurrences)
- **Existing**: backend/backend.instructions.md (Type Safety)
- **Assessment**: Rule comprehensive
- **Action**: None

...

## 🟡 Needs Strengthening (3 patterns)

### 5. SQL Injection via String Concatenation (8 occurrences) ⚠️
- **Existing**: backend/backend.instructions.md (Database Operations)
- **Weakness**: Lacks LIKE query and IN clause examples
- **Suggested**: Add examples for LIKE queries, IN clauses
- **Rationale**: High frequency (8) suggests current rule insufficient

...

## 🔴 New Rules Needed (5 patterns)

### 8. Missing Rate Limiting on Auth Endpoints (3 occurrences)
- **No existing rule**
- **Category**: Security
- **Suggested Target**: backend/backend.instructions.md (Security)
- **Rationale**: Recurring security gap across 3 PRs

...
```text

---

## Key Insights

### Copilot Adherence Expectations

**Research shows**: ~70% adherence to custom instructions

**What this means**:

- 30% of applicable code won't follow instructions
- This is NORMAL and EXPECTED
- Don't over-strengthen rules that have 3-5 occurrences

**Triage implications**:

- 3-5 occurrences over 90 days: Likely already covered (normal rate)
- 6-10 occurrences: Might need strengthening
- 10+ occurrences: Definitely needs strengthening or is new

### Frequency Thresholds

**Minimum pattern frequency** (default 3):

- Below threshold: Filtered out (one-off issues)
- At threshold (3): Worth investigating
- Above threshold (5+): Strong signal

**Red flag override**: Always surfaced regardless of frequency.

### Pattern Quality

**High-quality patterns**:

- Specific and actionable ("Use bcrypt.hash not bcrypt.hashSync")
- Repeatable across PRs
- Clear good/bad examples from comments
- Security or correctness focused

**Low-quality patterns**:

- Vague ("Code could be better")
- Subjective ("I prefer this style")
- One-off architectural decisions
- Style preferences without correctness impact

---

## See Also

- [workflow-overview.md](workflow-overview.md) - Complete workflow
- [preprocessing-guide.md](preprocessing-guide.md) - How comments become groups
- [interactive-review-guide.md](interactive-review-guide.md) - How to review triage decisions
- [rule-generation-guide.md](rule-generation-guide.md) - What happens after approval
