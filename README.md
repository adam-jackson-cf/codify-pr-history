# Codify PR History - Claude Code Plugin

> Transform your GitHub PR review history into automated GitHub Copilot instructions

A production-ready Claude Code plugin that analyzes your pull request review comments, identifies recurring patterns, and generates GitHub Copilot custom instructions to catch those issues automatically in future code.

## Installation

### Via Claude Code Plugin System

```bash
# Install the plugin
/plugin install codify-pr-history

# Verify installation
/help
# You should see /codify-pr-history in the list of available commands
```

### Manual Installation

1. Clone this repository
2. Copy the `codify-pr-history/` directory to your Claude Code plugins location
3. Reload Claude Code to activate the plugin

## How It Works: The Codification Process

The plugin transforms manual code review feedback into automated rules through an 8-stage workflow:

### Stage 1: Stack Analysis (First Run Only)

The plugin detects your project's technology stack and generates "red flag" security patterns:

```bash
/codify-pr-history
```

**Example output:**
```
Analyzing project stack...
✓ Detected: Express.js + React + TypeScript + SQLite
✓ Generated 15 red flag patterns (SQL injection, hardcoded secrets, etc.)
```

### Stage 2: Fetch PR Comments

Using the GitHub CLI (`gh`), the plugin fetches all PR review comments from your specified timeframe:

```bash
/codify-pr-history 90  # Last 90 days (default)
/codify-pr-history 30  # Last 30 days
```

**What gets fetched:**
- Line-specific review comments
- General PR discussion comments
- Filtered to exclude bots (dependabot, vercel, changeset-bot)
- Only substantive comments (≥20 characters)

### Stage 3: Hybrid Deduplication

Comments are deduplicated using a three-phase approach:

1. **Exact matching** (CLI) - Groups identical text
2. **Fuzzy matching** (CLI) - Groups near-duplicates ("Missing try-catch" ≈ "No try catch block")
3. **Semantic grouping** (LLM) - Resolves edge cases where phrasing differs but meaning is the same

**Result:** 450 comments → 20 pattern groups (80% reduction)

### Stage 4: Pattern Analysis & Triage

Each pattern group is compared against your existing Copilot instruction files and triaged into three categories:

- 🟢 **Already Covered** - Existing rule is adequate, low frequency
- 🟡 **Needs Strengthening** - Rule exists but high frequency indicates gaps
- 🔴 **New Rule Needed** - No existing rule addresses this pattern

**Intelligence:** If SQL injection appears 5 times despite having a rule, it's flagged as "needs strengthening" - the rule clearly isn't detailed enough.

### Stage 5: Interactive Pattern Review

You review each pattern and decide:
- Approve (generate rule)
- Modify (adjust categorization or severity)
- Skip (not worth automating)

### Stage 6: Rule Generation

For approved patterns, the plugin generates:

**For new rules:**
- Title and description
- Bad example (anti-pattern)
- Good example (correct implementation)
- Severity level
- Target file (backend.instructions.md, frontend.instructions.md, etc.)

**For strengthening existing rules:**
- Additional examples covering edge cases
- Enhanced directives
- Preserves existing content (additive only)

### Stage 7: Wording Review

Review the generated markdown content for each rule:
- Approve as-is
- Edit the content
- Reject and skip

### Stage 8: Application

Approved rules are:
1. Applied to your Copilot instruction files
2. Committed to git with descriptive message
3. Tracked in `.workspace/codify-pr-history/` for historical analysis

## Demo Workflow: Using copilot-review-demo

The `copilot-review-demo/` project provides a complete demonstration of the codification process in action.

### The Demo Project Structure

The demo contains **intentional bad examples** for teaching purposes:

