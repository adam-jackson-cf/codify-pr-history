# PR Comment Fetching Guide

Details on how PR comments are fetched from GitHub using the gh CLI.

---

## Overview

The `pr-comment-fetcher` subagent retrieves all review comments from your GitHub repository for a
specified date range using the GitHub CLI (`gh`).

**Key principle**: Fetch EVERYTHING. Don't try to filter "resolved" vs "unresolved" at this stage - that
determination is unreliable. Instead, we'll use existing rule comparison to identify what's already
covered.

---

## Repository Auto-Detection

The skill automatically detects your repository from git remote:

```bash
# Extract repository from git remote
git remote get-url origin

# Example outputs:
# https://github.com/myorg/myrepo.git
# git@github.com:myorg/myrepo.git
# ssh://git@github.com/myorg/myrepo.git

# Parsed to: myorg/myrepo
```

**Requirements**:

- Must be run from within a git repository
- Remote must be named `origin`
- Remote must be a GitHub repository

**Troubleshooting**:

```bash
# Check current remote
git remote -v

# If wrong, update it
git remote set-url origin https://github.com/myorg/myrepo.git
```

---

## Date Range Calculation

**From command argument**:

```bash
/codify-pr-history 90  # Last 90 days
```

**Calculation**:

```javascript
const today = new Date();
const startDate = new Date(today);
startDate.setDate(startDate.getDate() - 90);

// Example:
// Today: 2025-10-30
// 90 days ago: 2025-08-01
// Date range: 2025-08-01 to 2025-10-30
```

**Default**: 90 days if not specified

---

## GitHub CLI Commands Used

### 1. Fetch Pull Requests

```bash
gh pr list \
  --repo myorg/myrepo \
  --state all \
  --search "created:>=2025-08-01" \
  --json number,title,author,createdAt,state,mergedAt \
  --limit 1000
```

**Parameters**:

- `--state all`: Include open, closed, and merged PRs
- `--search "created:>=YYYY-MM-DD"`: Filter by creation date
- `--json`: Structured output with specific fields
- `--limit 1000`: Maximum PRs to fetch (adjust if needed)

**Output** (example):

```json
[
  {
    "number": 123,
    "title": "Add user authentication",
    "author": {"login": "developer1"},
    "createdAt": "2025-08-15T10:30:00Z",
    "state": "MERGED",
    "mergedAt": "2025-08-16T14:20:00Z"
  },
  ...
]
```

### 2. Fetch PR Review Comments

For each PR, fetch line-specific review comments:

```bash
gh api repos/myorg/myrepo/pulls/123/comments \
  --jq '.[] | {
    id: .id,
    body: .body,
    path: .path,
    line: .line,
    user: .user.login,
    created_at: .created_at
  }'
```

**Fields extracted**:

- `id`: Unique comment ID
- `body`: Comment text
- `path`: File path commented on
- `line`: Line number
- `user.login`: Author username
- `created_at`: Timestamp

### 3. Fetch PR Issue Comments

General PR discussion comments (not line-specific):

```bash
gh api repos/myorg/myrepo/issues/123/comments \
  --jq '.[] | {
    id: .id,
    body: .body,
    user: .user.login,
    created_at: .created_at
  }'
```

---

## Filters Applied

### 1. Author Exclusion

**Default excluded**:

- `dependabot`
- `dependabot[bot]`
- `github-actions`
- `github-actions[bot]`
- `renovate`
- `renovate[bot]`

**Why**: Bot comments are automated and don't represent human review patterns.

**Customize**: Edit `config/defaults.json`:

```json
{
  "defaultExcludeAuthors": [
    "dependabot",
    "github-actions",
    "renovate",
    "my-custom-bot"
  ]
}
```

### 2. Minimum Comment Length

**Default**: 20 characters

**Why**: Filter out:

- "LGTM"
- "👍"
- "nit"
- "fix this"

**Customize**:

```json
{
  "minCommentLength": 30  // Stricter
}
```

### 3. Date Range

Only PRs **created** within the date range are included.

**Note**: PR comments are included even if added after the end date, as long as the PR was created within range.

---

## Output Format

Comments are saved to:

```text
.workspace/codify-pr-history/runs/YYYY-MM-DD_HHMMSS/01-fetch/pr-comments.json
```

**Structure**:

