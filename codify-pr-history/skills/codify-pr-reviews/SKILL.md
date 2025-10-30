---
name: codify-pr-reviews
description: Analyze GitHub PR review history to identify patterns and generate Copilot instruction rules
version: 1.0.0
allowed-tools:
  - Task
  - AskUserQuestion
  - Read
  - Edit
  - Bash
---

# Codify PR Reviews Skill

## What This Skill Does

Transforms PR review comment history into automated GitHub Copilot instructions by:

1. Analyzing your project stack to identify critical patterns (red flags)
2. Fetching and preprocessing PR comments from GitHub
3. Identifying recurring review patterns
4. Comparing patterns against existing Copilot rules
5. Triaging into: already covered, needs strengthening, or new rule needed
6. Generating new rules or strengthening existing ones with examples
7. Applying approved rules to instruction files

**When to use**: When you want to reduce repetitive PR review comments by codifying them into automated checks.

---

## Quick Start

**Typical usage** (run from project root):

```bash
/codify-pr-history            # Last 90 days (default)
/codify-pr-history 30         # Last 30 days
/codify-pr-history 180 --refresh-stack  # 180 days + refresh stack
```text

**First time**: The skill automatically analyzes your project stack and guides you through the complete workflow.

**Requirements**:

- `gh` CLI installed and authenticated
- Git repository with PR history
- GitHub Copilot instruction files (or will guide creation)

---

## Need to...? Read This

| Your Goal | Resource File |
|-----------|---------------|
| Understand the complete workflow | [workflow-overview.md](resources/workflow-overview.md) |
| Learn about stack analysis | [stack-analysis-guide.md](resources/stack-analysis-guide.md) |
| Understand PR comment fetching | [fetching-guide.md](resources/fetching-guide.md) |
| See how deduplication works | [preprocessing-guide.md](resources/preprocessing-guide.md) |
| Learn pattern categorization logic | [pattern-analysis-guide.md](resources/pattern-analysis-guide.md) |
| Understand rule generation | [rule-generation-guide.md](resources/rule-generation-guide.md) |
| Navigate the approval workflow | [interactive-review-guide.md](resources/interactive-review-guide.md) |
| Troubleshoot issues | [troubleshooting.md](resources/troubleshooting.md) |

---

## Workflow Overview (Summary)

```text
1. Stack Analysis (first run / --refresh-stack)
   → Detect tech stack, generate red flags

2. Fetch PR Comments (all comments from N days)
   → Uses gh CLI, filters by author/length

3. Preprocess & Deduplicate (hybrid CLI + LLM)
   → 450 comments → 20 groups (90% reduction)

4. Pattern Analysis (compare to existing rules)
   → Triage: 🟢 already covered / 🟡 strengthen / 🔴 new

5. Interactive Review (approve patterns)
   → Show each pattern, user approves/modifies/skips

6. Generate Rules (create/strengthen)
   → Draft markdown rules with examples

7. Interactive Approval (approve wording)
   → Review and edit each rule

8. Apply Rules (edit instruction files + commit)
   → Updates files, creates git commit
```text

For detailed workflow explanation, see [workflow-overview.md](resources/workflow-overview.md).

---

## Orchestration Logic

### Stage 1: Initial Setup

**Check for first run:**

- Look for `.workspace/codify-pr-history/config/red-flags.json`
- If missing OR `--refresh-stack` flag: invoke `stack-analyzer` subagent
- Otherwise: skip to Stage 2

**Stack analysis process:**

1. Scan project files (package.json, dependencies, code)
2. Identify tech stack (backend/frontend frameworks, database, language)
3. Generate red flag patterns (SQL injection, hardcoded secrets, etc.)
4. Save to red-flags.json

**Output to main conversation:**

```text
Stack Analysis Complete:
- Detected: Express.js + React + TypeScript + SQLite
- Generated 12 red flag patterns
- Saved to: .workspace/codify-pr-history/config/red-flags.json
```text

See [stack-analysis-guide.md](resources/stack-analysis-guide.md) for details.

---

### Stage 2: Fetch Comments

**Auto-detect repository:**

```bash
git remote get-url origin  # Extract owner/repo
```text

**Calculate date range:**

- Days back from command argument (default: 90)
- Start date = today - N days
- End date = today