```
copilot-review-demo/
├── backend/
│   └── src/
│       ├── good-examples/    # Proper implementations
│       └── bad-examples/     # Intentional vulnerabilities
│           ├── authService.bad.ts       (SQL injection, hardcoded secrets)
│           ├── taskService.bad.ts       (Missing validation, no error handling)
│           └── userController.bad.ts    (Weak bcrypt, missing auth checks)
└── frontend/
    └── src/
        ├── good-examples/    # Best practices
        └── bad-examples/     # Intentional anti-patterns
            ├── LoginForm.bad.tsx        (Missing validation, accessibility)
            ├── TaskList.bad.tsx         (Missing keys, inline handlers)
            └── useAuth.bad.ts           (TypeScript 'any', no error handling)
```

### Complete Demonstration Workflow

#### Step 1: Create PRs with Intentional Issues

1. **Create a branch with bad code:**

   ```bash
   cd copilot-review-demo
   git checkout -b demo/introduce-issues

   # Copy bad examples to main code paths (intentionally introduce issues)
   cp backend/src/bad-examples/authService.bad.ts backend/src/authService.ts
   cp backend/src/bad-examples/taskService.bad.ts backend/src/taskService.ts

   git add .
   git commit -m "feat: add authentication and task management (with intentional issues for demo)"
   git push origin demo/introduce-issues
   ```

2. **Create PR on GitHub:**

   ```bash
   gh pr create --title "Add authentication and task services" \
                --body "Implements user auth and task CRUD operations"
   ```

#### Step 2: Add Review Comments Flagging Issues

Manually review the PR (or have a team member review) and leave comments on the intentional issues:

**Example comments to leave:**

On `authService.ts` line 12 (hardcoded JWT secret):
> 🔴 CRITICAL: JWT secret is hardcoded. This should be in an environment variable.

On `authService.ts` line 28 (SQL injection):
> 🔴 CRITICAL: SQL injection vulnerability. User input is concatenated directly into the query. Use parameterized queries.

On `authService.ts` line 34 (blocking bcrypt):
> Using `bcrypt.hashSync` blocks the event loop. Use the async version `bcrypt.hash` instead.

On `authService.ts` line 45 (missing try-catch):
> Missing try-catch block around this async operation. If it fails, the server will crash.

On `taskService.ts` line 15 (TypeScript any):
> Using `any` type defeats TypeScript's purpose. Define a proper interface for task data.

On `LoginForm.tsx` line 23 (missing accessibility):
> This input is missing an associated label. Add a `<label>` element for accessibility.

On `TaskList.tsx` line 8 (missing React keys):
> Missing `key` prop in list rendering. This causes React performance issues.

#### Step 3: Repeat for More PRs

Create 2-3 more PRs with similar issues to establish patterns:

```bash
# PR 2: Frontend components with accessibility issues
git checkout -b demo/add-frontend
cp frontend/src/bad-examples/components/LoginForm.bad.tsx frontend/src/components/LoginForm.tsx
# ... add review comments

# PR 3: More backend issues (validation, error handling)
git checkout -b demo/add-validation
cp backend/src/bad-examples/userController.bad.ts backend/src/controllers/userController.ts
# ... add review comments
```

**Important:** Leave similar comments across multiple PRs to create patterns:
- SQL injection comments on 3-5 different files
- Missing try-catch comments on 4-6 locations
- TypeScript `any` comments on 4 different places
- Accessibility issues on 2-3 components

#### Step 4: Run the Codify Plugin

After creating PRs and review comments, run the plugin:

```bash
cd copilot-review-demo  # Run from within the demo project
/codify-pr-history 30    # Analyze last 30 days
```

#### Step 5: Observe Pattern Detection

The plugin will analyze your review comments and show results like:

