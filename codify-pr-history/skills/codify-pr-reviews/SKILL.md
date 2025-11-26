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

**Requirements**:

- `gh` CLI installed and authenticated
- Git repository with PR history
- GitHub Copilot instruction files (or will guide creation)

---

## Need to...? Read This

| Your Goal | Resource File |
|-----------|---------------|
| Analyze project stack | [stack-analysis-guide.md](resources/stack-analysis-guide.md) |
| Fetch PR comments | [fetching-guide.md](resources/fetching-guide.md) |
| Deduplicate comments | [preprocessing-guide.md](resources/preprocessing-guide.md) |
| Analyze patterns | [pattern-analysis-guide.md](resources/pattern-analysis-guide.md) |
| Generate rules | [rule-generation-guide.md](resources/rule-generation-guide.md) |
| Review patterns/rules interactively | [interactive-review-guide.md](resources/interactive-review-guide.md) |
| Troubleshoot issues | [troubleshooting.md](resources/troubleshooting.md) |

---

## Orchestration Overview

### Stage 1: Stack Analysis
**Purpose**: Detect tech stack and generate security red flags
**When**: First run or with `--refresh-stack` flag
**Details**: [stack-analysis-guide.md](resources/stack-analysis-guide.md)

### Stage 2: Fetch PR Comments
**Purpose**: Retrieve PR comments via gh CLI with intelligent filtering
**Details**: [fetching-guide.md](resources/fetching-guide.md)

### Stage 3: Preprocess & Deduplicate
**Purpose**: Group similar comments and reduce noise using hybrid CLI + LLM approach
**Details**: [preprocessing-guide.md](resources/preprocessing-guide.md)

### Stage 4: Pattern Analysis
**Purpose**: Identify recurring patterns and triage against existing Copilot rules
**Details**: [pattern-analysis-guide.md](resources/pattern-analysis-guide.md)

### Stage 5: Interactive Pattern Review
**Purpose**: Review identified patterns and decide on actions (create/strengthen/skip)
**Details**: [interactive-review-guide.md](resources/interactive-review-guide.md)

### Stage 6: Generate Rules
**Purpose**: Create new rules or enhance existing ones with concrete examples
**Details**: [rule-generation-guide.md](resources/rule-generation-guide.md)
**Note**: Rule generation checks file length (4000 character limit) and may recommend splitting into path-scoped instruction files

### Stage 7: Interactive Rule Wording Review
**Purpose**: Review and approve generated rule wording before application
**Details**: [interactive-review-guide.md](resources/interactive-review-guide.md)

### Stage 8: Apply Rules
**Purpose**: Update instruction files and create git commit with changes
**Details**: [interactive-review-guide.md](resources/interactive-review-guide.md)

---

## Configuration

Key configuration files used throughout the workflow:

- **`config/defaults.json`** - Default settings (date ranges, filtering, categorization)
- **`config/red-flags.json`** - Stack-specific critical patterns (from Stage 1)
- **Prompts** - LLM instructions for each stage (in `prompts/` directory)

Specific configuration settings for each stage are documented in the respective stage guides above.

---

## Data Organization

All working data is organized in `.workspace/codify-pr-history/`:

**Persistent Configuration:**
- `config/red-flags.json` - Stack-specific patterns for your project

**Timestamped Runs** (`runs/YYYY-MM-DD_HHMMSS/`):
- `01-fetch/` - Raw PR comments from GitHub
- `02-preprocess/` - Deduplicated comment groups
- `03-analyze/` - Pattern analysis and triage decisions
- `04-approve/` - User-approved patterns for rule creation
- `05-generate/` - Draft rule files (markdown)
- `06-apply/` - Final applied rules summary

**Historical Tracking:**
- `history/runs-index.json` - Index of all analysis runs
- `history/patterns-over-time.json` - Pattern evolution across runs

**Note:** Add `runs/` to `.gitignore` - PR data shouldn't be committed.

---

## Technical Architecture

**Multi-Agent Design**: This skill uses 5 specialized subagents running in isolated contexts:

1. **stack-analyzer** - Project analysis and red flag generation
2. **pr-comment-fetcher** - GitHub data retrieval via gh CLI
3. **comment-preprocessor** - Hybrid deduplication (CLI + LLM)
4. **pattern-analyzer** - Pattern identification and rule comparison
5. **rule-generator** - Rule creation and enhancement

**Context Isolation**: Main conversation stays ~10k tokens while subagents handle heavy processing (50k+ tokens), enabling analysis of 450+ PR comments without context overflow.

**Progressive Disclosure**: This file provides orchestration overview. Detailed implementation and troubleshooting are in the resource files linked above.

### Data Flow & Token Efficiency

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
```

**Token efficiency**: 50k → 2k tokens in main conversation (96% reduction through subagent isolation)

---

## GitHub Copilot Best Practices

This skill generates rules aligned with GitHub Copilot's latest best practices (October 2025):

- **Path-Scoped Instructions**: Creates `.github/instructions/*.instructions.md` files with `applyTo` frontmatter for targeted rules
- **File Length Limits**: Monitors and warns when instruction files approach 4000 character limit
- **Unsupported Content Validation**: Prevents generation of unsupported content types (formatting directives, PR Overview changes, etc.)
- **Recommended Structure**: Follows GitHub's recommended template structure for optimal effectiveness
- **Positive Directives**: Emphasises positive phrasing ("Use X" not "Don't use Y") for better Copilot adherence

**New Copilot Capabilities** (October 2025):
- Agentic tool calling for full project context awareness
- Integration with deterministic security tools (CodeQL, ESLint)
- Enhanced effectiveness when combined with well-structured custom instructions

---

## Quick Reference

**Commands:**
- `/codify-pr-history` - Analyze last 90 days
- `/codify-pr-history 30` - Last 30 days
- `/codify-pr-history 180 --refresh-stack` - 180 days + refresh stack

**Data location:** `.workspace/codify-pr-history/`

**Version:** 1.0.0
