# Workflow Overview

Complete explanation of the PR history codification workflow, from fetching comments to applying rules.

## High-Level Flow

```text
┌─────────────────────────────────────────────────────────────┐
│  /codify-pr-history [days] [--refresh-stack]                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 1: Stack Analysis (first run / --refresh-stack)      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Subagent: stack-analyzer                                    │
│  Input: Project files                                        │
│  Output: red-flags.json (tech stack + critical patterns)    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 2: Fetch PR Comments                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Subagent: pr-comment-fetcher                                │
│  Input: Repo (auto-detect), days back, filters              │
│  Output: pr-comments.json (all comments from N days)         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 3: Preprocess & Deduplicate                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Subagent: comment-preprocessor                              │
│  Input: pr-comments.json, red-flags.json                     │
│  Process: Exact + Fuzzy + Semantic deduplication            │
│  Output: preprocessed-comments.json (grouped, filtered)      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 4: Pattern Analysis                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Subagent: pattern-analyzer                                  │
│  Input: preprocessed-comments.json, existing instruction     │
│         files                                                │
│  Process: Identify patterns, compare to existing rules,      │
│           triage (🟢 covered / 🟡 strengthen / 🔴 new)       │
│  Output: patterns.json + triage-report.md                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 5: Interactive Pattern Review                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Main Conversation: User interaction                         │
│  Process: Show each pattern by triage category               │
│           User: approve / modify / skip                      │
│  Output: patterns-approved.json                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 6: Generate Rules                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Subagent: rule-generator                                    │
│  Input: patterns-approved.json, existing instruction files   │
│  Process: For each pattern, create new rule OR strengthen    │
│           existing (with good/bad examples)                  │
│  Output: generated-rules.json + draft-*.md files             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 7: Interactive Wording Review                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Main Conversation: User interaction                         │
│  Process: Show each draft rule with examples                 │
│           User: approve / edit / change target / reject      │
│  Output: approved-rules.json                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 8: Apply Rules                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Main Conversation: File editing + git commit                │
│  Process: For each approved rule:                            │
│           - Read target instruction file                     │
│           - Edit file (insert/strengthen)                    │
│           - Verify changes                                   │
│           Create git commit with summary                     │
│  Output: applied-summary.md + git commit                     │
└──────────────────────────────────────────────────────────────┘
```text

---

## Stage Details

### Stage 1: Stack Analysis

**Purpose**: Identify your project's technology stack and generate "red flag" patterns that should always
be surfaced regardless of frequency.

**When it runs**:

- First time the skill is used
- When `--refresh-stack` flag is provided
- Otherwise skipped (uses cached red-flags.json)

**What it does**:

1. Scans project files:
   - `package.json` / `requirements.txt` / `go.mod` for dependencies
   - Code files for framework usage patterns
   - Configuration files for database/service connections
2. Identifies tech stack components:
   - Backend framework (Express, FastAPI, Spring, etc.)
   - Frontend framework (React, Vue, Angular, etc.)
   - Database (SQLite, PostgreSQL, MongoDB, etc.)
   - Language (TypeScript, Python, Go, Java, etc.)
3. Generates red flags based on stack:
   - **Express + SQLite**: SQL injection, bcrypt sync, hardcoded secrets
   - **React**: dangerouslySetInnerHTML, missing keys, prop-types
   - **Python**: eval(), pickle, SQL string formatting
   - Etc.

**Output**:

```json
{
  "generatedAt": "2025-10-30T14:30:00Z",
  "stack": {
    "backend": "Express.js",
    "frontend": "React",
    "database": "SQLite",
    "language": "TypeScript"
  },
  "redFlags": [
    "SQL injection",
    "hardcoded secret",
    "hardcoded password",
    "bcrypt sync",
    "missing password hash",
    "eval(",
    "innerHTML",
    "dangerouslySetInnerHTML"
  ]
}
```text