```
Pattern Analysis Complete:

🟢 Already Covered (2 patterns)
   - Hardcoded secrets (2 occurrences)
     Existing rule in .github/copilot-instructions.md is clear and prominent

🟡 Needs Strengthening (4 patterns)
   - SQL injection vulnerability (5 occurrences) ⚠️
     Existing rule lacks examples for LIKE queries, IN clauses
     RATIONALE: High frequency despite existing rule indicates insufficient detail

   - Missing try-catch blocks (6 occurrences)
     Existing rule is too generic, lacks context-specific examples

   - TypeScript 'any' type (4 occurrences)
     Frontend rule exists but backend lacks explicit prohibition

   - Missing accessibility attributes (3 occurrences)
     Rule exists but lacks concrete before/after examples

🔴 New Rules Needed (2 patterns)
   - Missing React keys in list rendering (3 occurrences)
     No existing rule addresses this React-specific pattern

   - bcrypt synchronous methods (2 occurrences)
     Mentioned in passing but needs dedicated section with rationale
```

#### Step 6: Review and Approve

The plugin will guide you through each pattern:

```
Pattern 3 of 8: SQL Injection via String Concatenation

Triage: 🟡 NEEDS STRENGTHENING
Frequency: 5 occurrences across 3 PRs
Severity: Critical

Existing Rule: backend/backend.instructions.md
- "Use parameterized queries with ? placeholders"
- Has basic SELECT examples

Issue: Comments mention LIKE queries (2x) and IN clauses (1x)
Current rule only shows simple SELECT statements

Suggested Enhancement:
Add examples for LIKE queries, IN clauses, dynamic WHERE conditions

What would you like to do?
A) Strengthen as suggested
B) Strengthen with different approach
C) Skip - rule is actually fine
D) View existing rule content

Your choice: A
```

#### Step 7: Apply Generated Rules

The plugin generates enhanced rules:

**Example: Enhanced SQL Injection Rule**

```markdown
## SQL Injection Prevention (CRITICAL)

- ALWAYS use parameterized queries or prepared statements
- NEVER concatenate user input directly into SQL query strings
- Use `?` placeholders for all dynamic values

### Common Patterns

**Basic SELECT:**
❌ BAD:
\```typescript
db.all(`SELECT * FROM tasks WHERE user_id = ${userId}`, callback);
\```

✅ GOOD:
\```typescript
db.all('SELECT * FROM tasks WHERE user_id = ?', [userId], callback);
\```

**LIKE Queries:**
❌ BAD:
\```typescript
db.all(`SELECT * FROM tasks WHERE title LIKE '%${searchTerm}%'`, callback);
\```

✅ GOOD:
\```typescript
db.all('SELECT * FROM tasks WHERE title LIKE ?', [`%${searchTerm}%`], callback);
\```

**IN Clauses:**
❌ BAD:
\```typescript
const ids = userIds.join(',');
db.all(`SELECT * FROM tasks WHERE id IN (${ids})`, callback);
\```

✅ GOOD:
\```typescript
const placeholders = userIds.map(() => '?').join(',');
db.all(`SELECT * FROM tasks WHERE id IN (${placeholders})`, userIds, callback);
\```
```

These rules are then applied to `backend/backend.instructions.md` and committed.

#### Step 8: Verify the Results

After applying rules:

1. **Check the updated instruction files:**
   ```bash
   git diff backend/backend.instructions.md
   git diff frontend/frontend.instructions.md
   ```

2. **Test GitHub Copilot with the new rules:**
   - Open a new file
   - Start writing code with the same bad patterns
   - Copilot should now suggest the correct patterns
   - Chat review should catch the issues automatically

3. **Create a new "good" PR:**
   - Fix the bad code using the good examples
   - Ask Copilot to review: it should now reference your custom instructions
   - The review comments should be significantly reduced

### Expected Outcome

After completing this workflow, you'll have:

1. ✅ **Strengthened existing rules** with concrete examples from your actual code review history
2. ✅ **New rules** for patterns that weren't previously documented
3. ✅ **Automated detection** - Future PRs will catch these issues via Copilot
4. ✅ **Historical tracking** - `.workspace/codify-pr-history/runs/` shows pattern evolution
5. ✅ **Evidence of effectiveness** - Run the plugin again after 30 days to see if pattern frequency decreases