**Invoke `pr-comment-fetcher` subagent** with:

```json
{
  "repo": "auto-detected",
  "daysBack": 90,
  "excludeAuthors": ["dependabot", "github-actions", "renovate"],
  "minCommentLength": 20,
  "outputPath": ".workspace/codify-pr-history/runs/YYYY-MM-DD_HHMMSS/01-fetch/pr-comments.json",
  "runId": "2025-10-30_143022"
}
```text

**Subagent returns summary only:**

```text
Fetched 45 PRs from last 90 days
- Total comments: 450
- Date range: 2025-08-01 to 2025-10-30
- Saved to: 01-fetch/pr-comments.json
```text

**No heavy data in main conversation** - all comments saved to file.

See [fetching-guide.md](resources/fetching-guide.md) for details.

---

### Stage 3: Preprocess Comments

**Invoke `comment-preprocessor` subagent** with:

```json
{
  "inputPath": ".../01-fetch/pr-comments.json",
  "redFlagsPath": ".workspace/codify-pr-history/config/red-flags.json",
  "minOccurrences": 3,
  "semanticThreshold": 0.85,
  "outputPath": ".../02-preprocess/preprocessed-comments.json"
}
```text

**Hybrid deduplication process:**

1. **Phase 1: Exact matching** (CLI - instant) → 40 duplicates removed
2. **Phase 2: Fuzzy matching** (simhash - fast) → 60 near-duplicates grouped
3. **Phase 3: Semantic grouping** (lightweight LLM - edge cases) → 10 ambiguous resolved

**Red flag override**: Comments matching red flags ALWAYS included regardless of frequency.

**Subagent returns summary:**

```text
Preprocessing Complete (Hybrid CLI + LLM):
- 450 comments → 20 groups
- Phases: 40 exact, 60 fuzzy, 10 semantic
- Kept: 15 frequency-based + 5 red flags
- Filtered: 330 comments (73%)
```text

See [preprocessing-guide.md](resources/preprocessing-guide.md) for details.

---

### Stage 4: Pattern Analysis

**Invoke `pattern-analyzer` subagent** with:

```json
{
  "preprocessedCommentsPath": ".../02-preprocess/preprocessed-comments.json",
  "existingInstructionFiles": {
    "repository": "../copilot-review-demo/.github/copilot-instructions.md",
    "backend": "../copilot-review-demo/backend/backend.instructions.md",
    "frontend": "../copilot-review-demo/frontend/frontend.instructions.md"
  },
  "categories": ["security", "error-handling", "type-safety", ...],
  "promptPath": "prompts/pattern-analysis.md",
  "outputPath": ".../03-analyze/patterns.json"
}
```text

**Analysis process:**

1. Load preprocessed comment groups
2. Identify patterns (title, severity, category, frequency)
3. Load and parse existing Copilot instruction files
4. **Triage each pattern:**
   - 🟢 **Already Covered** - existing rule adequate, ~30% non-adherence expected
   - 🟡 **Needs Strengthening** - rule exists but insufficient (high frequency)
   - 🔴 **New Rule Needed** - no existing rule for this pattern
5. Generate rationale for each triage decision

**Subagent returns summary:**

```text
Pattern Analysis Complete:
12 patterns identified and triaged

🟢 Already Covered (4):
   1. Missing Try-Catch (4 occurrences) - within expected rate
   2. TypeScript 'any' Usage (3) - rule comprehensive
   ...

🟡 Needs Strengthening (3):
   5. SQL Injection (8) - lacks LIKE query examples
   6. Bcrypt Sync Methods (4) - missing async examples
   ...

🔴 New Rules Needed (5):
   8. Rate Limiting for Auth (3 occurrences)
   9. Password Salt Rounds (3)
   ...
```text

See [pattern-analysis-guide.md](resources/pattern-analysis-guide.md) for details.

---

### Stage 5: Interactive Pattern Review

**Progressive disclosure of patterns by category:**

#### For "Already Covered" (🟢) patterns

Show pattern info:

- Frequency, severity, category
- Existing rule location and content
- Rationale: "Within expected ~30% Copilot non-adherence rate"
- PR comment examples

**Options via AskUserQuestion:**

- A) Agree - skip (rule is working)
- B) Strengthen anyway (add more examples)
- C) View existing rule content

