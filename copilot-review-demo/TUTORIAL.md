# GitHub Copilot Code Review Tutorial

This hands-on tutorial will teach you how to use GitHub Copilot's code review features with custom instructions to enforce your team's coding standards.

## Prerequisites

- GitHub Copilot subscription (Individual, Business, or Enterprise)
- VS Code with GitHub Copilot extension installed
- Node.js 18+ installed
- Git installed
- Basic knowledge of TypeScript and React

## Setup

Run the setup script to initialize the project:

```bash
chmod +x setup.sh
./setup.sh
```

This will install dependencies and set up the project structure.

---

## Exercise 1: Baseline Review (No Custom Rules)

**Objective:** See what Copilot catches without any custom instructions.

### Steps

1. Open the bad backend auth service:
   ```
   backend/src/bad-examples/authService.bad.ts
   ```

2. In VS Code, open GitHub Copilot Chat (Cmd+I or Ctrl+I)

3. Select all the code in the file (Cmd+A / Ctrl+A)

4. Ask Copilot: "Review this code for issues and security problems"

### Expected Outcome

Copilot should identify some issues:
- ✅ Hardcoded secrets
- ✅ Synchronous bcrypt (blocking)
- ⚠️ May miss: Using `any` types
- ⚠️ May miss: Missing try-catch blocks
- ⚠️ May miss: Weak salt rounds

### Observation

Without custom instructions, Copilot provides general feedback but may miss project-specific standards.

---

## Exercise 2: Add Repository-Level Instructions

**Objective:** Create repository-wide coding standards that apply to all code.

### Steps

1. The file `.github/copilot-instructions.md` already exists with standards

2. Review the contents to understand what rules we've defined:
   - Error handling requirements
   - Security requirements (no hardcoded secrets)
   - Testing standards
   - Logging requirements

3. Reload VS Code window (Cmd+Shift+P → "Reload Window") to ensure Copilot picks up the instructions

4. Go back to `backend/src/bad-examples/authService.bad.ts`

5. Select all code and ask Copilot: "Review this code against our repository standards"

### Expected Outcome

Now Copilot should catch MORE issues:
- ✅ Hardcoded JWT secret (violates security requirements)
- ✅ Missing try-catch blocks (violates error handling requirements)
- ✅ Using `any` types (violates TypeScript strict mode requirement)
- ✅ Synchronous operations (violates async/await preference)

### Key Takeaway

Repository-level instructions provide baseline standards that apply everywhere. This is perfect for cross-cutting concerns like error handling, logging, and security.

---

## Exercise 3: Add Backend Path-Scoped Instructions

**Objective:** Add backend-specific rules for API code.

### Steps

1. Open `backend/backend.instructions.md` and review the backend-specific rules:
   - SQL injection prevention
   - HTTP status code requirements
   - Rate limiting requirements
   - Database operation standards

2. Now open the bad task service:
   ```
   backend/src/bad-examples/taskService.bad.ts
   ```

3. Select all code and ask Copilot: "Review this code for security vulnerabilities"

### Expected Outcome

Copilot should now catch backend-specific issues:
- 🔥 **CRITICAL**: SQL injection via string concatenation
- 🔥 **CRITICAL**: No parameterized queries
- 🔴 **HIGH**: Missing authorization checks
- 🔴 **HIGH**: No error handling
- 🟡 **MEDIUM**: Using `any` types

### Key Takeaway

Path-scoped instructions let you enforce different standards for different parts of your codebase. Backend code has different concerns (SQL injection, HTTP codes) than frontend code (accessibility, React patterns).

---

## Exercise 4: Add Frontend Path-Scoped Instructions

**Objective:** Add React/frontend-specific rules.

### Steps

1. Review `frontend/frontend.instructions.md` for React-specific standards:
   - Component prop typing requirements
   - Form validation requirements
   - Accessibility standards
   - React hooks best practices

2. Open the bad frontend component:
   ```
   frontend/src/bad-examples/components/TaskList.bad.tsx
   ```

