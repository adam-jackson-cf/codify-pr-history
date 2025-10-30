# GitHub Copilot Code Review - Quick Reference

## 🚀 Quick Start Commands

```bash
# Setup project
chmod +x setup.sh && ./setup.sh

# Open in VS Code
code .

# Reload VS Code to activate custom instructions
# Cmd+Shift+P → "Reload Window"
```

---

## 📝 Custom Instructions - File Locations

| Level | File Path | Purpose |
|-------|-----------|---------|
| **Repository** | `.github/copilot-instructions.md` | Baseline standards for all code |
| **Backend Path** | `backend/backend.instructions.md` | API-specific rules |
| **Frontend Path** | `frontend/frontend.instructions.md` | React-specific rules |
| **VS Code Rules** | `.vscode/rules/*.md` | Organized by category |
| **Custom Prompts** | `.prompts/code-review.prompt.md` | Structured review format |

---

## 💬 Copilot Chat Commands

### Basic Review
```
Review this code for issues
```

### Targeted Reviews
```
Review this code for security vulnerabilities
Review this code for performance issues
Review this React component for accessibility
Check this code against our coding standards
```

### Using Custom Instructions
```
Review this code against our repository standards
Using the guidelines in .prompts/code-review.prompt.md, review this file
```

### Specific Checks
```
Check for SQL injection vulnerabilities
Check for missing error handling
Check for TypeScript type issues
Check for React best practices violations
```

---

## ⌨️ VS Code Keyboard Shortcuts

| Action | Mac | Windows/Linux |
|--------|-----|---------------|
| **Open Copilot Chat** | `Cmd + I` | `Ctrl + I` |
| **Select All** | `Cmd + A` | `Ctrl + A` |
| **Command Palette** | `Cmd + Shift + P` | `Ctrl + Shift + P` |
| **Reload Window** | Cmd+Shift+P → "Reload" | Ctrl+Shift+P → "Reload" |

---

## 📂 Project Structure Reference

```
copilot-review-demo/
├── .github/copilot-instructions.md       # Strategy #1
├── .vscode/
│   ├── settings.json                     # Copilot config
│   └── rules/                            # Strategy #3
├── .prompts/code-review.prompt.md        # Strategy #4
├── backend/
│   ├── backend.instructions.md           # Strategy #2
│   ├── src/good-examples/               # ✅ Learn from these
│   └── src/bad-examples/                # ❌ Practice on these
├── frontend/
│   ├── frontend.instructions.md          # Strategy #2
│   ├── src/good-examples/               # ✅ Learn from these
│   └── src/bad-examples/                # ❌ Practice on these
└── TUTORIAL.md                           # Start here!
```

---

## 🎯 The 4 Strategies

### 1️⃣ Repository-Level Instructions
**File:** `.github/copilot-instructions.md`
**Applies to:** All code in the repository
**Use for:** Error handling, logging, security basics

### 2️⃣ Path-Scoped Instructions
**Files:** `backend.instructions.md`, `frontend.instructions.md`
**Applies to:** Specific directories
**Use for:** Backend patterns (SQL, APIs) vs Frontend patterns (React, a11y)

### 3️⃣ VS Code Rule Files
**Location:** `.vscode/rules/`
**Applies to:** VS Code environment
**Use for:** Organized rules by category (security, testing, etc.)

### 4️⃣ Custom Review Prompts
**File:** `.prompts/code-review.prompt.md`
**Applies to:** When explicitly referenced
**Use for:** Structured, prioritized review output

---

## 🔍 Common Security Checks

### SQL Injection
```typescript
// ❌ BAD
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ GOOD
const query = `SELECT * FROM users WHERE id = ?`;
db.get(query, [userId], callback);
```

### Hardcoded Secrets
```typescript
// ❌ BAD
const JWT_SECRET = 'my-secret-key';

// ✅ GOOD
const JWT_SECRET = process.env.JWT_SECRET;
```

### Password Hashing
```typescript
// ❌ BAD
const hash = bcrypt.hashSync(password, 5); // Sync + weak rounds

// ✅ GOOD
const hash = await bcrypt.hash(password, 10); // Async + proper rounds
```

---

## ⚛️ React Best Practices

### Prop Types
```typescript
// ❌ BAD
function MyComponent(props: any) { }

// ✅ GOOD
interface MyComponentProps {
  title: string;
  onSave: () => void;
}
function MyComponent({ title, onSave }: MyComponentProps) { }
```

### Form Validation
```typescript
// ❌ BAD
const email = document.getElementById('email').value; // Direct DOM

// ✅ GOOD
const [email, setEmail] = useState('');
<input value={email} onChange={(e) => setEmail(e.target.value)} />
```

### Accessibility
```typescript
// ❌ BAD
<div onClick={handleClick}>Submit</div>

// ✅ GOOD
<button onClick={handleClick} aria-label="Submit form">Submit</button>
```

---

## 📊 Priority Levels

