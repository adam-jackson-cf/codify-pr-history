# GitHub Copilot Code Review - Presentation Script

**Duration:** 20-25 minutes
**Audience:** Development teams, tech leads, managers
**Goal:** Demonstrate how to use GitHub Copilot for code reviews with custom instructions

---

## Slide 1: Title Slide (0:00 - 0:30)

**On Screen:**
> # Leveling Up Code Reviews with GitHub Copilot
> Enforcing Team Standards with AI

**Say:**
"Today I'm going to show you how to use GitHub Copilot's code review features to automatically enforce your team's coding standards. We'll see real examples of catching security vulnerabilities, enforcing best practices, and making code reviews more efficient."

**Setup Check:**
- VS Code open with project loaded
- GitHub Copilot Chat visible
- Terminal ready

---

## Slide 2: The Problem (0:30 - 2:00)

**On Screen:**
> # Current Code Review Challenges
> - Same comments on every PR ("missing error handling")
> - Security issues slip through (SQL injection, XSS)
> - Inconsistent standards across team members
> - Time-consuming for senior developers

**Say:**
"How many of you find yourselves leaving the same code review comments over and over? 'You forgot error handling.' 'This needs input validation.' 'Where's the TypeScript type?'"

"These repetitive issues waste time, and worse, critical security vulnerabilities sometimes slip through when reviewers are fatigued."

**Demo Note:** Show a real PR comment history if available, or skip to demo.

---

## Slide 3: The Solution (2:00 - 3:00)

**On Screen:**
> # GitHub Copilot Code Review
> - AI-powered automatic code review
> - Customizable with your team's standards
> - Catches issues before human reviewers
> - Works in VS Code and GitHub PRs

**Say:**
"GitHub Copilot now offers code review capabilities that you can customize with your own team's coding standards. It acts as a first-pass reviewer, catching common issues before your senior developers even look at the code."

"Let me show you how this works with a real example."

---

## Demo 1: The Problem - Code Without Custom Rules (3:00 - 5:00)

**Screen Share: VS Code**

**Say:**
"Let's start by looking at some backend authentication code. This is from our demo project."

**Actions:**
1. Open `backend/src/bad-examples/authService.bad.ts`

2. Scroll through the file slowly, pointing out:
   - Line 4-5: "Notice this hardcoded JWT secret"
   - Line 20: "Synchronous bcrypt calls that block the event loop"
   - Throughout: "We're using 'any' types everywhere"

3. **Say:** "Let's see what Copilot catches without any custom instructions."

4. Select all code (Cmd+A / Ctrl+A)

5. Open Copilot Chat (Cmd+I / Ctrl+I)

6. Type: "Review this code for issues"

7. **Pause** to show results

**Say:**
"Copilot caught the hardcoded secret and the synchronous bcrypt. But it missed several issues we care about - the 'any' types, missing try-catch blocks, and weak salt rounds."

**Time Check:** Should be around 5:00

---

## Demo 2: Adding Repository-Level Instructions (5:00 - 8:00)

**Screen Share: VS Code**

**Say:**
"Now let's add our team's coding standards. First, we'll add repository-wide rules that apply to all code."

**Actions:**
1. Open `.github/copilot-instructions.md`

2. Scroll through, highlighting key sections:
   - "Here we specify: all functions need error handling"
   - "No hardcoded credentials - everything from environment variables"
   - "TypeScript strict mode required"
   - "Password hashing with proper salt rounds"

3. **Say:** "These are baseline standards for our entire codebase."

4. Close the file and go back to `authService.bad.ts`

5. Reload VS Code window:
   - Press Cmd+Shift+P (Ctrl+Shift+P on Windows)
   - Type "Reload Window"
   - Press Enter

6. **Say:** "I need to reload VS Code so Copilot picks up the new instructions."

7. After reload, select all code again

8. Open Copilot Chat and ask: "Review this code against our repository standards"

9. **Pause** to show improved results

**Say:**
"Now look at this! Copilot is catching the 'any' types, the missing try-catch blocks, and referencing our specific requirements. It's applying OUR standards, not just generic best practices."

---

## Demo 3: SQL Injection Detection (8:00 - 11:00)

**Screen Share: VS Code**

**Say:**
"Now let's look at a critical security issue - SQL injection. This is the #1 web application vulnerability according to OWASP."

**Actions:**
1. Open `backend/src/bad-examples/taskService.bad.ts`

2. Scroll to line ~45 (the createTask function)

3. **Highlight this code:**
   ```typescript
   const query = `
     INSERT INTO tasks (userId, title, description, ...)
     VALUES (${userId}, '${title}', '${description}', ...)
   `;
   ```

4. **Say:** "See how we're concatenating user input directly into the SQL query? An attacker could pass a title like: `'; DROP TABLE tasks; --`"