#### For "Needs Strengthening" (🟡) patterns

Show pattern info:

- Frequency (high), severity, category
- Existing rule location and content
- Analysis of weakness (e.g., "lacks LIKE query examples")
- Suggested enhancement
- PR comment examples

**Options:**

- A) Strengthen as suggested
- B) Strengthen with different approach (provide feedback)
- C) Actually already fine - skip
- D) Create new separate rule instead
- E) View existing rule content

#### For "New Rule" (🔴) patterns

Show pattern info:

- Frequency, severity, category
- Gap analysis (no existing rule)
- Suggested rule approach
- Target file and section
- PR comment examples

**Options:**

- A) Create new rule as suggested
- B) Create with modifications (provide feedback)
- C) Actually already covered (point to existing rule)
- D) Skip - not worth codifying

**Flexible feedback handling:**

- Accept freeform user input
- Fold into pattern format
- Update suggested action
- Continue to next pattern

**Save approved patterns** to `.../04-approve/patterns-approved.json`

See [interactive-review-guide.md](resources/interactive-review-guide.md) for details.

---

### Stage 6: Generate Rules

**Invoke `rule-generator` subagent** with:

```json
{
  "patternsPath": ".../04-approve/patterns-approved.json",
  "instructionFiles": { ... },
  "promptPath": "prompts/rule-generation.md",
  "outputDir": ".../05-generate/drafts/"
}
```text

**For each approved pattern:**

**If action = "create":**

- Generate new rule from scratch
- Format: title, directives (positive), bad/good examples
- Determine target file (backend/frontend/repository/vscode-*)
- Suggest section placement
- Output: `draft-backend-NEW-rate-limiting.md`

**If action = "strengthen":**

- Load existing rule content
- Generate enhancement (additional examples, edge cases)
- Preserve existing content structure
- Show what to add/modify
- Output: `draft-backend-STRENGTHEN-sql-injection.md`

**Subagent returns summary:**

```text
Rule Generation Complete:
- 8 rules generated from 8 approved patterns
- Distribution: backend (3), repository (2), frontend (2), vscode-security (1)
- Drafts saved to: .../05-generate/drafts/
```text

See [rule-generation-guide.md](resources/rule-generation-guide.md) for details.

---

### Stage 7: Interactive Rule Wording Review

**For each generated rule, present:**

**Show:**

- Pattern context (frequency, severity, examples)
- Rule content (markdown with formatting)
- Target file and section
- Good/bad code examples

**For STRENGTHEN rules, show:**

- Existing rule content
- Proposed enhancement (what will be added)
- Rationale

**Options via AskUserQuestion:**

- ✅ Approve as-is
- ✏️ Edit wording (show editable markdown content)
- 📂 Change target file/section
- ❌ Reject

**Track decisions** in `.../06-apply/approved-rules.json`

---

### Stage 8: Apply Rules

**For each approved rule:**

1. **Read target instruction file** (e.g., `backend/backend.instructions.md`)
2. **Find insertion point:**
   - If STRENGTHEN: locate existing rule section
   - If NEW: find appropriate section or create one
3. **Use Edit tool** to insert/modify content:
   - For STRENGTHEN: add examples after existing content
   - For NEW: insert complete rule at section end
4. **Verify change** successful

**Create git commit:**

```bash
git add .github/copilot-instructions.md backend/backend.instructions.md frontend/frontend.instructions.md

git commit -m "$(cat <<'EOF'
feat: codify PR review patterns from 90-day analysis

Applied 6 rules from PR history analysis (2025-08-01 to 2025-10-30):
- Strengthened 2 existing rules (SQL injection, bcrypt usage)
- Created 4 new rules (rate limiting, React keys, etc.)
- Analyzed 450 comments across 45 PRs
- 12 patterns identified, 8 approved

Run: 2025-10-30_143022

🤖 Generated with codify-pr-reviews skill
EOF
)"
```text

**Show final summary:**

```text
Rules Applied Successfully:

Files Modified (3):
- backend/backend.instructions.md (2 rules: 1 strengthened, 1 new)
- repository/.github/copilot-instructions.md (1 new rule)
- frontend/frontend.instructions.md (3 new rules)

Summary:
- Rules approved: 6
- Rules applied: 6
- Git commit: abc123def

Applied rules summary saved to:
.workspace/codify-pr-history/runs/2025-10-30_143022/06-apply/applied-summary.md
```text

