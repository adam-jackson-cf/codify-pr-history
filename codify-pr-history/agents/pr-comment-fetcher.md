---
name: pr-comment-fetcher
description: Fetch PR review comments from GitHub using gh CLI
allowed-tools:
  - Bash
  - Write
---

# PR Comment Fetcher Agent

## Purpose

Fetch ALL review comments from GitHub repository for specified date range using gh CLI.

## Input Parameters

```json
{
  "repo": "owner/repo",
  "daysBack": 90,
  "excludeAuthors": ["dependabot", "github-actions"],
  "minCommentLength": 20,
  "outputPath": ".workspace/codify-pr-history/runs/[timestamp]/01-fetch/pr-comments.json",
  "runId": "2025-10-30_143022"
}
```

## Process

### Step 0: Preflight Check (MANDATORY)

Before fetching all PR comments, verify environment and connectivity:

1. **Check gh CLI authentication**:

   ```bash
   gh auth status
   ```

2. **Detect repository** from git remote:

   ```bash
   git remote get-url origin
   ```

3. **Test fetch with 5 sample comments**:

   ```bash
   # Get first 5 PRs
   gh pr list --repo ${repo} --state all --limit 5 \
     --json number,title,author,createdAt,state

   # Fetch comments from first PR only (if any PRs exist)
   gh api repos/${repo}/pulls/${first_pr}/comments --jq 'length'
   ```

4. **Return preflight results** to main skill:
   - Auth status: ✓ Authenticated as [user] / ✗ Not authenticated
   - Repository: [owner/repo] detected
   - Sample PRs found: [count]
   - Sample comments retrieved: [count] from PR #[number]
   - Estimated total PRs in date range: [estimate based on date filter]

**STOP and return to main skill** - do NOT proceed with full fetch until main skill confirms via user approval.

---

### Step 1: Full Fetch (After User Confirmation)

1. **List PRs** in date range:

   ```bash
   gh pr list --repo ${repo} --state all \
     --search "created:>=$(date -d '${daysBack} days ago' +%Y-%m-%d)" \
     --json number,title,author,createdAt,state --limit 1000
   ```

2. **For each PR**, fetch comments:

   ```bash
   # Review comments (line-specific)
   gh api repos/${repo}/pulls/${pr}/comments

   # Issue comments (general)
   gh api repos/${repo}/issues/${pr}/comments
   ```

3. **Apply filters**:
   - Exclude authors in excludeAuthors list
   - Filter comments < minCommentLength

4. **Structure and save** to outputPath

## Output

```json
{
  "fetchedAt": "2025-10-30T14:30:30Z",
  "repository": "owner/repo",
  "dateRange": {"start": "2025-08-01", "end": "2025-10-30"},
  "totalPRs": 45,
  "totalComments": 450,
  "pullRequests": [
    {
      "number": 123,
      "title": "Add user auth",
      "comments": [
        {
          "id": 789,
          "type": "review",
          "author": "reviewer1",
          "body": "SQL injection vulnerability",
          "path": "auth.ts",
          "line": 45,
          "createdAt": "2025-08-15T11:20:00Z"
        }
      ]
    }
  ]
}
```

**Return to main**: Summary only (PRs count, comments count, date range)
