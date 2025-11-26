# Copilot Instruction Rule Template

Use this template when creating new Copilot instruction rules.

## For Path-Scoped Instruction Files

If creating a new path-scoped instruction file (`.github/instructions/*.instructions.md`), include frontmatter:

```markdown
---
applyTo: "**/*.ts"
---
# [Language/Framework] Coding Standards

Brief description of what this file defines for Copilot code review.
```

## Recommended File Structure

For new instruction files, follow this structure:

```markdown
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

## Code Examples

❌ BAD:
\`\`\`[language]
// Example of incorrect implementation
\`\`\`

✅ GOOD:
\`\`\`[language]
// Example of correct implementation
\`\`\`

---

## Framework-Specific Rules (Optional)
- [Add any relevant rules for frameworks, libraries, or tooling]

## Advanced Tips & Edge Cases (Optional)
- [Document exceptions, advanced patterns, or important caveats]
```

## Individual Rule Template

For adding a single rule to an existing file:

## Rule Title

- ALWAYS [positive directive - what to do]
- NEVER [what to avoid, if critical]
- [Additional context or specifics]

❌ BAD:
\`\`\`[language]
// Example of incorrect implementation
// Show the anti-pattern
\`\`\`

✅ GOOD:
\`\`\`[language]
// Example of correct implementation
// Show the proper pattern
\`\`\`

**Note**: [Optional additional notes, edge cases, or context]

---

## Guidelines

1. **Positive framing**: "Use X" not "Don't use Y" - ALWAYS use positive directives
2. **Specific**: Include concrete details, not vague advice
3. **Examples**: Always include both bad and good code
4. **Language**: Match your project's tech stack
5. **Concise**: 2-3 directives, 1-2 examples each
6. **File length**: Keep files under 4000 characters for optimal effectiveness
7. **Unsupported content**: Do NOT include formatting directives, PR Overview changes, product behaviour modifications, vague directives, or external links

## Example

## SQL Injection Prevention

- ALWAYS use parameterized queries or prepared statements
- Use `?` placeholders for all dynamic values in SQL queries
- NEVER concatenate user input directly into query strings

❌ BAD:
\`\`\`typescript
const query = \`SELECT * FROM users WHERE id = ${userId}\`;
db.all(query, callback);
\`\`\`

✅ GOOD:
\`\`\`typescript
const query = \`SELECT * FROM users WHERE id = ?\`;
db.all(query, [userId], callback);
\`\`\`

**Note**: Table and column names cannot be parameterized; validate them separately using a whitelist approach.

---

## Important Warnings

### Unsupported Content

**DO NOT include** in custom instructions:
- Comment formatting directives (font, font size, headers)
- PR Overview modifications
- Product behaviour changes (e.g., blocking PRs)
- Vague, non-specific directives ("be more accurate")
- External links or references

### File Length

- Keep instruction files under 4000 characters
- If a file is too long, consider splitting into path-scoped files
- Prioritise removing redundant content before adding new rules
