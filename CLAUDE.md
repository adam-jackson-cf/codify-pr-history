# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **code review research and demonstration repository** focused on GitHub Copilot code review capabilities. It contains three main components:

1. **Research Documentation** (`copilot-code-reviews.md`) - Comprehensive analysis of Copilot code review features
2. **Demo Application** (`copilot-review-demo/`) - Full-stack TypeScript application demonstrating code review patterns
3. **Codify PR History Plugin** (`codify-pr-history/`) - Production Claude Code plugin that transforms PR review history into automated Copilot instructions

## Project Structure

```
code-review/
├── copilot-code-reviews.md           # Research documentation (~450 lines)
├── codify-pr-history/                # Claude Code plugin (PRODUCTION)
│   ├── .claude-plugin/plugin.json
│   ├── commands/codify-pr-history.md # Slash command entry point
│   ├── agents/                       # 5 subagents for isolated processing
│   │   ├── stack-analyzer/
│   │   ├── pr-comment-fetcher/
│   │   ├── comment-preprocessor/
│   │   ├── pattern-analyzer/
│   │   └── rule-generator/
│   └── skills/codify-pr-reviews/     # Main skill with progressive disclosure
│       ├── SKILL.md                  # Hub orchestration (<500 lines)
│       ├── resources/                # 8 detailed guides
│       ├── prompts/                  # 4 LLM prompts
│       ├── config/defaults.json
│       └── templates/
├── copilot-review-demo/              # Full-stack demo application
│   ├── backend/                      # Express + TypeScript + SQLite
│   ├── frontend/                     # React + TypeScript + Vite
│   └── .github/copilot-instructions.md
└── deprecated/codify-pr-history/     # Old Node.js implementation (reference only)
```

## Common Commands

### Repository Root

```bash
# Lint markdown in plugin directory
bun run lint:md                   # Check for issues
bun run lint:md:fix               # Auto-fix issues
```

### Demo Application Setup (Self-Contained Project)

**Note:** The `copilot-review-demo/` is an independent project using npm.

**Initial Setup:**

```bash
# 1. Setup backend
cd copilot-review-demo/backend
npm install
cp .env.example .env              # Create environment file
# Edit .env with your configuration (JWT_SECRET, etc.)

# 2. Setup frontend
cd ../frontend
npm install
cp .env.example .env              # Create environment file (if exists)
```

**Backend Commands:**

```bash
cd copilot-review-demo/backend
npm run dev                       # Start dev server (ts-node-dev)
npm run build                     # Build TypeScript → dist/
npm start                         # Run production build
npm test                          # Run Jest tests
npm run test:watch                # Watch mode
npm run test:coverage             # Generate coverage report
npm run lint                      # ESLint
npm run lint:fix                  # Fix linting issues
```

**Frontend Commands:**

```bash
cd copilot-review-demo/frontend
npm run dev                       # Start Vite dev server
npm run build                     # Build for production (tsc + vite)
npm run preview                   # Preview production build
npm test                          # Run Vitest tests
npm run test:ui                   # Vitest UI
npm run test:coverage             # Coverage report
npm run lint                      # ESLint
npm run lint:fix                  # Fix linting issues
```

## Codify PR History Plugin

### Usage

```bash
# Analyze last 90 days of PR comments (default)
/codify-pr-history

# Analyze last 30 days
/codify-pr-history 30

# Analyze with stack refresh
/codify-pr-history 90 --refresh-stack
```

### Architecture: Multi-Agent System

The plugin uses **context isolation** to process large PR datasets efficiently:

- **Main Skill** (`codify-pr-reviews`) - Orchestrates workflow, keeps main context under 20k tokens
- **5 Subagents** - Each runs in isolated context for heavy processing:
  1. **stack-analyzer**: Detects tech stack (Express, React, etc.) and generates security red flags
  2. **pr-comment-fetcher**: Fetches PR comments via `gh` CLI with bot filtering
  3. **comment-preprocessor**: Hybrid deduplication (CLI + LLM), reduces 450 comments → 20 groups
  4. **pattern-analyzer**: Triages patterns into 🟢 already covered / 🟡 needs strengthening / 🔴 new rule
  5. **rule-generator**: Generates markdown rules with good/bad examples

**Why subagents?** Enables processing 450+ PR comments without context overflow. Main conversation only sees summaries (~2k tokens), while subagents handle raw data (~50k tokens).

### Workflow Stages