## Architecture

### Multi-Agent System for Context Isolation

The plugin uses **5 specialized subagents** that run in isolated contexts:

1. **stack-analyzer** - Detects tech stack, generates red flags
2. **pr-comment-fetcher** - Fetches PR comments via gh CLI
3. **comment-preprocessor** - Hybrid deduplication (CLI + LLM)
4. **pattern-analyzer** - Triages patterns vs existing rules
5. **rule-generator** - Generates markdown rules with examples

**Why subagents?** Processing 450+ PR comments would overflow the main context (~200k tokens). Subagents handle raw data in isolation and return only summaries (~2k tokens) to the main conversation.

**Token Efficiency**: 50k → 2k tokens in main conversation (96% reduction through subagent isolation)

### Data Organization

All plugin data stored in `.workspace/codify-pr-history/`:

```
.workspace/codify-pr-history/
├── config/red-flags.json                    # Persistent stack analysis
├── runs/YYYY-MM-DD_HHMMSS/                  # Timestamped runs
│   ├── 01-fetch/pr-comments.json
│   ├── 02-preprocess/preprocessed-comments.json
│   ├── 03-analyze/patterns.json
│   ├── 04-approve/patterns-approved.json
│   ├── 05-generate/drafts/*.md
│   └── 06-apply/applied-summary.md
└── history/
    ├── runs-index.json
    └── patterns-over-time.json
```

## Requirements

- **Claude Code** (latest version)
- **GitHub CLI** (`gh`) installed and authenticated:
  ```bash
  brew install gh  # macOS
  gh auth login
  ```
- **Git repository** with PR history
- **GitHub Copilot** with custom instructions enabled

## Key Features

- 🎯 **Smart Triage** - Distinguishes between adequate rules, rules needing strengthening, and missing rules
- 🔍 **Hybrid Deduplication** - Combines CLI tools + LLM for efficient grouping
- 🧠 **Context Isolation** - Processes large datasets without overflow
- 📊 **Progressive Disclosure** - Shows only relevant information at each stage
- 🕐 **Timestamped Runs** - Preserves history for tracking pattern evolution
- 🔴 **Red Flag Detection** - Always surfaces critical security issues
- 📈 **Pattern Evolution** - Measure effectiveness by tracking pattern frequency over time

## Repository Contents

- **codify-pr-history/** - Production Claude Code plugin
  - 1 skill (orchestrator)
  - 5 subagents (isolated processors)
  - 1 slash command
  - 7 resource guides
  - 4 LLM prompts
- **copilot-review-demo/** - Full-stack demo application
  - Backend: Express + TypeScript + SQLite
  - Frontend: React + TypeScript + Vite
  - Intentional bad examples for teaching
- **Research documentation** - Copilot code review analysis

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - Guidance for Claude Code instances working in this repository
- **[codify-pr-history/README.md](codify-pr-history/README.md)** - Plugin technical documentation
- **[.claude/plan.md](.claude/plan.md)** - Implementation plan and status
- **[copilot-review-demo/TUTORIAL.md](copilot-review-demo/TUTORIAL.md)** - Hands-on exercises

## Testing

Comprehensive test results available in `.workspace/codify-pr-history/test/TESTING_RESULTS.md`:

- ✅ 6/6 components tested (100% coverage)
- ✅ Unit tests with example data
- ✅ Integration tests with real GitHub PR data (29 comments from t3-oss/create-t3-app)
- ✅ All markdown linting passed (95+ issues fixed)

## Contributing

Contributions welcome! This plugin demonstrates:
- Advanced multi-agent architecture
- Context isolation patterns
- Progressive disclosure techniques
- Hybrid CLI + LLM workflows

## License

MIT License - See [LICENSE](codify-pr-history/LICENSE)

## Credits

Built with [Claude Code](https://claude.com/claude-code) by Anthropic.

---

**Ready to transform your code review history into automation?**

```bash
/codify-pr-history
```