**Why it matters**: Red flags are ALWAYS surfaced in pattern analysis, even if they only appear once.
Critical security issues don't need to be frequent to be important.

---

### Stage 2: Fetch PR Comments

**Purpose**: Retrieve ALL review comments from your GitHub repository for the specified date range.

**How repository is detected**:

```bash
git remote get-url origin
# Example: https://github.com/myorg/myrepo.git
# Extracts: myorg/myrepo
```text

**Date range calculation**:

- Start date = today - N days (from command argument)
- End date = today
- Default N = 90 days

**What gets fetched**:

- Pull requests (number, title, author, created date)
- PR review comments (line-specific code review comments)
- PR issue comments (general PR discussion comments)

**Filters applied**:

- **Excluded authors**: dependabot, github-actions, renovate (configurable)
- **Minimum comment length**: 20 characters (configurable)
- **Date range**: Only PRs created within the specified range

**GitHub CLI commands used**:

```bash
# List PRs
gh pr list --repo myorg/myrepo --state all \
  --search "created:>=2025-08-01" \
  --json number,title,author,createdAt,state

# Get PR review comments
gh api repos/myorg/myrepo/pulls/{pr_number}/comments

# Get PR issue comments
gh api repos/myorg/myrepo/issues/{pr_number}/comments
```text

**Output**: 450 comments across 45 PRs saved to `pr-comments.json`

**Important**: At this stage, we fetch EVERYTHING. We don't try to determine if comments are "resolved"
or not - that's unreliable. Instead, we'll use existing rule comparison to identify what's already
covered.

---

### Stage 3: Preprocess & Deduplicate

**Purpose**: Reduce 450 comments to ~20 meaningful groups through intelligent deduplication.

**Why this matters**:

- Sending 450 comments to LLM would use 50k+ tokens
- Many comments are duplicates ("SQL injection here" × 8)
- Preprocessing reduces tokens by 90%

**Three-phase hybrid approach**:

#### Phase 1: Exact Matching (CLI - instant)

```bash
# Simple string comparison
"SQL injection vulnerability" == "SQL injection vulnerability"  ✓
"Missing try-catch" == "Add try-catch block"  ✗
```text

Result: 40 exact duplicates removed → 410 remaining

#### Phase 2: Fuzzy Matching (CLI with simhash - fast)

```bash
# Near-duplicate detection
"SQL injection vulnerability" ≈ "SQL injection risk"  ✓
"SQL injection vulnerability" ≈ "Missing error handling"  ✗
```text

Uses simhash algorithm for fast similarity detection.
Result: 60 near-duplicates grouped → 350 remaining

#### Phase 3: Semantic Grouping (Lightweight LLM - edge cases only)

For remaining ambiguous comments, quick LLM call:

```text
Are these about the same issue?
- "Concatenating user input in query"
- "SQL injection via string building"
Answer: Yes, both about SQL injection
```text

Result: 10 ambiguous cases resolved → 340 remaining

#### Frequency Filtering

- Keep groups with ≥ 3 occurrences (configurable threshold)
- Result: 15 groups kept, 325 individual comments filtered

#### Red Flag Override

- Comments matching red flags ALWAYS kept (even if only 1 occurrence)
- Result: +5 red flag groups

**Final output**: 20 groups representing 120 comments (330 filtered out)

**Token savings**: 50k tokens → 5k tokens (90% reduction)

---

### Stage 4: Pattern Analysis

**Purpose**: Identify patterns from comment groups and triage them against existing Copilot rules.

**Process**:

#### 4.1 Pattern Identification

For each comment group:

- Assign pattern ID and title
- Determine severity (critical / high / medium / low)
- Assign category (security / error-handling / type-safety / etc.)
- Calculate frequency (occurrence count)
- Determine if automatable
- Extract representative examples

#### 4.2 Load Existing Rules

Parse all Copilot instruction files:

- `.github/copilot-instructions.md` (repository-level)
- `backend/backend.instructions.md` (backend-specific)
- `frontend/frontend.instructions.md` (frontend-specific)
- `.vscode/rules/*.md` (VS Code rules)

Extract existing rules:

- Rule titles
- Rule content
- Code examples
- Coverage scope

#### 4.3 Triage Patterns

For each pattern, compare against existing rules:

**🟢 Already Covered**:

- Existing rule clearly addresses this pattern
- Rule has good examples and clear directives
- Frequency is within expected ~30% Copilot non-adherence rate
- **Decision**: No action needed (rule is working)
- **Rationale**: "4 occurrences over 90 days is normal for a well-defined rule"

**🟡 Needs Strengthening**:

- Existing rule addresses the general area
- BUT: High frequency suggests rule is insufficient
- Pattern reveals specific gap (e.g., missing LIKE query examples)
- **Decision**: Enhance existing rule with additional examples/directives
- **Rationale**: "8 occurrences suggest rule needs more specificity"

**🔴 New Rule Needed**:

- No existing rule addresses this pattern
- Completely new coverage area
- **Decision**: Create new rule
- **Rationale**: "No existing rule for rate limiting on auth endpoints"

**Output**:

- 4 patterns already covered (skip)
- 3 patterns need strengthening
- 5 patterns need new rules
- Total: 12 patterns with triage decisions

---

### Stage 5: Interactive Pattern Review

**Purpose**: User reviews triage decisions and approves patterns for rule generation.

**Progressive disclosure by category**:

#### 5.1 Already Covered Patterns (🟢)

Show:

- Pattern details (frequency, severity, examples)
- Existing rule location and content
- Analysis: "Within expected adherence rate"

User options:

- **Skip** - Agree, rule is working fine
- **Strengthen anyway** - Add more examples despite normal frequency
- **View rule** - Read full existing rule content before deciding

Why show these? User might disagree with analysis or want extra reinforcement.

#### 5.2 Needs Strengthening (🟡)

Show:

- Pattern details with HIGH frequency
- Existing rule content
- Identified weakness (e.g., "lacks LIKE query examples")
- Suggested enhancement
- Examples from PR comments

User options:

- **Strengthen as suggested** - Apply the enhancement
- **Strengthen differently** - Provide custom feedback
- **Actually fine** - Disagree with analysis, skip
- **Create new instead** - Make separate rule rather than modifying
- **View rule** - Read full existing rule first

#### 5.3 New Rule Needed (🔴)

Show:

- Pattern details
- Gap analysis (no existing coverage)
- Suggested approach
- Target file and section
- Examples from PR comments

User options:

- **Create as suggested** - Proceed with generation
- **Modify approach** - Provide custom guidance
- **Already covered** - Point to existing rule that was missed
- **Skip** - Not worth codifying

**Flexible feedback handling**:

```text
User: "Actually for SQL injection, also add examples for
       IN clauses with arrays, not just LIKE queries"

System: ✓ Updated pattern suggestedAction
        ✓ Added to enhancement: "IN clauses with arrays"
```text

**Output**: `patterns-approved.json` with 8 patterns (4 skipped, 8 approved)

---

### Stage 6: Generate Rules

**Purpose**: Convert approved patterns into well-formatted Copilot instruction rules.

**Two generation modes**:

#### 6.1 Create New Rule

Input: Pattern with action="create"

Generate:

```markdown
## Rate Limiting for Authentication Endpoints

- ALWAYS implement rate limiting on authentication endpoints
- Use a limit of 5 attempts per 15 minutes for login/signup/password-reset
- Return 429 Too Many Requests when limit exceeded

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
```text

Metadata:

- Target file: `backend/backend.instructions.md`
- Section: "Security Requirements" or "Authentication"
- Placement: "After existing auth rules" or "Create new section"

Output: `draft-backend-NEW-rate-limiting.md`

#### 6.2 Strengthen Existing Rule

Input: Pattern with action="strengthen"