| Symbol | Level | Examples |
|--------|-------|----------|
| 🔥 | **Critical** | SQL injection, hardcoded secrets, data loss |
| 🔴 | **High** | Missing error handling, broken auth, XSS |
| 🟡 | **Medium** | Type safety, performance, code quality |
| 🟢 | **Low** | Minor improvements, style consistency |
| ⚪ | **Info** | Suggestions, best practices, TODOs |

---

## 🛠️ Troubleshooting

### Copilot Not Using Instructions
1. Save the instruction file
2. Reload VS Code window (`Cmd/Ctrl + Shift + P` → "Reload Window")
3. Verify file path in settings is correct
4. Check Copilot extension is up-to-date

### Reviews Too Generic
- Be more specific in prompts: "Check for SQL injection" vs "Review this"
- Add concrete examples to your instruction files
- Reference specific rules: "Check against our error handling standards"

### Too Many False Positives
- Refine rules to be more specific
- Add examples of acceptable patterns
- Use conditional rules: "When using Express, use helmet.js"

---

## 📋 Review Checklist

### Backend Code
- [ ] All database queries use parameterized values (no SQL injection)
- [ ] All async operations have try-catch error handling
- [ ] No hardcoded secrets (use environment variables)
- [ ] Proper HTTP status codes returned
- [ ] Input validation on all user-provided data
- [ ] Authorization checks before accessing resources

### Frontend Code
- [ ] All components have proper TypeScript prop interfaces
- [ ] No usage of `any` type
- [ ] Form inputs are controlled (value + onChange)
- [ ] Loading and error states displayed
- [ ] Accessibility attributes present (labels, aria, roles)
- [ ] Event handlers use useCallback
- [ ] List items have key props

---

## 🎓 Learning Path

1. **Day 1:** Complete Tutorial Exercise 1-2 (baseline + repo rules)
2. **Day 2:** Complete Tutorial Exercise 3-4 (path-scoped rules)
3. **Day 3:** Complete Tutorial Exercise 5-6 (custom prompts + auto reviews)
4. **Week 2:** Adapt examples to your tech stack
5. **Week 3:** Roll out to team, gather feedback
6. **Ongoing:** Refine rules based on what Copilot misses

---

## 🔗 Useful Prompts Library

### For Security Reviews
```
Review this authentication code for security vulnerabilities
Check for common OWASP Top 10 vulnerabilities
Are there any timing attack vulnerabilities in this code?
Check for proper input sanitization
```

### For Performance Reviews
```
Review this code for performance issues
Check for N+1 query problems
Are there any unnecessary re-renders in this React component?
Check for memory leaks
```

### For Accessibility
```
Review this component for accessibility issues
Check for WCAG 2.1 Level AA compliance
Are all interactive elements keyboard accessible?
Check for proper ARIA attributes
```

### For Testing
```
Review test coverage for this function
Are these tests following the AAA pattern?
Check for proper mocking of dependencies
Are there any missing edge cases in these tests?
```

---

## 📚 Key Documentation Links

- **GitHub Copilot Code Review Docs:** https://docs.github.com/en/copilot/concepts/agents/code-review
- **Coding Guidelines:** https://docs.github.com/en/copilot/concepts/code-review/coding-guidelines
- **VS Code Copilot:** https://code.visualstudio.com/docs/copilot/copilot-customization
- **Latest Features (Oct 2025):** https://github.blog/changelog/2025-10-28-new-public-preview-features-in-copilot-code-review-ai-reviews-that-see-the-full-picture/

---

## 💡 Pro Tips

1. **Start Small:** Begin with 5-10 critical rules, expand later
2. **Be Specific:** "Use parameterized queries" > "Be secure"
3. **Use Examples:** Show both good and bad code in instructions
4. **Iterate:** Update rules weekly based on what Copilot misses
5. **Combine Strategies:** Use all 4 strategies together for best results
6. **Test First:** Try on past PRs before enabling automatic reviews
7. **Human Oversight:** Always have human reviewers as final check

---

## 🎬 Quick Demo Flow

**5-Minute Demo:**
1. Open `backend/src/bad-examples/authService.bad.ts`
2. Select all, ask Copilot: "Review for security issues"
3. Show hardcoded secret and sync bcrypt caught
4. Open `.github/copilot-instructions.md` to show rules
5. Review again → more issues caught!

**15-Minute Demo:**
1. Do 5-minute demo above
2. Open `backend/src/bad-examples/taskService.bad.ts`
3. Show SQL injection vulnerability
4. Open `backend.instructions.md` to show SQL rules
5. Review → SQL injection caught!
6. Compare with good example in `taskService.ts`

---

## 📞 Need Help?

- **Tutorial:** Work through TUTORIAL.md step-by-step
- **Video Script:** Use VIDEO-SCRIPT.md for presentations
- **GitHub Copilot Support:** https://github.com/orgs/community/discussions/categories/copilot
- **This Demo:** Adapt files to your team's needs

---

**Remember:** GitHub Copilot catches ~70% of issues. It's a powerful first pass, but not a replacement for human review!
