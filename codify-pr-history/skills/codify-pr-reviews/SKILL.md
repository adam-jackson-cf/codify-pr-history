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

Transforms PR review comment history into automated GitHub Copilot instructions.

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

**Data location:** `.workspace/codify-pr-history/`

**Version:** 1.0.0
