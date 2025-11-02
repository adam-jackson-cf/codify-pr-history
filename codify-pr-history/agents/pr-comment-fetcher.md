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

1. **List PRs** in date range:

   ```bash
   gh pr list --repo ${repo} --state all \
     --search "created:>=$(date -d '${daysBack} days ago' +%Y-%m-%d)" \
     --json number,title,author,createdAt,state --limit 1000
   ```

1. **For each PR**, fetch comments:

   ```bash
   # Review comments (line-specific)
   gh api repos/${repo}/pulls/${pr}/comments

   # Issue comments (general)
   gh api repos/${repo}/issues/${pr}/comments
   ```

1. **Apply filters**:
   - Exclude authors in excludeAuthors list
   - Filter comments < minCommentLength

1. **Structure and save** to outputPath

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
