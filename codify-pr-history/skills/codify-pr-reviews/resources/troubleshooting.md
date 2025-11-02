# Troubleshooting Guide

Common issues and solutions when using the codify-pr-reviews skill.

---

## No Patterns Found

**Symptoms**:

- Analysis returns 0 patterns
- "No recurring issues found" message

**Causes & Solutions**:

### 1. Insufficient PR History

**Check**: Do you have at least 10+ PRs with review comments?

```bash
# Verify PR count
gh pr list --repo owner/repo --state all --limit 100 | wc -l
```text

**Solution**:

- Use longer date range (180 days instead of 90)
- Wait until you have more PR history
- Lower minimum frequency threshold to 2

### 2. Minimum Frequency Too High

**Check**: Default is 3 occurrences. Maybe patterns exist with 2 occurrences?

**Solution**: Edit `config/defaults.json`:

```json
{
  "defaultMinOccurrences": 2  // Lower from 3
}
```text

### 3. Comments Too Short

**Check**: Are review comments brief? ("fix this", "nit", etc.)

**Solution**: Lower minimum comment length:

```json
{
  "minCommentLength": 10  // Lower from 20
}
```text

### 4. Bot Comments Filtered

**Check**: Are most comments from bots/automation?

**Solution**: Check excluded authors list, maybe too aggressive.

---

## Too Many Patterns (Overwhelming)

**Symptoms**:

- 30+ patterns identified
- Interactive review takes too long

**Solutions**:

### 1. Shorter Date Range

```bash
/codify-pr-history 30  # Last 30 days instead of 90
```text

### 2. Higher Frequency Threshold

```json
{
  "defaultMinOccurrences": 5  // Up from 3
}
```text

### 3. Focus on High Severity First

During interactive review, approve only critical/high severity patterns on first pass.

### 4. Incremental Approach

- First run: Focus on security patterns
- Second run: Focus on error handling
- Third run: Everything else

---

## gh CLI Not Found

**Symptoms**:

```text
Error: gh command not found
```text

**Solutions**:

### Install GitHub CLI

**macOS**:

```bash
brew install gh
```text

**Linux**:

```bash
curl -sS https://webi.sh/gh | sh
```text

**Windows**:

```bash
winget install GitHub.cli
```text

### Authenticate

```bash
gh auth login
```text

Follow prompts to authenticate via browser.

### Verify Installation

```bash
gh --version
# Should show: gh version 2.x.x
```text

---

## Repository Not Found

**Symptoms**:

```text
Error: Could not resolve to a Repository with the name 'owner/repo'
```text

**Causes & Solutions**:

### 1. Wrong Repository Name

**Check**: Is auto-detection correct?

```bash
git remote get-url origin
# Should show: https://github.com/owner/repo.git
```text

**Solution**: Fix git remote or run from correct directory.

### 2. gh Not Authenticated

**Check**: Is gh CLI authenticated?

```bash
gh auth status
```text

**Solution**: Re-authenticate:

```bash
gh auth login
```text

### 3. Private Repository Access

**Check**: Does your token have access to private repos?

**Solution**: Ensure `gh auth login` scope includes private repos.

---

## Generated Rules Don't Match Codebase

**Symptoms**:

- Examples use wrong framework
- Examples use different language
- Style doesn't match project

**Causes & Solutions**:

### 1. Stack Analysis Incorrect

**Check**: Review `.workspace/codify-pr-history/config/red-flags.json`

**Solution**: Refresh stack analysis:

```bash
/codify-pr-history 90 --refresh-stack
```text

### 2. Examples Too Generic

**Cause**: Rule generator doesn't have enough context about your specific setup.

**Solution**: During interactive wording review, edit examples to match your codebase:

- Choose "Edit wording" option
- Modify examples to use your actual imports, patterns, conventions

### 3. Wrong Tech Stack Detected

**Check**: `red-flags.json` shows wrong framework

**Solution**: Manually edit red-flags.json or file an issue (tech stack detection can be improved).

---

## Pattern Triage Seems Wrong

**Symptoms**:

- Pattern marked "already covered" but you don't have that rule
- Pattern marked "new" but rule exists

**Causes & Solutions**:

### 1. Existing Rules Not Detected

**Check**: Are your instruction files in expected locations?

Default paths:

- `../copilot-review-demo/.github/copilot-instructions.md`
- `../copilot-review-demo/backend/backend.instructions.md`
- `../copilot-review-demo/frontend/frontend.instructions.md`

**Solution**: Edit `config/defaults.json` to point to your actual instruction file paths.

### 2. Rule Titles Don't Match

**Cause**: Existing rule titled differently (e.g., "SQL Safety" vs "SQL Injection Prevention")

**Solution**: During interactive pattern review, override the triage decision:

- Pattern marked "new" → Choose "Actually already covered"
- Pattern marked "covered" → Choose "Strengthen anyway"

### 3. Rule Parser Missed It

**Cause**: Existing rule in unusual format (not markdown headers)

**Solution**: Override during review, and consider reformatting your instruction files for better parsing.

---

## Preprocessing Taking Too Long

**Symptoms**:

- Comment preprocessing stage stuck for 5+ minutes
- High CPU usage

**Causes & Solutions**:

### 1. Too Many Comments

**Check**: How many comments were fetched?

If 1000+ comments, preprocessing can be slow.

**Solution**:

- Use shorter date range (30 days)
- Increase min comment length (filters more out)

### 2. Semantic Grouping Overused

**Cause**: Phase 3 (LLM-based) is slow for many edge cases.

**Solution**: Increase semantic threshold to rely more on fuzzy matching:

```json
{
  "defaultSemanticThreshold": 0.90  // Up from 0.85
}
```text

---

## Rule Application Failed

**Symptoms**:

```text
Error: Could not apply rule to backend/backend.instructions.md
```text

**Causes & Solutions**:

### 1. File Not Found

**Check**: Does the target instruction file exist?

```bash
ls -la copilot-review-demo/backend/backend.instructions.md
```text

**Solution**: Create the file first or edit file paths in config.

### 2. Section Not Found

**Cause**: Rule wants to insert into section that doesn't exist (e.g., "Database Operations")

**Solution**: During wording review:

- Choose "Change target"
- Specify different section
- Or choose to create new section

### 3. Edit Conflict

**Cause**: File modified since last read

**Solution**: Re-run the skill (it will re-read the files).

---

## Git Commit Failed

**Symptoms**:

```text
Error: Unable to create commit
```text

**Causes & Solutions**:

### 1. Uncommitted Changes

**Check**: Are there uncommitted changes?

```bash
git status
```text

**Solution**: Commit or stash existing changes first.

### 2. Git Not Configured

**Check**: Is git user configured?

```bash
git config user.name
git config user.email
```text

**Solution**: Configure git:

```bash
git config user.name "Your Name"
git config user.email "your@email.com"
```text

### 3. No Changes to Commit

**Cause**: All rules were rejected or failed to apply.

**Solution**: This is expected if no rules were applied. No commit needed.

---

## Performance Issues

**Symptoms**:

- Skill very slow
- Taking 10+ minutes for 90 days

**Expected Performance Timing**:

### First Run (90 days):
- Stack analysis: 30 seconds
- Fetch: 2 minutes (45 PRs)
- Preprocess: 1 minute
- Analyze: 1 minute
- Total: ~5-10 minutes (+ user interaction time)

### Later Runs (30 days) with Cache:
- Stack analysis: SKIPPED (cached)
- Fetch: 30 seconds (15 PRs)
- Preprocess: 20 seconds
- Analyze: 30 seconds
- Total: ~2-3 minutes (+ user interaction time)

**Pattern Evolution Tracking**:

The system tracks how patterns improve over time:

```json
{
  "patterns": {
    "sql-injection": {
      "firstSeen": "2025-09-30",
      "occurrences": [
        {"date": "2025-09-30", "count": 12, "action": "none"},
        {"date": "2025-10-15", "count": 8, "action": "strengthened"},
        {"date": "2025-10-30", "count": 2, "action": "none"}
      ],
      "trend": "improving"
    }
  }
}
```

This shows that strengthening the SQL injection rule reduced occurrences from 12 → 8 → 2 over time, demonstrating the effectiveness of codified rules.

**Solutions**:

### 1. Reduce Scope

```bash
/codify-pr-history 30  # Faster
```text

### 2. Use Incremental Mode

After first run, use shorter ranges (30 days) more frequently.

### 3. Check Network

gh CLI calls can be slow with poor network. Check internet connection.

---

## Context Overflow

**Symptoms**:

```text
Error: Token limit exceeded
```text

**Cause**: Subagent received too much data.

**Solutions**:

### 1. Shorter Date Range

Fewer PRs = less data to process.

### 2. Stricter Filters

```json
{
  "minCommentLength": 30,  // Up from 20
  "defaultMinOccurrences": 4  // Up from 3
}
```text

### 3. Report Issue

If this happens with reasonable settings (90 days, normal repo), this is a bug - please report.

---

## Unexpected Results

### Pattern Frequency Seems Wrong

**Check**: Look at actual comment examples in preprocessed-comments.json:

```bash
cat .workspace/codify-pr-history/runs/[timestamp]/02-preprocess/preprocessed-comments.json | jq '.commentGroups[0]'
```text

Verify the grouping makes sense.

### Generated Rule Irrelevant

**Solution**: During wording review, reject the rule. Not all patterns need automation.

### Red Flag Not Surfaced

**Check**: Does red-flags.json include the pattern?

```bash
cat .workspace/codify-pr-history/config/red-flags.json | jq '.redFlags'
```text

**Solution**: Manually add to red flags list, or use --refresh-stack.

---

## Getting Help

If issues persist:

1. **Check run logs**:

   ```text
   .workspace/codify-pr-history/runs/[timestamp]/logs/run.log
   ```

1. **Review generated data**:
   - pr-comments.json (what was fetched?)
   - preprocessed-comments.json (how was it grouped?)
   - patterns.json (what patterns were found?)

1. **File an issue**: Include:
   - Command used
   - Error message
   - Relevant portions of run log
   - Repository size/PR count (approximate)

---

## Common Misunderstandings

### "Why are some patterns marked 'already covered'?"

The skill compares to existing Copilot instruction files. If a rule exists, even if it's not perfect, it's
marked as covered. You can override and choose to strengthen it.

### "Why only 3 occurrences minimum?"

Based on research, patterns appearing 3+ times across 90 days indicate systematic issues worth automating.
Lower thresholds (1-2) often catch one-off issues or noisy comments.

### "Will this eliminate all review comments?"

No. Copilot has ~70% adherence to custom instructions. This reduces repetitive comments but won't catch
everything. Human review is still essential.

### "Can I run this on multiple repositories?"

Currently designed for single repository. For multiple repos:

- Run separately for each repo
- Merge patterns manually if desired
- Or: request multi-repo support as feature

---

## See Also

- [workflow-overview.md](workflow-overview.md) - Complete workflow explanation
- [pattern-analysis-guide.md](pattern-analysis-guide.md) - How triage works
- [interactive-review-guide.md](interactive-review-guide.md) - Approval process