```json
{
  "fetchedAt": "2025-10-30T14:30:30Z",
  "repository": "myorg/myrepo",
  "dateRange": {
    "start": "2025-08-01",
    "end": "2025-10-30"
  },
  "totalPRs": 45,
  "totalComments": 450,
  "pullRequests": [
    {
      "number": 123,
      "title": "Add user authentication",
      "author": "developer1",
      "createdAt": "2025-08-15T10:30:00Z",
      "state": "MERGED",
      "comments": [
        {
          "id": 789456123,
          "type": "review",
          "author": "reviewer1",
          "body": "SQL injection vulnerability - use parameterized queries",
          "path": "backend/src/routes/auth.ts",
          "line": 45,
          "createdAt": "2025-08-15T11:20:00Z"
        },
        {
          "id": 789456124,
          "type": "issue",
          "author": "reviewer2",
          "body": "Overall looks good, just address the SQL injection issue",
          "createdAt": "2025-08-15T12:00:00Z"
        }
      ]
    }
  ]
}
```

**Comment types**:

- `review`: Line-specific code review comments (most useful)
- `issue`: General PR discussion comments (less specific)

---

## Performance Considerations

### Rate Limiting

GitHub API has rate limits:

- **Authenticated**: 5,000 requests/hour
- **Unauthenticated**: 60 requests/hour

**Our usage**:

- 1 request for PR list
- 2 requests per PR (review comments + issue comments)
- Example: 50 PRs = 1 + (50 × 2) = 101 requests

**Well within limits** for typical usage.

### Large Repositories

**Scenario**: 200 PRs in date range

**Fetch time**:

- ~200-400 API requests
- ~2-4 minutes with good network
- Still within rate limits

**Optimization**: Use shorter date ranges for faster iteration.

---

## Common Patterns in Comments

### Line-Specific Review Comments (Most Valuable)

```text
"SQL injection vulnerability - use parameterized queries"
Location: backend/src/routes/auth.ts:45

"Missing try-catch block here"
Location: backend/src/services/user.service.ts:120

"Use bcrypt.hash (async) not bcrypt.hashSync"
Location: backend/src/utils/password.ts:15
```

**Value**: These are specific, actionable, and often recurring.

### General PR Comments (Less Specific)

```text
"Overall looks good, just a few nits"
"Please address the SQL injection issues"
"Can you add error handling throughout?"
```

**Value**: These provide context but lack specific line references. Still useful for identifying themes.

---

## Example Fetch Output (Summary)

```text
Fetching PR comments from myorg/myrepo...

Date range: 2025-08-01 to 2025-10-30 (90 days)

Fetching pull requests... ✓
Found 45 PRs

Fetching comments from PR #123... ✓
Fetching comments from PR #145... ✓
Fetching comments from PR #156... ✓
...
Fetching comments from PR #189... ✓

Summary:
- Total PRs: 45
- Total comments: 450
  - Review comments (line-specific): 320
  - Issue comments (general): 130
- Comments by author:
  - reviewer1: 150
  - reviewer2: 120
  - developer1: 80 (filtered - PR author)
  - dependabot: 100 (filtered - bot)
- After filters: 450 → 270 comments

Saved to: .workspace/codify-pr-history/runs/2025-10-30_143022/01-fetch/pr-comments.json
```

---

## Incremental Fetching (Future Enhancement)

**Current**: Fetches all comments in date range every run

**Future optimization**:

- Store last fetch timestamp
- Only fetch PRs created since last run
- Merge with previous data

**Workaround**: Use shorter date ranges for recent runs:

```bash
# Initial run
/codify-pr-history 90

# 30 days later
/codify-pr-history 30  # Just last 30 days
```

---

## Data Quality Tips

### 1. Encourage Detailed Review Comments

**Good comments** (easy to pattern-match):

- "SQL injection vulnerability - use parameterized queries"
- "Missing error handling - add try-catch"
- "Use bcrypt.hash (async) instead of bcrypt.hashSync"

**Poor comments** (hard to pattern-match):

- "fix this"
- "nit"
- "see above"

### 2. Use Consistent Terminology

If your team uses specific terms ("SQL safety" vs "SQL injection"), stick to one.

### 3. Leave Comments Even for Obvious Issues

If the same issue appears repeatedly, comment on it every time. That creates the pattern this tool detects.

---

## Troubleshooting

### "No PRs Found"

**Check**: Are there PRs in the date range?

```bash
gh pr list --repo myorg/myrepo --search "created:>=2025-08-01" --state all
```

**Solutions**:

- Expand date range
- Check repository name
- Verify you have access to the repo

### "Comments But No Patterns"

**Possible**: Comments are too diverse or too short.

**Check**:

```bash
cat .workspace/codify-pr-history/runs/[timestamp]/01-fetch/pr-comments.json | \
  jq '.pullRequests[].comments[].body' | head -20
```

Review actual comment text. Are they specific enough?

### "Authentication Failed"

```bash
gh auth status
```

If not authenticated:

```bash
gh auth login
```

---

## See Also

- [workflow-overview.md](workflow-overview.md) - Complete workflow
- [preprocessing-guide.md](preprocessing-guide.md) - What happens to fetched comments next
- [troubleshooting.md](troubleshooting.md) - Common issues
