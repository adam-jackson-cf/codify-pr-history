# Rule Generation Guide

How approved patterns are converted into well-formatted Copilot instruction rules.

## Purpose

Transform approved patterns into:

- NEW rules (created from scratch)
- STRENGTHENED rules (enhancements to existing)

Both include good/bad code examples in proper markdown format.

---

## Configuration

### Run-Specific Configuration

Each run receives these parameters at invocation:

```json
{
  "patternsPath": ".workspace/codify-pr-history/runs/2025-10-30_143022/04-approve/patterns-approved.json",
  "instructionFiles": {
    "repository": "../copilot-review-demo/.github/copilot-instructions.md",
    "backend": "../copilot-review-demo/backend/backend.instructions.md",
    "frontend": "../copilot-review-demo/frontend/frontend.instructions.md"
  },
  "promptPath": "prompts/rule-generation.md",
  "outputDir": ".workspace/codify-pr-history/runs/2025-10-30_143022/05-generate/drafts/"
}
```

### Output File Structure

Draft rules are saved to `05-generate/drafts/` with this naming pattern:

```text
draft-{target}-{action}-{pattern-id}.md

Examples:
- draft-backend-NEW-rate-limiting.md
- draft-backend-STRENGTHEN-sql-injection.md
- draft-frontend-NEW-react-keys.md
- draft-repository-NEW-error-handling.md
```

Each draft file contains:

```markdown
# Rule: {title}

Generated from pattern: {pattern-id}
Action: {create|strengthen}
Target file: {path}
Target section: {section}

## Generated Rule

{markdown content with examples}

## Pattern Context

Frequency: {number}
Severity: {critical|high|medium|low}
Category: {category}
Examples from PRs: {count}
```

### Rule Formatting Standards

All generated rules follow this structure:

```markdown
## {Descriptive Title}

{Brief description of the issue and why it matters}

- ALWAYS {positive directive}
- NEVER {negative directive}
- CONSIDER {optional best practice}

❌ BAD:
```{language}
{problematic code}
```

✅ GOOD:
```{language}
{corrected code}
```

{Additional context or edge cases if needed}
```

## Two Generation Modes

### Mode 1: Create New Rule

For patterns with `action="create"`:

**Input**: Pattern with no existing rule

**Output**: Complete markdown rule with:

- Title (## heading)
- Directives (ALWAYS/NEVER statements with positive phrasing)
- Bad example (❌ with code block)
- Good example (✅ with code block)
- Optional notes or additional context

**Example**:

```markdown
## Rate Limiting for Authentication Endpoints

- ALWAYS implement rate limiting on authentication endpoints
- Use 5 attempts per 15 minutes for login/signup/password-reset
- Return 429 Too Many Requests when limit exceeded

❌ BAD:
\`\`\`typescript
app.post('/api/login', async (req, res) => {
  const user = await authenticateUser(req.body);
  res.json({ token: generateToken(user) });
});
\`\`\`

✅ GOOD:
\`\`\`typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});

app.post('/api/login', authLimiter, async (req, res) => {
  const user = await authenticateUser(req.body);
  res.json({ token: generateToken(user) });
});
\`\`\`
```text

**Target file**: `backend/backend.instructions.md`
**Section**: "Security Requirements" or create new

### Mode 2: Strengthen Existing Rule

For patterns with `action="strengthen"`:

**Input**: Pattern + existing rule content

**Output**: Enhancement to add after existing content (preserves original)

**Example**:

```markdown
# STRENGTHEN: SQL Injection Prevention (backend)

## Current Rule Location
File: backend/backend.instructions.md
Section: Database Operations

## Proposed Enhancement
Add these examples after existing content:

### LIKE Queries with Wildcards

❌ BAD:
\`\`\`typescript
const search = \`SELECT * FROM tasks WHERE title LIKE '%${term}%'\`;
\`\`\`

✅ GOOD:
\`\`\`typescript
const search = \`SELECT * FROM tasks WHERE title LIKE ?\`;
db.query(search, [\`%${term}%\`]);
\`\`\`

### IN Clauses with Arrays

❌ BAD:
\`\`\`typescript
const query = \`SELECT * FROM users WHERE id IN (${ids.join(',')})\`;
\`\`\`

✅ GOOD:
\`\`\`typescript
const placeholders = ids.map(() => '?').join(',');
const query = \`SELECT * FROM users WHERE id IN (${placeholders})\`;
db.query(query, ids);
\`\`\`
```text

## Rule Writing Principles

### Positive Directives (CRITICAL)

**ALWAYS use positive directives** - This is essential for effective Copilot instructions:

❌ Avoid: "Don't concatenate user input"
✅ Good: "Use parameterized queries with ? placeholders"

❌ Avoid: "Never use any type"
✅ Good: "Use specific types or unknown instead of any"

❌ Avoid: "Don't forget error handling"
✅ Good: "Always wrap async operations in try-catch blocks"

**Why**: Positive directives are more actionable and help Copilot generate better code.

### Specificity

❌ Vague: "Use secure password hashing"
✅ Specific: "Use bcrypt.hash (async) with minimum 10 salt rounds"

❌ Vague: "Handle errors properly"
✅ Specific: "Wrap all async operations in try-catch blocks and log errors with context"

### Examples Match Stack

If project uses Prisma:
✅ Show Prisma syntax
❌ Don't show raw SQL

If project uses Express.js:
✅ Show Express middleware patterns
❌ Don't show generic Node.js patterns

### Teaching Value

Examples should demonstrate:

- WHY (not just what)
- Common mistakes
- Correct implementation
- Edge cases when relevant

## Target File Determination

**Decision tree**:

- Security + detailed → `.vscode/rules/security-patterns.md`
- Backend/API → `backend/backend.instructions.md`
- Frontend/React → `frontend/frontend.instructions.md`
- Universal → `.github/copilot-instructions.md`
- Testing → `.vscode/rules/testing-standards.md`
- Language-specific pattern → `.github/instructions/{language}.instructions.md` (path-scoped)

## Path-Scoped Instruction Files

**When to use**: When a rule applies to a specific file pattern (e.g., only TypeScript files, only test files)

**Format**:
- Place in `.github/instructions/` directory
- Name format: `{name}.instructions.md` (e.g., `typescript.instructions.md`, `tests.instructions.md`)
- Include `applyTo` frontmatter with glob pattern

**Example**:

```markdown
---
applyTo: "**/*.ts"
---
# TypeScript Coding Standards

This file defines our TypeScript coding conventions for Copilot code review.

## Naming Conventions
- Use `camelCase` for variables and functions
- Use `PascalCase` for class and interface names

## Code Style
- Prefer `const` over `let` when variables are not reassigned
- Avoid using `any` type; specify more precise types whenever possible

## Error Handling
- Always handle promise rejections with `try/catch` or `.catch()`

## Example

❌ BAD:
```typescript
async function FetchUser(Id) {
  // ...fetch logic, no error handling
}
```

✅ GOOD:
```typescript
const fetchUser = async (id: number): Promise<User> => {
  try {
    // ...fetch logic
  } catch (error) {
    // handle error
  }
};
```
```

**Benefits**:
- More targeted than repository-level files
- Can have different rules for different parts of codebase
- Reduces file length by splitting concerns

## File Length Considerations

**Important**: Instruction files should be kept under 4000 characters for optimal effectiveness.

**Before adding new rules**:
1. Check current file length
2. If file exceeds 4000 characters:
   - Consider splitting into path-scoped instruction files
   - Remove redundant or less critical rules
   - Summarise overlapping instructions
   - Prioritise shortening before adding new content

**Warning threshold**: Alert when files approach 3500 characters

## Unsupported Content

**DO NOT include** the following types of content in custom instructions:

- ❌ **Comment formatting directives** - Instructions to change Copilot code review comment formatting (font, font size, adding headers, etc.)
- ❌ **PR Overview modifications** - Instructions to change "PR Overview" comment content
- ❌ **Product behaviour changes** - Instructions for product behaviour changes outside of existing code review functionality (e.g., trying to block a pull request from merging)
- ❌ **Vague, non-specific directives** - Avoid directives like "be more accurate", "identify all issues", or similar non-actionable instructions
- ❌ **External links or references** - Directives to "follow links" or inclusion of any external links (instructions should be self-contained)

**Focus on**: Code review criteria and coding standards rather than attempting to customise the review interface or workflow.

**Validation**: Rule generation should check for and reject unsupported content types.

## Output Files

**Generated rules saved to**:

```text
.workspace/codify-pr-history/runs/[timestamp]/05-generate/drafts/

draft-backend-NEW-rate-limiting.md
draft-backend-STRENGTHEN-sql-injection.md
draft-frontend-NEW-react-keys.md
...
```text

Plus metadata:

```json
{
  "generatedAt": "2025-10-30T14:42:10Z",
  "totalRules": 8,
  "distribution": {
    "backend": 3,
    "repository": 2,
    "frontend": 2,
    "vscode-security": 1
  }
}
```text

## Recommended Structure for New Instruction Files

When creating new instruction files, follow this structure (from GitHub Copilot best practices):

```markdown
---
applyTo: "**/*.ts"  # For path-specific files only
---
# [Language/Framework] Coding Standards

Brief description of what this file defines for Copilot code review.

## Naming Conventions
- [Add rules here]

## Code Style
- [Add rules here]

## Error Handling
- [Add rules here]

## Testing
- [Add rules here]

## Security
- [Add rules here]

## Example

```[language]
// Good
[correct pattern]

// Bad
[incorrect pattern]
```

---

## Framework-Specific Rules (Optional)
- [Add any relevant rules for frameworks, libraries, or tooling]

## Advanced Tips & Edge Cases (Optional)
- [Document exceptions, advanced patterns, or important caveats]
```

**Key points**:
- Start with a brief description of the file's purpose
- Organise rules into logical sections (Naming, Style, Error Handling, Testing, Security)
- Include code examples showing correct vs. incorrect patterns
- Add optional sections for framework-specific rules or edge cases
- For path-specific files, include the `applyTo` frontmatter property

## See Also

- [pattern-analysis-guide.md](pattern-analysis-guide.md) - How patterns are identified
- [interactive-review-guide.md](interactive-review-guide.md) - How generated rules are reviewed
- [workflow-overview.md](workflow-overview.md) - Complete workflow