5. **Say:** "Let's add backend-specific rules."

6. Open `backend/backend.instructions.md`

7. Scroll to SQL Injection Prevention section

8. **Read key rule:** "ALWAYS use parameterized queries. NEVER concatenate user input into SQL."

9. Go back to the bad file, select the createTask function

10. Ask Copilot: "Review this function for security vulnerabilities"

11. **Pause** to show it caught SQL injection

12. **Say:** "Copilot now specifically checks for SQL injection and even suggests the fix!"

13. Open `backend/src/good-examples/taskService.ts`

14. Show the good version (line ~50):
    ```typescript
    const query = `
      INSERT INTO tasks (userId, title, description, ...)
      VALUES (?, ?, ?, ...)
    `;
    const params = [userId, title, description, ...];
    await run(query, params);
    ```

15. **Say:** "This is the secure way - parameterized queries. The database handles escaping."

**Time Check:** Should be around 11:00

---

## Demo 4: Frontend React Patterns (11:00 - 14:00)

**Screen Share: VS Code**

**Say:**
"Custom instructions aren't just for security. Let's look at frontend code where we care about React patterns and accessibility."

**Actions:**
1. Open `frontend/src/bad-examples/components/LoginForm.bad.tsx`

2. Scroll through, pointing out issues:
   - "No TypeScript prop interface"
   - "Uncontrolled inputs - using direct DOM access"
   - "Password field is type='text' - shows password!"
   - "No validation"
   - "Missing accessibility attributes"

3. Open `frontend/frontend.instructions.md`

4. Highlight key rules:
   - "Use controlled components"
   - "Proper TypeScript prop interfaces"
   - "Accessibility attributes required"

5. Go back to bad file, select all

6. Ask Copilot: "Review this React component"

7. **Show results** - should catch:
   - Missing prop types
   - Uncontrolled inputs
   - No validation
   - Missing accessibility

8. Quick comparison: Split screen with `LoginForm.tsx` (good example)

9. **Point out improvements:**
   - "Proper interfaces"
   - "Controlled inputs with onChange"
   - "Validation before submission"
   - "Labels with htmlFor"
   - "aria attributes"

---

## Demo 5: Custom Review Prompts (14:00 - 16:30)

**Screen Share: VS Code**

**Say:**
"For even more control, you can create custom review prompts that structure the feedback exactly how you want it."

**Actions:**
1. Open `.prompts/code-review.prompt.md`

2. Scroll through, explaining:
   - "We define categories: Security, Error Handling, Code Quality"
   - "Priority levels from Critical to Info"
   - "Specific output format with code examples"

3. Go to `backend/src/bad-examples/taskService.bad.ts`

4. In Copilot Chat, say: "Using the guidelines in ../../.prompts/code-review.prompt.md, review this file"

5. **Show structured output** with priorities:
   ```
   🔥 Critical: SQL Injection
   🔴 High: Missing error handling
   🟡 Medium: Using any types
   ```

6. **Say:** "This makes it easy to prioritize what to fix first. Critical security issues, then bugs, then code quality."

---

## Slide 4: The 4 Strategies (16:30 - 18:00)

**On Screen:**
> # Four Custom Instruction Strategies
>
> 1. **Repository-Level** (.github/copilot-instructions.md)
>    → Baseline standards for all code
>
> 2. **Path-Scoped** (backend.instructions.md, frontend.instructions.md)
>    → Different rules for different parts of codebase
>
> 3. **VS Code Rules** (.vscode/rules/)
>    → Organized by category (security, testing, etc.)
>
> 4. **Custom Prompts** (.prompts/code-review.prompt.md)
>    → Structured, prioritized feedback format

**Say:**
"Let me summarize the four strategies we just saw:

One: Repository-level instructions apply to everything - error handling, logging, security basics.

Two: Path-scoped instructions let you have different rules for backend and frontend. Your API code needs SQL injection prevention. Your frontend needs accessibility checks.

Three: VS Code rule files organize standards by category - makes them easier to maintain.

Four: Custom prompts give you complete control over the review format and priorities."

---

## Slide 5: Automatic PR Reviews (18:00 - 20:00)

**On Screen:**
> # Automatic PR Reviews
> - Set up once in repository settings
> - Runs on every pull request
> - Uses your custom instructions
> - Leaves comments on specific lines
> - Runs before human reviewers

**Say:**
"The real power comes when you set up automatic reviews on pull requests."

**Actions (if possible to demo, otherwise just explain):**

1. **If you have a GitHub repo set up:**
   - Navigate to repository Settings → Rules → Rulesets
   - Show "Require Copilot code review" option
   - Show a PR with Copilot review comments

2. **If not, just say:**
   "Once configured, Copilot automatically reviews every pull request. It uses all the custom instructions we've set up and leaves comments directly on the code, just like a human reviewer would."

