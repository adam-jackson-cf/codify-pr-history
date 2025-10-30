# Codify PR Reviews - Claude Code Plugin

> Transform PR review history into automated GitHub Copilot instructions

This Claude Code plugin analyzes your GitHub pull request review comments to identify recurring patterns, then generates
GitHub Copilot custom instructions that codify those patterns into automated reviews.

## What It Does

Every time a reviewer leaves a comment like "SQL injection vulnerability here" or "Missing error handling,"
that's a signal: something should be caught automatically. This plugin:

1. **Analyzes your tech stack** to identify critical security patterns
2. **Fetches PR comments** from your GitHub repository
3. **Identifies recurring patterns** using hybrid deduplication (CLI + LLM)
4. **Compares to existing rules** to determine what needs strengthening vs. what's new
5. **Generates Copilot instructions** with good/bad examples
6. **Guides interactive review** where you approve/modify/reject rules
7. **Applies approved rules** to your Copilot instruction files
8. **Tracks history** to measure pattern improvements over time

## Key Features

- 🎯 **Smart Triage**: Categorizes patterns as already covered, needs strengthening, or new rule needed
- 🔍 **Hybrid Deduplication**: Combines CLI tools + lightweight LLM for efficient comment grouping
- 🧠 **Context Isolation**: Uses subagents to process heavy data without context overflow
- 📊 **Progressive Disclosure**: Shows information incrementally as needed
- 🕐 **Timestamped Runs**: Preserves every analysis for historical comparison
- 🔴 **Red Flag Detection**: Always surfaces critical issues regardless of frequency
- 📈 **Pattern Evolution**: Track if patterns improve after applying rules

## Quick Start

### Installation

Install the plugin in your Claude Code environment:

```bash
# From plugin directory
/plugin install codify-pr-reviews
```

### Usage

Run from your project root directory:

```bash
# Analyze last 90 days of PR comments
/codify-pr-history

# Analyze last 30 days
/codify-pr-history 30

# Analyze with stack refresh
/codify-pr-history 90 --refresh-stack
```

The plugin will guide you through:

1. Stack analysis (first run only)
2. Fetching PR comments
3. Pattern identification
4. Interactive pattern approval
5. Rule generation
6. Rule wording approval
7. Application to instruction files

## Requirements

- Claude Code (latest version)
- `gh` CLI installed and authenticated
- Git repository with PR history
- GitHub Copilot instruction files (or will create them)

## How It Works

### Architecture

The plugin uses:

- **1 Skill** (`codify-pr-reviews`) - Orchestrates the workflow with progressive disclosure
- **5 Subagents** - Process data in isolated contexts:
  - `stack-analyzer` - Detects tech stack and generates red flags
  - `pr-comment-fetcher` - Fetches PR comments via gh CLI
  - `comment-preprocessor` - Deduplicates comments (hybrid CLI + LLM)
  - `pattern-analyzer` - Identifies patterns and compares to existing rules
  - `rule-generator` - Generates new rules or strengthens existing ones
- **1 Slash Command** (`/codify-pr-history`) - Entry point

### Workflow

```text
/codify-pr-history 90

↓ Stack Analysis (first run)
  Detects: React, Express, TypeScript, SQLite
  Generates: 12 red flag patterns

↓ Fetch Comments (via gh CLI)
  45 PRs, 450 comments from last 90 days

↓ Preprocess (hybrid deduplication)
  450 comments → 20 groups (330 filtered)

↓ Analyze Patterns (compare to existing rules)
  12 patterns identified:
  - 🟢 4 already covered
  - 🟡 3 need strengthening
  - 🔴 5 new rules needed

↓ Interactive Review
  You approve/modify each pattern

↓ Generate Rules
  8 draft rules created

↓ Approve Wording
  You review each rule's content

↓ Apply Rules
  6 rules applied to instruction files
  Git commit created
```

### Data Organization

All data stored in `.workspace/codify-pr-history/`:

```text
.workspace/codify-pr-history/
├── config/
│   └── red-flags.json                    # Persistent stack analysis
├── runs/
│   └── 2025-10-30_143022/               # Timestamped runs
│       ├── metadata.json
│       ├── 01-fetch/pr-comments.json
│       ├── 02-preprocess/preprocessed-comments.json
│       ├── 03-analyze/patterns.json
│       ├── 04-approve/patterns-approved.json
│       ├── 05-generate/drafts/
│       ├── 06-apply/applied-summary.md
│       └── logs/run.log
└── history/
    ├── runs-index.json                   # Index of all runs
    └── patterns-over-time.json           # Pattern evolution
```

## Configuration

Default configuration in `skills/codify-pr-reviews/config/defaults.json`:

- Days to look back: 90
- Excluded authors: dependabot, github-actions, renovate
- Minimum occurrences: 3
- Semantic similarity threshold: 0.85

You can override these by editing the defaults or passing parameters.

## Examples

### Example 1: First Run

```bash
$ /codify-pr-history 90

Analyzing project stack...
✓ Detected: Express.js + React + TypeScript + SQLite
✓ Generated 12 red flag patterns
✓ Saved to .workspace/codify-pr-history/config/red-flags.json

Fetching PR comments...
✓ Found 45 PRs from last 90 days
✓ Collected 450 comments
✓ Saved to .workspace/codify-pr-history/runs/2025-10-30_143022/01-fetch/

Preprocessing comments...
✓ Phase 1 (exact): 40 duplicates removed
✓ Phase 2 (fuzzy): 60 near-duplicates grouped
✓ Phase 3 (semantic): 10 ambiguous cases resolved
✓ Result: 450 → 20 groups (330 filtered)

Analyzing patterns...
✓ 12 patterns identified and triaged

Pattern Analysis Complete:
🟢 Already Covered (4 patterns) - existing rules handle these
🟡 Needs Strengthening (3 patterns) - rules exist but insufficient
🔴 New Rules Needed (5 patterns) - no existing coverage

Ready to review patterns? [yes]
```

### Example 2: Pattern Review

```text
Pattern 5 of 12: SQL Injection via String Concatenation

Triage: 🟡 NEEDS STRENGTHENING
Frequency: 8 occurrences
Severity: Critical

Existing Rule: backend/backend.instructions.md
- "Use parameterized queries with ? placeholders"
- Has basic SELECT examples

Issue: 5 comments mention LIKE queries, 2 mention IN clauses
Current rule only shows simple SELECT statements

Suggested Enhancement:
Add examples for LIKE queries and IN clauses

What would you like to do?
A) Strengthen as suggested
B) Strengthen with different approach
C) Actually already fine - skip
D) View existing rule content

Your choice: A

✓ Pattern approved for strengthening
```

### Example 3: Incremental Run (30 days later)

```bash
$ /codify-pr-history 30

Using existing stack analysis (run --refresh-stack to update)

Fetching PR comments from last 30 days...
✓ Found 15 PRs, 120 comments

Preprocessing...
✓ 120 → 8 groups

Analyzing patterns...
✓ 5 patterns identified
🟢 3 already covered (including SQL injection - rule working!)
🟡 1 needs strengthening
🔴 1 new pattern

Progress: SQL Injection pattern dropped from 8 to 2 occurrences!
Your strengthened rule from last run is working.
```

## Troubleshooting

### "No patterns found"

- Ensure you have at least 10+ PRs with review comments
- Lower the minimum frequency threshold (default: 3)
- Check that date range includes active PRs

### "gh CLI not found"

Install GitHub CLI:

```bash
# macOS
brew install gh

# Linux
curl -sS https://webi.sh/gh | sh

# Then authenticate
gh auth login
```

### "Too many patterns (overwhelming)"

- Use shorter date range (30 days instead of 90)
- Focus on critical/high severity patterns first
- Increase minimum frequency threshold to 5+

## Architecture Details

### Progressive Disclosure

The main skill file is <500 lines and acts as a hub. Detailed information lives in resource files loaded on-demand:

- `workflow-overview.md` - Complete workflow explanation
- `stack-analysis-guide.md` - Stack detection details
- `fetching-guide.md` - GitHub CLI integration
- `preprocessing-guide.md` - Deduplication techniques
- `pattern-analysis-guide.md` - Triage logic
- `rule-generation-guide.md` - Rule creation approach
- `interactive-review-guide.md` - Approval workflow
- `troubleshooting.md` - Common issues

### Context Isolation

Each subagent runs in its own context:

- **Main conversation**: ~10-20k tokens (summaries only)
- **Each subagent**: Isolated context for heavy processing
- **Result**: Can handle 450+ comments without overflow

### Token Efficiency

- Raw PR comments: ~50k tokens
- After preprocessing: ~5k tokens
- Patterns for main conversation: ~2k tokens
- **90% reduction** through subagent isolation

## Contributing

Contributions welcome! Areas for improvement:

- Additional tech stack detection
- More sophisticated pattern matching
- Integration with other code review tools
- Custom rule templates
- Team collaboration features

## License

MIT License - see LICENSE file

## Support

- **Issues**: Report bugs or request features via GitHub issues
- **Documentation**: See `skills/codify-pr-reviews/resources/` for detailed guides
- **Deprecated Node.js version**: Available in `../deprecated/codify-pr-history/` for reference

---

**Version**: 1.0.0
**Plugin Type**: Skills + Subagents + Commands
**Claude Code Requirement**: >=1.0.0