---

## Configuration

**Default settings** (`.../config/defaults.json`):

```json
{
  "defaultDaysBack": 90,
  "defaultExcludeAuthors": ["dependabot", "github-actions", "renovate"],
  "defaultMinOccurrences": 3,
  "defaultSemanticThreshold": 0.85,
  "categories": [
    "security", "error-handling", "type-safety", "performance",
    "accessibility", "react-patterns", "api-design", "database",
    "testing", "code-style"
  ],
  "instructionFiles": {
    "repository": "../copilot-review-demo/.github/copilot-instructions.md",
    "backend": "../copilot-review-demo/backend/backend.instructions.md",
    "frontend": "../copilot-review-demo/frontend/frontend.instructions.md",
    "vsCodeSecurity": "../copilot-review-demo/.vscode/rules/security-patterns.md"
  }
}
```text

**Note:** These are defaults only. Subagents receive all parameters at invocation (self-contained).

---

## Data Files (Project-Specific)

All working data saved to `.workspace/codify-pr-history/`:

**Persistent:**

- `config/red-flags.json` - Stack-specific critical patterns

**Run-specific** (timestamped as `YYYY-MM-DD_HHMMSS`):

- `runs/[timestamp]/metadata.json` - Run information
- `runs/[timestamp]/01-fetch/` - Raw PR data from GitHub
- `runs/[timestamp]/02-preprocess/` - Deduplicated comment groups
- `runs/[timestamp]/03-analyze/` - Pattern analysis with triage
- `runs/[timestamp]/04-approve/` - User-approved patterns
- `runs/[timestamp]/05-generate/` - Draft rules (markdown)
- `runs/[timestamp]/06-apply/` - Applied rules summary
- `runs/[timestamp]/logs/` - Execution logs

**Historical:**

- `history/runs-index.json` - Index of all runs
- `history/patterns-over-time.json` - Pattern evolution tracking

**Recommendation:** Add `runs/` to `.gitignore` (don't commit PR data).

---

## Technical Details

### Subagents Used

This skill coordinates 5 subagents (see `../../agents/`):

1. **stack-analyzer** - Detects tech stack, generates red flags
2. **pr-comment-fetcher** - Fetches from GitHub via gh CLI
3. **comment-preprocessor** - Hybrid deduplication (CLI + LLM)
4. **pattern-analyzer** - Identifies patterns, compares to existing rules
5. **rule-generator** - Creates new rules / strengthens existing

Each runs in **isolated context** to prevent token overflow:

- Main conversation: ~10-20k tokens (summaries only)
- Each subagent: Isolated context for heavy processing
- Result: Can handle 450+ comments without overflow

### Prompts Used

Prompts located in `prompts/` (used by subagents):

- `stack-analysis.md` - How to analyze project stack
- `pattern-analysis.md` - Pattern identification with triage logic
- `rule-generation.md` - New rule formatting standards
- `rule-strengthening.md` - How to enhance existing rules

### Progressive Disclosure

Main SKILL.md (<500 lines) acts as **hub**. Detailed content in **resource files** (loaded on-demand):

- workflow-overview.md
- stack-analysis-guide.md
- fetching-guide.md
- preprocessing-guide.md
- pattern-analysis-guide.md
- rule-generation-guide.md
- interactive-review-guide.md
- troubleshooting.md

**Token efficiency**: Claude loads resources only when user asks specific questions.

---

## Related Skills

- (Future) `copilot-rule-tester` - Test generated rules against example code
- (Future) `pattern-evolution-tracker` - Visualize pattern improvements over time

---

## Quick Reference

**Commands:**

- `/codify-pr-history` - Analyze last 90 days
- `/codify-pr-history 30` - Last 30 days
- `/codify-pr-history 180 --refresh-stack` - 180 days + refresh stack

**Data location:** `.workspace/codify-pr-history/`

**Resources:** `skills/codify-pr-reviews/resources/`

**Prompts:** `skills/codify-pr-reviews/prompts/`

**Version:** 1.0.0

**Allowed tools:** Task, AskUserQuestion, Read, Edit, Bash

---

*This skill maintains <500 lines. For detailed information, see resource files above.*