**Say:**
"This means your senior developers don't waste time catching basic issues. They can focus on architecture, business logic, and complex problems. The AI handles the repetitive stuff."

---

## Slide 6: Real-World Results (20:00 - 21:30)

**On Screen:**
> # Expected Results
> - ~70% adherence to custom rules (based on research)
> - Catches issues before human review
> - Reduces review time by 30-40%
> - More consistent standards across team
> - **Not a replacement** for human judgment

**Say:**
"Based on real-world usage, you can expect about 70% adherence to your custom rules. It's not perfect, but it's a great first pass.

Teams report reducing review time by 30-40% because simple issues are caught automatically. Senior developers can focus on what matters.

Importantly, this is NOT a replacement for human review. Complex business logic, architectural decisions, and edge cases still need human judgment. Think of Copilot as a junior reviewer - it catches the obvious stuff so humans can focus on the hard stuff."

---

## Slide 7: Getting Started (21:30 - 23:00)

**On Screen:**
> # Get Started
>
> **This Demo Project Includes:**
> - Complete codebase with good/bad examples
> - All custom instruction files
> - 6-exercise hands-on tutorial
> - Video script (this one!)
> - Cheat sheet for quick reference
>
> **Clone and try it:** [your-repo-url]

**Say:**
"Everything I showed you today is available in this demo project. It includes:

- A full-stack application with intentionally bad code for learning
- All the custom instruction files we looked at
- A tutorial with 6 hands-on exercises you can work through
- This presentation script
- And a cheat sheet for quick reference

I encourage you to clone it, work through the tutorial, and adapt it for your team's specific needs."

---

## Slide 8: Next Steps (23:00 - 24:00)

**On Screen:**
> # Next Steps for Your Team
>
> 1. **Start small** - Add 5-10 critical rules
> 2. **Test on recent PRs** - See what it catches
> 3. **Refine** - Update rules based on what it misses
> 4. **Enable automatic reviews** - On protected branches first
> 5. **Measure impact** - Track issues caught pre-human review
> 6. **Iterate** - Continuously improve your instructions

**Say:**
"Here's how to roll this out for your team:

Start with just your top 5-10 rules - the ones you comment on most often.

Test it on some recent PRs to see what it catches.

Refine your rules based on what it misses.

Enable automatic reviews on protected branches first, like main or production.

Measure the impact - how many issues are caught before human review?

And iterate - this is a living set of standards that should evolve with your team."

---

## Slide 9: Q&A (24:00 - 25:00)

**On Screen:**
> # Questions?
>
> **Resources:**
> - Demo Project: [your-repo-url]
> - GitHub Copilot Docs: docs.github.com/en/copilot
> - Tutorial: TUTORIAL.md in the repo
> - Cheat Sheet: CHEAT-SHEET.md

**Say:**
"I'll open it up for questions now. All the resources are linked here, including the demo project and GitHub's official documentation."

---

## Backup Slides (If Extra Time)

### Advanced Topics

**On Screen:**
> # Advanced Topics
> - Integrating with CodeQL for security scanning
> - Custom prompts for different frameworks (Django, Rails, etc.)
> - Measuring ROI on code review time
> - Training team on writing effective instructions

### Common Pitfalls

**On Screen:**
> # Common Pitfalls to Avoid
> - Too many rules (keep to top 10-15)
> - Rules that are too vague
> - Not updating instructions regularly
> - Relying 100% on AI (still need human review)
> - Not testing on real code first

---

## Timing Summary

- **0:00 - 3:00**: Problem & Solution intro
- **3:00 - 5:00**: Demo 1 - Baseline review
- **5:00 - 8:00**: Demo 2 - Repository rules
- **8:00 - 11:00**: Demo 3 - SQL injection
- **11:00 - 14:00**: Demo 4 - React patterns
- **14:00 - 16:30**: Demo 5 - Custom prompts
- **16:30 - 18:00**: The 4 strategies
- **18:00 - 20:00**: Automatic PR reviews
- **20:00 - 21:30**: Real-world results
- **21:30 - 24:00**: Getting started & next steps
- **24:00+**: Q&A

**Total: ~24 minutes + Q&A**

---

## Pre-Presentation Checklist

- [ ] Clone the demo project
- [ ] Run `./setup.sh` to install dependencies
- [ ] Open in VS Code with Copilot enabled
- [ ] Test all demos to ensure they work
- [ ] Have the bad-examples files open in tabs
- [ ] Have Copilot Chat ready
- [ ] Test screen sharing setup
- [ ] Have backup slides ready
- [ ] Print/have CHEAT-SHEET.md available for reference

---

## Post-Presentation

- Share the demo repository link
- Offer to help teams with initial setup
- Schedule follow-up for questions
- Collect feedback on what worked/didn't work