3. Select all code and ask Copilot: "Review this React component for issues"

### Expected Outcome

Copilot should catch frontend-specific issues:
- 🔴 **HIGH**: Missing key props in lists
- 🔴 **HIGH**: Missing accessibility attributes
- 🔴 **HIGH**: Using `any` for prop types
- 🟡 **MEDIUM**: Prop drilling 5+ levels deep
- 🟡 **MEDIUM**: Inline styles instead of CSS
- 🟡 **MEDIUM**: Not using useCallback (performance)
- 🟢 **LOW**: Using div as button

### Key Takeaway

Frontend code has unique concerns around accessibility, React patterns, and user experience. Path-scoped instructions ensure these are checked specifically for UI code.

---

## Exercise 5: Use Custom Review Prompt

**Objective:** Use a structured prompt for comprehensive, prioritized reviews.

### Steps

1. Review the custom prompt file:
   ```
   .prompts/code-review.prompt.md
   ```

   This defines:
   - Categories of issues to check (Security, Error Handling, Code Quality, etc.)
   - Output format with priority levels
   - Specific focus areas for backend vs frontend

2. Get git diff of bad examples (simulating a PR):
   ```bash
   cd backend/src
   ```

3. In Copilot Chat, reference the prompt file and ask for a review:
   ```
   Using the guidelines in ../../.prompts/code-review.prompt.md, review the file bad-examples/taskService.bad.ts
   ```

### Expected Outcome

You should get structured, prioritized feedback:

```
[🔥 Critical] Security: SQL Injection Vulnerability (taskService.bad.ts:45)

Description: User input is concatenated directly into SQL query

Current Code:
const query = `SELECT * FROM tasks WHERE title LIKE '%${searchTerm}%'`;

Suggested Fix:
const query = `SELECT * FROM tasks WHERE title LIKE ?`;
db.all(query, [`%${searchTerm}%`], ...);

Impact: Allows attackers to execute arbitrary SQL commands
```

### Key Takeaway

Custom prompts give you fine-grained control over review format, priorities, and categories. This is great for creating consistent review experiences across your team.

---

## Exercise 6: Configure Automatic PR Reviews

**Objective:** Set up automatic Copilot reviews on pull requests.

### Steps

