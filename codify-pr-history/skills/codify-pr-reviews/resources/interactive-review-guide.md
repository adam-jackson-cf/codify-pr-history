# Interactive Review Guide

Guide to the two interactive review stages: pattern approval and rule wording approval.

---

## Overview

The skill has TWO interactive review stages:

1. **Stage 5: Pattern Review** - Approve which patterns should become rules
2. **Stage 7: Wording Review** - Approve the actual rule content

## Decision Points Framework

Throughout the workflow, you make decisions at two key stages:

### Stage 5: Pattern-Level Decisions (Strategic)

**What you decide**: Which patterns should become rules?

**Key questions**:
- Which patterns should become rules?
- Should existing rules be strengthened or left alone?
- Are triage decisions correct?
- Is the frequency high enough to warrant action?

**Focus**: High-level strategy (what to fix)

### Stage 7: Rule-Level Decisions (Tactical)

**What you decide**: How should the rules be written?

**Key questions**:
- Is the rule wording clear and actionable?
- Are the examples appropriate for the codebase?
- Is the target file correct?
- Do the directives make sense for your team?

**Focus**: Tactical execution (how to fix)

**Why two stages?**

- Stage 5: Strategic decisions (what to fix)
- Stage 7: Tactical execution (how to fix)
- Allows refinement without re-analyzing patterns
- Separation of concerns enables better decision quality

---

## Configuration

### Stage 5: Pattern Review Configuration

**Input**: `03-analyze/patterns.json` (from pattern analysis stage)

**Output**: `04-approve/patterns-approved.json` with user decisions

**Configuration**:
```json
{
  "patternsPath": ".workspace/codify-pr-history/runs/2025-10-30_143022/03-analyze/patterns.json",
  "outputPath": ".workspace/codify-pr-history/runs/2025-10-30_143022/04-approve/patterns-approved.json"
}
```

### Stage 7: Rule Wording Review Configuration

**Input**: `05-generate/drafts/*.md` (from rule generation stage)

**Output**: `06-apply/approved-rules.json` with final decisions

**Configuration**:
```json
{
  "draftsDir": ".workspace/codify-pr-history/runs/2025-10-30_143022/05-generate/drafts/",
  "outputPath": ".workspace/codify-pr-history/runs/2025-10-30_143022/06-apply/approved-rules.json"
}
```

### Stage 8: Rule Application Configuration

**Input**: `06-apply/approved-rules.json`

**Output**: Updated instruction files + git commit

**Configuration**:
```json
{
  "approvedRulesPath": ".workspace/codify-pr-history/runs/2025-10-30_143022/06-apply/approved-rules.json",
  "instructionFiles": {
    "repository": "../copilot-review-demo/.github/copilot-instructions.md",
    "backend": "../copilot-review-demo/backend/backend.instructions.md",
    "frontend": "../copilot-review-demo/frontend/frontend.instructions.md"
  }
}
```

---

## Data Organization

### Stage 5 Output: Approved Patterns

Saved to `04-approve/patterns-approved.json`:

```json
{
  "metadata": {
    "runId": "2025-10-30_143022",
    "totalPatterns": 12,
    "approvedPatterns": 8,
    "decisions": {
      "create": 5,
      "strengthen": 3,
      "skip": 4
    }
  },
  "approvedPatterns": [
    {
      "patternId": "sql-injection-pattern",
      "action": "create",
      "targetFile": "backend/backend.instructions.md",
      "targetSection": "Database Operations",
      "userFeedback": "Focus on LIKE queries and IN clauses",
      "approvedAt": "2025-10-30T15:45:00Z"
    }
  ]
}
```

### Stage 7 Output: Approved Rules

Saved to `06-apply/approved-rules.json`:

```json
{
  "metadata": {
    "runId": "2025-10-30_143022",
    "totalRules": 8,
    "approvedRules": 6,
    "rejectedRules": 2
  },
  "approvedRules": [
    {
      "ruleId": "sql-injection-rule",
      "sourcePattern": "sql-injection-pattern",
      "action": "create",
      "targetFile": "backend/backend.instructions.md",
      "targetSection": "Database Operations",
      "finalWording": "approved markdown content",
      "userEdits": "Added examples for LIKE queries",
      "approvedAt": "2025-10-30T16:20:00Z"
    }
  ]
}
```

### Stage 8 Output: Applied Summary

Saved to `06-apply/applied-summary.md`:

```markdown
# Rules Applied Successfully

## Files Modified (3)
- backend/backend.instructions.md (2 rules: 1 strengthened, 1 new)
- repository/.github/copilot-instructions.md (1 new rule)
- frontend/frontend.instructions.md (3 new rules)

## Summary
- Rules approved: 6
- Rules applied: 6
- Git commit: abc123def

## Changes by Category
- Security: 3 rules (2 new, 1 strengthened)
- Error Handling: 2 rules (1 new, 1 strengthened)
- React Patterns: 1 rule (new)

## Git Commit
feat: codify PR review patterns from 90-day analysis

Applied 6 rules from PR history analysis (2025-08-01 to 2025-10-30):
- Strengthened 2 existing rules (SQL injection, bcrypt usage)
- Created 4 new rules (rate limiting, React keys, etc.)
- Analyzed 450 comments across 45 PRs
- 12 patterns identified, 8 approved

Run: 2025-10-30_143022

🤖 Generated with codify-pr-reviews skill
```

---

## Stage 5: Pattern Review

### Purpose

Review identified patterns and decide which should generate rules.

### Pattern Categories

Patterns are presented in three groups:

#### 🟢 Already Covered (4 patterns)

**What this means**:

- An existing Copilot rule addresses this pattern
- Frequency is within expected ~30% non-adherence rate
- **Recommendation**: Skip (rule is working)

**Example**:

```text
Pattern 1 of 12: Missing Try-Catch Blocks

Triage: 🟢 ALREADY COVERED
Frequency: 4 occurrences over 90 days
Severity: High
Category: Error Handling

Existing Rule:
File: .github/copilot-instructions.md
Section: Error Handling
Content: "All functions must include error handling with try-catch blocks"
Examples: ✓ Has good/bad examples

Analysis:
4 occurrences over 90 days is within the expected ~30% Copilot
non-adherence rate. The existing rule is comprehensive and has clear
examples. No action recommended.

PR Comment Examples:
- PR #123: "Missing try-catch here"
- PR #145: "Need error handling"
- PR #167: "Add try-catch"
- PR #189: "Error handling missing"

What would you like to do?
A) Agree - skip (rule is working, this is normal)
B) Strengthen anyway (add more examples or make more explicit)
C) View existing rule content (read full rule before deciding)
```text

**Options**:

- **A (Skip)** - Most common choice. Rule is working.
- **B (Strengthen)** - If you feel the rule could be clearer despite normal frequency
- **C (View)** - See full rule content to make informed decision

#### 🟡 Needs Strengthening (3 patterns)

**What this means**:

- Existing rule addresses the general area
- BUT high frequency suggests rule is insufficient
- Specific gap identified (e.g., missing examples)

**Example**:

```text
Pattern 5 of 12: SQL Injection via String Concatenation

Triage: 🟡 NEEDS STRENGTHENING
Frequency: 8 occurrences over 90 days
Severity: Critical
Category: Security

Existing Rule:
File: backend/backend.instructions.md
Section: Database Operations
Content: "Use parameterized queries with ? placeholders"
Examples: ✓ Has basic SELECT examples

Analysis:
8 occurrences suggests current rule isn't comprehensive enough.
Breaking down the comments:
- 5 comments mention LIKE queries with wildcards
- 2 comments mention IN clauses with arrays
- 1 comment mentions dynamic column names

Current rule only shows simple SELECT statements.

Suggested Enhancement:
Add examples for:
1. LIKE queries with wildcards
2. IN clauses with arrays
3. Note about dynamic table/column names (can't use ?)

PR Comment Examples:
- PR #123: "SQL injection in search - LIKE '%' + term + '%'"
- PR #145: "This LIKE query is vulnerable to SQL injection"
- PR #156: "IN clause concatenation is unsafe"
- PR #178: "Use placeholders for LIKE queries too"
...

What would you like to do?
A) Strengthen as suggested
B) Strengthen with different approach (provide feedback)
C) Actually already fine - skip (I disagree with the analysis)
D) Create new separate rule instead (don't modify existing)
E) View existing rule content
```text

**Options**:

- **A (Strengthen as suggested)** - Apply the proposed enhancement
- **B (Different approach)** - You'll be prompted for custom feedback:

  ```text
  How would you like to strengthen this rule?

  Your feedback: [type here]

  Example: "Add examples for LIKE, IN, and also cover UPDATE/DELETE queries"
  ```

- **C (Skip)** - Disagree with analysis, rule is fine
- **D (Create new)** - Make a separate rule rather than modifying existing
- **E (View)** - Read full existing rule

#### 🔴 New Rule Needed (5 patterns)

**What this means**:

- No existing rule addresses this pattern
- New coverage area
- **Recommendation**: Create rule

**Example**:

```text
Pattern 8 of 12: Missing Rate Limiting on Auth Endpoints

Triage: 🔴 NEW RULE NEEDED
Frequency: 3 occurrences
Severity: High
Category: Security

Existing Rule: None found

Analysis:
No existing rule addresses rate limiting. This pattern appeared in
3 different PRs, all for authentication endpoints (login, signup,
password reset). This is a security best practice that should be
codified as a new backend rule.

Suggested Rule:
Target File: backend/backend.instructions.md
Section: Security Requirements (or create new "Rate Limiting" section)
Content: Authentication endpoints must implement rate limiting
(e.g., 5 attempts per 15 minutes)

PR Comment Examples:
- PR #134: "Add rate limiting to login endpoint - brute force risk"
- PR #156: "Password reset needs rate limiting"
- PR #178: "Signup endpoint vulnerable to spam without rate limiting"

What would you like to do?
A) Create new rule as suggested
B) Create with modifications (provide feedback)
C) Actually already covered (point me to existing rule I missed)
D) Skip - not worth codifying
```text

**Options**:

- **A (Create)** - Proceed with rule generation
- **B (Modify)** - Custom feedback:

  ```text
  How should this rule be different?

  Your feedback: [type here]

  Example: "Target vscode-security instead, and include API rate limiting too, not just auth"
  ```

- **C (Already covered)** - Point to existing rule that was missed
- **D (Skip)** - Not worth automating

### Flexible Feedback Handling

**User provides freeform input**:

```text
Pattern 5: SQL Injection

Your choice: B (strengthen with different approach)

How would you like to strengthen this rule?

> Actually for SQL injection, also add examples for:
> - IN clauses with arrays
> - LIKE queries
> - Dynamic ORDER BY (can't use ?)
> And make it clear that table names can't be parameterized

✓ Updated pattern suggestedAction
✓ Added to enhancement: "IN clauses, LIKE queries, ORDER BY, table names note"
✓ Moving to next pattern...
```text

System parses feedback and updates the pattern data.

---

## Stage 7: Rule Wording Review

### Purpose

Review the actual generated rule content (markdown, examples, target file).

### For NEW Rules

**What you see**:

```text
Rule 8 of 8: NEW Rate Limiting for Auth Endpoints

Target: backend/backend.instructions.md
Section: Security Requirements
Action: Create new rule

─────────────────────────────────────────────────────────────
## Rate Limiting for Authentication Endpoints

- ALWAYS implement rate limiting on authentication endpoints
- Use a limit of 5 attempts per 15 minutes for login/signup/password-reset
- Return 429 Too Many Requests when limit exceeded
- Log rate limit violations for security monitoring

❌ BAD:
\`\`\`typescript
app.post('/api/login', async (req, res) => {
  // No rate limiting - vulnerable to brute force
  const user = await authenticateUser(req.body);
  res.json({ token: generateToken(user) });
});
\`\`\`

✅ GOOD:
\`\`\`typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many attempts, please try again later'
});

app.post('/api/login', authLimiter, async (req, res) => {
  const user = await authenticateUser(req.body);
  res.json({ token: generateToken(user) });
});
\`\`\`
─────────────────────────────────────────────────────────────

Pattern Context:
- Frequency: 3 occurrences
- Severity: High
- Comments from PRs: #134, #156, #178

What would you like to do?
A) Approve as-is
B) Edit wording
C) Change target file/section
D) Reject
```text

**Options**:

- **A (Approve)** - Apply rule as shown
- **B (Edit)** - Inline editing:

  ```text
  Edit the markdown content:
  [shows editable text area with current content]

  [User modifies examples, wording, etc.]

  Save changes? [yes/no]
  ✓ Changes saved
  ```

- **C (Change target)** - Select different file or section:

  ```text
  Current target: backend/backend.instructions.md (Security Requirements)

  Change to:

  1) repository/.github/copilot-instructions.md (General)
  2) backend/backend.instructions.md (different section)
  3) vscode-security rules
  4) Keep current target

  Your choice: 3

  ✓ Target updated to: .vscode/rules/security-patterns.md
  ```

- **D (Reject)** - Don't apply this rule

### For STRENGTHEN Rules

**What you see**:

```text
Rule 5 of 8: STRENGTHEN SQL Injection Prevention

Target: backend/backend.instructions.md
Section: Database Operations
Action: Add examples after existing content

Current Rule Content:
─────────────────────────────────────────────────────────────
## SQL Injection Prevention

- ALWAYS use parameterized queries or prepared statements
- NEVER concatenate user input directly into SQL query strings
- Use `?` placeholders for all dynamic values

❌ BAD:
\`\`\`typescript
const query = \`SELECT * FROM users WHERE id = ${userId}\`;
\`\`\`

✅ GOOD:
\`\`\`typescript
const query = \`SELECT * FROM users WHERE id = ?\`;
db.all(query, [userId], callback);
\`\`\`
─────────────────────────────────────────────────────────────

Proposed Enhancement (will be ADDED after above):
─────────────────────────────────────────────────────────────
### LIKE Queries with Wildcards

❌ BAD:
\`\`\`typescript
const search = \`SELECT * FROM tasks WHERE title LIKE '%${term}%'\`;
\`\`\`

✅ GOOD:
\`\`\`typescript
const search = \`SELECT * FROM tasks WHERE title LIKE ?\`;
db.query(search, [\`%${term}%\`]);
\`\`\`

### IN Clauses with Arrays

❌ BAD:
\`\`\`typescript
const ids = [1, 2, 3];
const query = \`SELECT * FROM users WHERE id IN (${ids.join(',')})\`;
\`\`\`

✅ GOOD:
\`\`\`typescript
const ids = [1, 2, 3];
const placeholders = ids.map(() => '?').join(',');
const query = \`SELECT * FROM users WHERE id IN (${placeholders})\`;
db.query(query, ids);
\`\`\`

**Note**: Table and column names cannot be parameterized and must be
validated separately (whitelist approach).
─────────────────────────────────────────────────────────────

Rationale:
8 PR comments specifically mentioned LIKE queries and IN clauses,
suggesting developers don't realize these are also vulnerable.

What would you like to do?
A) Approve as-is
B) Edit enhancement
C) Change target/section
D) Reject
```text

Same options as NEW rules, but shows existing content + enhancement.

---

## Decision Tracking

All decisions are tracked in:

```text
.workspace/codify-pr-history/runs/[timestamp]/04-approve/patterns-approved.json
.workspace/codify-pr-history/runs/[timestamp]/06-apply/approved-rules.json
```text

**Pattern decisions**:

```json
{
  "patternId": "sql-injection",
  "decision": "strengthen",
  "userFeedback": "Add IN clause and LIKE examples",
  "modifiedPattern": {
    "suggestedAction": "Add examples for LIKE queries, IN clauses..."
  }
}
```text

**Rule decisions**:

```json
{
  "ruleId": "rule-5",
  "decision": "approve",
  "targetFile": "backend/backend.instructions.md",
  "section": "Database Operations",
  "action": "strengthen"
}
```text

---

## Tips for Effective Review

### Pattern Review (Stage 5)

**Trust the triage**: The algorithm compares to existing rules. If marked "already covered," it usually is.

**Consider frequency**:

- 3-4 occurrences over 90 days: Normal for good rules
- 8+ occurrences: Likely needs strengthening

**Don't over-strengthen**: If a pattern has 4 occurrences and good existing rule, skip it. That's expected Copilot adherence.

**Skip style preferences**: Focus on correctness and security, not style.

### Wording Review (Stage 7)

**Check examples match your stack**:

```typescript
// If you use Prisma, examples should show Prisma
✅ await prisma.user.findMany({ where: { ... } })
❌ db.query("SELECT * FROM users WHERE...", [])
```text

**Verify severity**: Is this really critical/high/medium?

**Check target file**: Backend rule shouldn't be in repository-level file.

**Edit freely**: The generated content is a starting point. Customize to your team's style.

---

## Keyboard Shortcuts (Future)

**Pattern review**:

- `A` - Approve/Skip
- `B` - Strengthen/Modify
- `C` - View content
- `D` - Different action
- `E` - Edit

**Wording review**:

- `A` - Approve
- `E` - Edit
- `T` - Change target
- `R` - Reject

---

## Common Review Patterns

### Scenario: All Patterns Already Covered

```text
12 patterns identified:
🟢 Already Covered: 12
🟡 Needs Strengthening: 0
🔴 New Rules: 0

This means your existing Copilot rules are comprehensive!
Consider this a "health check" - your rules are working.
```text

**Action**: Skip all, celebrate good rule coverage.

### Scenario: Mostly New Rules

```text
12 patterns identified:
🟢 Already Covered: 2
🟡 Needs Strengthening: 1
🔴 New Rules: 9

This suggests gaps in current rule coverage.
```text

**Action**: Prioritize critical/high severity new rules first.

### Scenario: High Frequency on Covered Rules

```text
Pattern: Missing Error Handling
Triage: 🟢 Already Covered
Frequency: 15 occurrences

This is unusually high for a covered rule.
```text

**Action**: Choose "Strengthen anyway" - rule might need to be more explicit or have better examples.

---

## See Also

- [workflow-overview.md](workflow-overview.md) - Complete workflow
- [pattern-analysis-guide.md](pattern-analysis-guide.md) - How triage decisions are made
- [rule-generation-guide.md](rule-generation-guide.md) - How rules are generated