Generate:

```markdown
# STRENGTHEN: SQL Injection Prevention (backend)

## Current Rule Location
File: backend/backend.instructions.md
Section: Database Operations

## Current Content
[Shows existing rule with basic SELECT examples]

## Proposed Enhancement
Add the following examples after existing content:

### LIKE Queries with Wildcards

❌ BAD:
\`\`\`typescript
const search = `SELECT * FROM tasks WHERE title LIKE '%${term}%'`;
\`\`\`

✅ GOOD:
\`\`\`typescript
const search = `SELECT * FROM tasks WHERE title LIKE ?`;
db.query(search, [`%${term}%`]);
\`\`\`

### IN Clauses with Arrays

❌ BAD:
\`\`\`typescript
const ids = [1, 2, 3];
const query = `SELECT * FROM users WHERE id IN (${ids.join(',')})`;
\`\`\`

✅ GOOD:
\`\`\`typescript
const ids = [1, 2, 3];
const placeholders = ids.map(() => '?').join(',');
const query = `SELECT * FROM users WHERE id IN (${placeholders})`;
db.query(query, ids);
\`\`\`

## Rationale
8 PR comments specifically mentioned LIKE queries and IN clauses,
suggesting developers don't realize these are also vulnerable.
```text

Output: `draft-backend-STRENGTHEN-sql-injection.md`

**Summary**: 8 draft files created (3 strengthen, 5 new)

---

### Stage 7: Interactive Wording Review

**Purpose**: User reviews and approves the actual rule content (wording, examples, target).

For each draft rule:

**Show**:

- Complete markdown content
- Good/bad code examples
- Target file and section
- Rationale

**User options**:

- ✅ **Approve** - Apply as-is
- ✏️ **Edit** - Modify wording, examples, or directives (inline editing)
- 📂 **Change target** - Move to different file/section
- ❌ **Reject** - Don't apply this rule

**Example interaction**:

```text
Rule 3 of 8: STRENGTHEN SQL Injection Prevention

Target: backend/backend.instructions.md (Database Operations)

[Shows complete markdown with examples]

Options:
A) Approve as-is
B) Edit wording
C) Change target file/section
D) Reject

Your choice: B

[Shows editable content]

Edit the content below:
```markdown
### LIKE Queries with Wildcards
...
```text

[User modifies, saves]

✓ Changes saved

```text

**Output**: `approved-rules.json` (6 approved, 2 rejected)

---

### Stage 8: Apply Rules

**Purpose**: Actually edit the Copilot instruction files and create a git commit.

**For each approved rule**:

#### 8.1 Read Target File
```typescript
const content = await Read('backend/backend.instructions.md');
```text

#### 8.2 Find Insertion Point

- **For NEW rules**: Find section or create it
- **For STRENGTHEN**: Find existing rule by title/content

#### 8.3 Edit File

```typescript
// For NEW: Insert at section end
await Edit({
  file: 'backend/backend.instructions.md',
  old_string: '## Database Operations\n\n[existing content]\n\n## Next Section',
  new_string: '## Database Operations\n\n[existing content]\n\n[NEW RULE CONTENT]\n\n## Next Section'
});

// For STRENGTHEN: Add after existing rule
await Edit({
  file: 'backend/backend.instructions.md',
  old_string: '[existing rule content]\n\n## Next Rule',
  new_string: '[existing rule content]\n\n[ENHANCEMENT]\n\n## Next Rule'
});
```text

#### 8.4 Verify

- Read file again
- Confirm changes applied correctly

#### 8.5 Create Git Commit