1. Initialize a git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit with code examples"
   ```

2. Create a feature branch with bad code:
   ```bash
   git checkout -b feature/add-user-endpoints
   git add backend/src/bad-examples/
   git commit -m "Add user authentication endpoints"
   ```

3. Push to GitHub (you'll need to create a repo first):
   ```bash
   # Create a repo on GitHub first, then:
   git remote add origin <your-repo-url>
   git push -u origin main
   git push origin feature/add-user-endpoints
   ```

4. On GitHub, configure automatic reviews:
   - Go to Settings → Rules → Rulesets
   - Create new ruleset
   - Enable "Require Copilot code review"
   - Apply to all branches or specific patterns

5. Create a Pull Request from your feature branch

6. Wait for Copilot to automatically review the PR

### Expected Outcome

Copilot will:
1. Automatically review your PR within minutes
2. Leave comments on specific lines with issues
3. Reference your custom instructions in its feedback
4. Provide actionable suggestions for fixes

### Key Takeaway

Automatic PR reviews ensure every pull request gets an AI review before human reviewers spend time on it. This catches common issues early and makes code review more efficient.

---

## Comparing Good vs Bad Examples

Now that you've seen Copilot catch issues in bad code, compare with the good examples:

### Backend Comparison

Open side-by-side:
- `backend/src/bad-examples/taskService.bad.ts`
- `backend/src/good-examples/taskService.ts`

Ask Copilot: "What are the key differences between these two implementations?"

**Key improvements in good example:**
- ✅ Parameterized queries prevent SQL injection
- ✅ Try-catch blocks for error handling
- ✅ Proper TypeScript typing
- ✅ Authorization checks
- ✅ Logging of security events

### Frontend Comparison

Open side-by-side:
- `frontend/src/bad-examples/components/LoginForm.bad.tsx`
- `frontend/src/good-examples/components/LoginForm.tsx`

Ask Copilot: "What are the key differences between these two implementations?"

**Key improvements in good example:**
- ✅ Proper TypeScript interfaces for props
- ✅ Controlled form inputs with validation
- ✅ Loading and error states
- ✅ Accessibility attributes (labels, aria)
- ✅ CSS classes instead of inline styles

---

## Advanced Exercises

### Exercise 7: Create Your Own Rules

1. Create a new rule file: `.vscode/rules/performance-patterns.md`

2. Add rules like:
   ```markdown
   # Performance Patterns

   - Use React.memo() for expensive components
   - Implement virtualization for lists over 100 items
   - Use useCallback for event handlers passed as props
   - Avoid inline function definitions in JSX
   ```

3. Add it to `.vscode/settings.json`:
   ```json
   {
     "github.copilot.chat.reviewSelection.instructions": [
       { "file": ".vscode/rules/general-guidelines.md" },
       { "file": ".vscode/rules/security-patterns.md" },
       { "file": ".vscode/rules/testing-standards.md" },
       { "file": ".vscode/rules/performance-patterns.md" }
     ]
   }
   ```

4. Test on `frontend/src/bad-examples/components/TaskList.bad.tsx`

### Exercise 8: Test on Your Own Code

1. Copy some of your own code into the project

2. Ask Copilot to review it against the project standards

3. See what issues it catches

4. Refine your custom instructions based on what it misses

---

## Tips for Success

### Writing Effective Instructions

1. **Be Specific**: "Check for SQL injection" is better than "Check for security issues"

2. **Use Examples**: Show what you want and don't want
   ```markdown
   ❌ Bad: `const query = 'SELECT * FROM users WHERE id = ' + userId`
   ✅ Good: `const query = 'SELECT * FROM users WHERE id = ?'`
   ```

3. **Prioritize**: Focus on your top 10-15 rules, not everything

4. **Keep It Updated**: Add rules when you spot repeated issues in reviews

### Organizing Instructions

- **Repository-level** (`.github/copilot-instructions.md`): Error handling, logging, security basics
- **Path-scoped** (`backend.instructions.md`): API-specific patterns, database rules
- **Path-scoped** (`frontend.instructions.md`): React patterns, accessibility, UI rules
- **VS Code rules** (`.vscode/rules/`): Language-specific conventions, testing patterns

### Limitations to Keep in Mind

- Copilot has ~70% rule adherence (based on research)
- It's a first pass, not a replacement for human review
- Complex business logic still needs human judgment
- Some edge cases will be missed

---

## Next Steps

1. **Integrate into your workflow**: Start using Copilot reviews on every PR

2. **Refine your rules**: Track what Copilot misses and update instructions

3. **Share with your team**: Get everyone using the same standards

4. **Measure impact**: Track how many issues are caught before human review

5. **Iterate**: Continuously improve your custom instructions based on results

---

## Troubleshooting

### Copilot isn't using my instructions

1. Make sure the file is saved
2. Reload VS Code window (Cmd+Shift+P → "Reload Window")
3. Check file path in settings is correct
4. Verify you're using the latest Copilot extension

### Reviews are too generic

1. Add more specific examples to your instructions
2. Use targeted prompts instead of "review this code"
3. Reference specific rules: "Check this against our SQL injection prevention rules"

### Too many false positives

1. Refine your rules to be more specific
2. Add examples of acceptable patterns
3. Use "When X, do Y" format for conditional rules

---

## Resources

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Custom Instructions Guide](https://docs.github.com/en/copilot/concepts/code-review/coding-guidelines)
- [CHEAT-SHEET.md](./CHEAT-SHEET.md) - Quick reference for common commands
- [VIDEO-SCRIPT.md](./VIDEO-SCRIPT.md) - Presentation outline for demos

---

## Feedback

Found an issue or have a suggestion? This is a teaching demo - modify it to fit your needs!
