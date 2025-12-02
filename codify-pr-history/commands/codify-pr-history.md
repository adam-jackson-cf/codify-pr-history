---
description: Analyze PR review history and generate Copilot instruction rules
---

# Codify PR History

Orchestrate the PR review codification workflow: analyze your GitHub PR review history to identify
recurring patterns and generate GitHub Copilot custom instruction rules.

## Usage

```bash
/codify-pr-history [days] [--refresh-stack]
```

## Arguments

- **$1 (days)**: Number of days to look back (default: 90)
  - Examples: 30, 90, 180
  - Shorter ranges = faster, fewer patterns
  - Longer ranges = more comprehensive

- **--refresh-stack**: Force re-analysis of project tech stack
  - Use when tech stack has changed
  - Otherwise uses cached analysis

## Examples

```bash
# Default: last 90 days
/codify-pr-history

# Last 30 days (faster, incremental)
/codify-pr-history 30

# Last 180 days with stack refresh
/codify-pr-history 180 --refresh-stack

# Just refresh stack without analyzing PRs
/codify-pr-history --refresh-stack
```

## What It Does

### Workflow

0. **Preflight Check** (before full analysis)
   - Verifies gh CLI authentication
   - Detects repository from git remote
   - Tests fetch with 5 sample comments
   - **USER CONFIRMATION**: Review preflight results before proceeding

1. **Stack Analysis** (first run / --refresh-stack)
   - Detects tech stack (Express, React, TypeScript, etc.)
   - Generates red flag patterns (SQL injection, hardcoded secrets, etc.)

2. **Fetch PR Comments** (via gh CLI - after preflight approved)
   - Fetches all PR comments from last N days
   - Filters by author (excludes bots) and length

3. **Preprocess** (hybrid deduplication)
   - Exact matching (CLI)
   - Fuzzy matching (simhash)
   - Semantic grouping (lightweight LLM)
   - Reduces 450 comments → 20 groups

4. **Analyze Patterns** (compare to existing rules)
   - Identifies recurring review patterns
   - Triages into 3 categories:
     - 🟢 Already covered (existing rule works)
     - 🟡 Needs strengthening (rule exists but insufficient)
     - 🔴 New rule needed (no existing coverage)

5. **Interactive Pattern Review**
   - **USER CONFIRMATION**: Review EACH pattern (one by one)
   - Shows each pattern with triage decision
   - You approve/modify/skip each one

6. **Generate Rules**
   - Creates new rules OR strengthens existing
   - Includes good/bad code examples
   - Determines target file (backend/frontend/repository)
   - Supports path-scoped instruction files with applyTo frontmatter

7. **Interactive Wording Review**
   - **USER CONFIRMATION**: Review EACH rule's markdown (one by one)
   - Shows generated markdown content
   - You approve/edit/reject each rule

8. **Apply Rules**
   - **USER CONFIRMATION**: Final approval before file modifications
   - Edits Copilot instruction files
   - Creates git commit with summary

### Data Saved

All data timestamped in `.workspace/codify-pr-history/runs/YYYY-MM-DD_HHMMSS/`:

- 01-fetch/ - Raw PR comments
- 02-preprocess/ - Deduplicated groups
- 03-analyze/ - Patterns with triage
- 04-approve/ - User-approved patterns
- 05-generate/ - Draft rules
- 06-apply/ - Applied rules summary
- logs/ - Execution log

## Requirements

- **gh CLI**: Installed and authenticated (`gh auth login`)
- **Git repository**: Run from project root with GitHub remote
- **Copilot instruction files**: Or will guide creation

## Invoke the Skill

This command invokes the `codify-pr-reviews` skill with the provided parameters.