```bash
git add backend/backend.instructions.md \
        frontend/frontend.instructions.md \
        .github/copilot-instructions.md

git commit -m "$(cat <<'EOF'
feat: codify PR review patterns from 90-day analysis

Applied 6 rules from PR history analysis (2025-08-01 to 2025-10-30):

Strengthened existing rules (2):
- SQL Injection Prevention: Added LIKE query and IN clause examples
- Bcrypt Usage: Added async method examples

Created new rules (4):
- Rate Limiting for Authentication Endpoints (backend)
- Password Salt Rounds Minimum (vscode-security)
- React Key Props in Lists (frontend)
- Environment Variable Validation (repository)

Analysis summary:
- 450 comments analyzed across 45 PRs
- 12 patterns identified
- 8 patterns approved, 6 applied

Run: 2025-10-30_143022

🤖 Generated with codify-pr-reviews skill
EOF
)"
```text

**Final summary**:

```text
✓ Rules Applied Successfully

Files Modified (3):
- backend/backend.instructions.md (2 rules)
- frontend/frontend.instructions.md (2 rules)
- .github/copilot-instructions.md (1 rule)
- .vscode/rules/security-patterns.md (1 rule)

Git Commit: abc123def

Applied rules summary:
.workspace/codify-pr-history/runs/2025-10-30_143022/06-apply/applied-summary.md
```text

---

## Data Flow Summary

```text
GitHub (via gh CLI)
   ↓ 450 comments (~50k tokens)
pr-comments.json
   ↓ deduplicate (~90% reduction)
preprocessed-comments.json (20 groups, ~5k tokens)
   ↓ analyze + triage
patterns.json (12 patterns, ~2k tokens)
   ↓ user review
patterns-approved.json (8 patterns)
   ↓ generate rules
draft-*.md (8 files)
   ↓ user review
approved-rules.json (6 rules)
   ↓ apply
copilot-instructions.md files (modified)
```text

**Token efficiency**: 50k → 2k tokens in main conversation (96% reduction through subagent isolation)

---

## Decision Points

Throughout the workflow, the user makes decisions at two key stages:

### Stage 5: Pattern-Level Decisions

- Which patterns should become rules?
- Should existing rules be strengthened or left alone?
- Are triage decisions correct?

### Stage 7: Rule-Level Decisions

- Is the rule wording clear and actionable?
- Are the examples appropriate for the codebase?
- Is the target file correct?

**Why two stages?**

- Stage 5: High-level strategy (what to fix)
- Stage 7: Tactical execution (how to fix)
- Separation allows refinement without re-analyzing patterns

---

## Incremental Runs

After first run, subsequent runs are faster:

**First run** (90 days):

- Stack analysis: 30 seconds
- Fetch: 2 minutes (45 PRs)
- Preprocess: 1 minute
- Analyze: 1 minute
- Total: ~5-10 minutes (+ user interaction time)

**Later run** (30 days):

- Stack analysis: SKIPPED (cached)
- Fetch: 30 seconds (15 PRs)
- Preprocess: 20 seconds
- Analyze: 30 seconds
- Total: ~2-3 minutes (+ user interaction time)

**Pattern evolution tracking**:

```json
{
  "patterns": {
    "sql-injection": {
      "firstSeen": "2025-09-30",
      "occurrences": [
        {"date": "2025-09-30", "count": 12, "action": "none"},
        {"date": "2025-10-15", "count": 8, "action": "strengthened"},
        {"date": "2025-10-30", "count": 2, "action": "none"}
      ],
      "trend": "improving"
    }
  }
}
```text

Shows that strengthening the rule reduced occurrences from 12 → 8 → 2 over time.

---

## See Also

- [stack-analysis-guide.md](stack-analysis-guide.md) - Tech stack detection details
- [fetching-guide.md](fetching-guide.md) - GitHub CLI integration
- [preprocessing-guide.md](preprocessing-guide.md) - Deduplication techniques
- [pattern-analysis-guide.md](pattern-analysis-guide.md) - Triage logic
- [rule-generation-guide.md](rule-generation-guide.md) - Rule creation
- [interactive-review-guide.md](interactive-review-guide.md) - Approval workflow
- [troubleshooting.md](troubleshooting.md) - Common issues
