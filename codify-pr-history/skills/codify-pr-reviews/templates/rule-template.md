# Copilot Instruction Rule Template

Use this template when creating new Copilot instruction rules.

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

1. **Positive framing**: "Use X" not "Don't use Y"
2. **Specific**: Include concrete details, not vague advice
3. **Examples**: Always include both bad and good code
4. **Language**: Match your project's tech stack
5. **Concise**: 2-3 directives, 1-2 examples each

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