1. Stack analysis (first run only) → detects frameworks and critical security patterns
2. Fetch PR comments via `gh` CLI → filters bots, excludes short comments
3. Preprocess comments → deduplicates, groups similar feedback
4. Analyze patterns → compares to existing Copilot instruction files, triages each pattern
5. Interactive pattern review → you approve/modify/skip each pattern
6. Generate rules → creates new rules OR strengthens existing ones with examples
7. Interactive wording review → you approve/edit generated markdown
8. Apply rules → edits Copilot instruction files, creates git commit

### Data Organization

All plugin data stored in `.workspace/codify-pr-history/`:

```
.workspace/codify-pr-history/
├── config/red-flags.json                    # Persistent stack analysis
├── runs/YYYY-MM-DD_HHMMSS/                  # Timestamped runs
│   ├── metadata.json
│   ├── 01-fetch/pr-comments.json
│   ├── 02-preprocess/preprocessed-comments.json
│   ├── 03-analyze/patterns.json
│   ├── 04-approve/patterns-approved.json
│   ├── 05-generate/drafts/*.md
│   ├── 06-apply/applied-summary.md
│   └── logs/run.log
└── history/
    ├── runs-index.json                      # Index of all runs
    └── patterns-over-time.json              # Track pattern evolution
```

### Requirements

- `gh` CLI installed and authenticated (`gh auth login`)
- Git repository with PR history
- GitHub Copilot instruction files (or plugin will guide creation)

## Demo Application Architecture

### Dual Example Pattern

The demo uses **intentional bad examples** for teaching:

- `good-examples/` - Proper implementations following security best practices
- `bad-examples/` - **Intentional vulnerabilities** for demonstration (SQL injection, hardcoded secrets, missing validation, etc.)

**CRITICAL:** Code in `bad-examples/` directories contains deliberate security flaws. Never use these patterns in production.

### Tech Stack

**Backend:**
- Express.js + TypeScript
- SQLite3 database
- bcrypt (password hashing)
- jsonwebtoken (auth)
- Zod (validation)
- Jest (testing)

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- React Router (navigation)
- Vitest (testing)

### Custom Instructions Hierarchy

The demo demonstrates Copilot's layered instruction system:

1. **Repository-level** (`.github/copilot-instructions.md`) - Baseline standards (error handling, security, testing)
2. **Path-scoped** (`backend/backend.instructions.md`, `frontend/frontend.instructions.md`) - Context-specific rules
3. **VS Code rules** (`.vscode/rules/*.md`) - Organized by category (if present)

### Key Coding Standards (from copilot-instructions.md)

**Security (Critical):**
- NEVER hardcoded credentials - use environment variables
- ALWAYS use parameterized SQL queries (never concatenate user input)
- Passwords MUST be hashed with bcrypt async methods (≥10 salt rounds)
- All user input MUST be validated before processing
- Implement authentication/authorization checks on protected routes

**Error Handling:**
- All async operations wrapped in try-catch
- Log errors with context (user ID, request ID)
- Return generic messages to clients (don't expose internals)

**TypeScript:**
- Strict mode enabled
- No `any` types without justification
- Explicit interfaces for props/parameters

**Testing:**
- Arrange-Act-Assert pattern
- Target 80%+ coverage for business logic
- Mock external dependencies

**API Design (Backend):**
- RESTful conventions
- Proper HTTP status codes (200, 201, 204, 400, 401, 403, 404, 409, 500)
- Request validation using Zod
- Rate limiting on auth endpoints (5 attempts per 15 minutes)
- Pagination for list endpoints

**React (Frontend):**
- Functional components with hooks only
- Controlled form components with validation
- Accessibility: labels, ARIA attributes, semantic HTML
- Performance: useCallback, useMemo for expensive operations
- No inline styles (use CSS modules)

## Git Workflow

**Commit Format:** `type(scope): description`

Types: feat, fix, docs, style, refactor, test, chore

## Testing Strategy

**Backend:** Jest with Supertest for API endpoint testing

**Frontend:** Vitest with @testing-library/react for component testing

**Target:** 80%+ coverage for business logic

## Research Context

The `copilot-code-reviews.md` document contains:
- Path-scoped instructions analysis (September 2025 feature)
- Agentic tool calling integration (October 2025)
- ~70% rule adherence expectation
- Organization-level instruction hierarchy
- Practical examples from .NET and security-focused reviews

Reference this document when discussing Copilot code review capabilities.
