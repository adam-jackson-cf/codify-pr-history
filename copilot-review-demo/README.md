# GitHub Copilot Code Review Demo

A comprehensive teaching project demonstrating how to use GitHub Copilot for code reviews with custom instructions to enforce team coding standards and best practices.

## 📚 What's This?

This is a **full-stack Task Manager application** built specifically to demonstrate all GitHub Copilot code review features and strategies. It includes:

- ✅ **Good code examples** showing proper patterns
- ❌ **Bad code examples** with intentional violations
- 📋 **Custom instructions** at multiple levels (repo, backend, frontend)
- 🎯 **Hands-on tutorial** with 6 progressive exercises
- 📖 **Complete documentation** for teaching others

## 🎯 Learning Objectives

By the end of this demo, you'll learn how to:

1. Configure GitHub Copilot to enforce your team's coding standards
2. Create repository-wide and path-scoped custom instructions
3. Use structured review prompts for consistent feedback
4. Set up automatic PR reviews with agentic tool calling
5. Identify and fix common security vulnerabilities
6. Apply best practices for React/TypeScript and Node.js/Express

## 🏗️ Project Structure

```
copilot-review-demo/
├── .github/
│   ├── copilot-instructions.md          # Strategy #1: Repository-level rules
│   └── instructions/                    # Strategy #2: Path-scoped rules
│       ├── backend.instructions.md      # Backend-specific rules
│       └── frontend.instructions.md    # Frontend-specific rules
├── .prompts/
│   └── code-review.prompt.md            # Strategy #3: Custom review prompts
├── backend/                             # Node.js/Express/TypeScript API
│   ├── src/
│   │   ├── good-examples/              # ✅ Proper implementations
│   │   │   ├── authService.ts
│   │   │   ├── userController.ts
│   │   │   └── taskService.ts
│   │   └── bad-examples/               # ❌ Intentional violations
│   │       ├── authService.bad.ts      # Hardcoded secrets, no error handling
│   │       ├── userController.bad.ts   # No validation, leaking data
│   │       └── taskService.bad.ts      # SQL injection vulnerabilities
│   └── package.json
├── frontend/                            # React/TypeScript/Vite
│   ├── src/
│   │   ├── good-examples/
│   │   │   ├── components/
│   │   │   │   ├── TaskList.tsx        # Proper React patterns
│   │   │   │   └── LoginForm.tsx       # Form validation, a11y
│   │   │   └── hooks/
│   │   │       └── useAuth.ts          # Custom hook patterns
│   │   └── bad-examples/
│   │       ├── components/
│   │       │   ├── TaskList.bad.tsx    # Prop drilling, missing keys
│   │       │   └── LoginForm.bad.tsx   # No validation, no a11y
│   │       └── hooks/
│   │           └── useAuth.bad.ts      # Using any, no error handling
│   └── package.json
├── README.md                            # This file
├── TUTORIAL.md                          # 📚 6 hands-on exercises
├── VIDEO-SCRIPT.md                      # 🎥 Presentation outline
├── CHEAT-SHEET.md                       # 📝 Quick reference
└── setup.sh                             # 🚀 Automated setup script
```

## 🆕 Latest Features (October 2025)

This demo incorporates the latest GitHub Copilot code review capabilities:

- **Agentic Tool Calling**: Copilot now actively gathers full project context, including code, directory structure, and references
- **Deterministic Security Tools**: Integration with ESLint and CodeQL for high-signal, consistent security findings
- **Automated Fixes**: Mention `@copilot` in pull requests to automatically apply suggested fixes
- **Full Context Awareness**: Reviews understand how changes fit within the broader project architecture

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **VS Code** with **GitHub Copilot extension**
- **Git**
- **GitHub Copilot subscription** (Individual, Business, or Enterprise)

### Setup

1. Clone or download this project:
   ```bash
   git clone <your-repo-url>
   cd copilot-review-demo
   ```

2. Run the automated setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

   This will:
   - Check for required tools
   - Install backend dependencies
   - Install frontend dependencies
   - Initialize git repository
   - Display next steps

3. Open the project in VS Code:
   ```bash
   code .
   ```

4. Reload VS Code window to activate custom instructions:
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "Reload Window" and press Enter

5. Start with the tutorial:
   ```bash
   open TUTORIAL.md
   ```

## 📖 Documentation

### For Learners

Start here:
1. **[TUTORIAL.md](./TUTORIAL.md)** - 6 progressive hands-on exercises
2. **[CHEAT-SHEET.md](./CHEAT-SHEET.md)** - Quick reference for common commands

### For Teachers/Presenters

Use these:
1. **[VIDEO-SCRIPT.md](./VIDEO-SCRIPT.md)** - 20-minute presentation outline with timing
2. This README - Overview and setup instructions

## 🔍 Key Strategies Demonstrated

### Strategy #1: Repository-Level Instructions

**File:** `.github/copilot-instructions.md`

**Purpose:** Baseline standards that apply to all code

**Examples:**
- All functions must have error handling
- No hardcoded credentials
- TypeScript strict mode
- Password hashing requirements

### Strategy #2: Path-Scoped Instructions

**Files:**
- `.github/instructions/backend.instructions.md`
- `.github/instructions/frontend.instructions.md`

**Purpose:** Different standards for different parts of the codebase using `applyTo` frontmatter

**Backend focuses on:**
- SQL injection prevention
- HTTP status codes
- Rate limiting
- Database security

**Frontend focuses on:**
- React component patterns
- Accessibility (a11y)
- Form validation
- Performance (useCallback, useMemo)

**Note:** Path-scoped instructions work automatically in VS Code, GitHub.com, and JetBrains without any configuration. The `.vscode/` directory is optional and only needed if you want to organize rules into separate category files for explicit VS Code settings configuration.

### Strategy #3: Custom Review Prompts

**File:** `.prompts/code-review.prompt.md`

**Purpose:** Structured, prioritized review feedback

**Features:**
- Priority levels (🔥 Critical to ⚪ Info)
- Category-based organization
- Consistent output format
- Actionable suggestions with code examples

## 🎓 What You'll Learn

### Security

- Preventing SQL injection with parameterized queries
- Proper password hashing with bcrypt
- Environment variable management
- Input validation and sanitization
- Authorization checks

### Backend Best Practices

- Express.js API design
- Proper error handling with try-catch
- HTTP status code usage
- TypeScript typing for APIs
- Database security patterns

### Frontend Best Practices

- React hooks (useState, useEffect, useCallback, useMemo)
- Form validation and error handling
- Accessibility (ARIA attributes, semantic HTML)
- TypeScript prop interfaces
- Performance optimization

### Code Review Process

- How to structure review feedback
- Prioritizing issues (Critical → Info)
- Writing actionable suggestions
- Balancing automation vs human judgment

## 🎯 Use Cases

### For Individuals

- Learn GitHub Copilot's code review features
- Practice identifying common security vulnerabilities
- Understand the difference between good and bad code patterns
- Build custom instructions for personal projects

### For Teams

- Standardize code review practices
- Onboard new developers faster
- Reduce time spent on repetitive review comments
- Enforce organizational coding standards

### For Teachers

- Teaching material for courses on code quality
- Demonstrable examples of security vulnerabilities
- Hands-on exercises for students
- Ready-to-present content with video script

## 🔧 Technical Stack

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **SQLite3** - Database
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Zod** - Schema validation

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Vitest** - Testing framework

## 📊 Comparison: Good vs Bad

### Backend - SQL Injection

❌ **Bad Example** (`taskService.bad.ts`):
```typescript
// CRITICAL VULNERABILITY!
const query = `SELECT * FROM tasks WHERE title LIKE '%${searchTerm}%'`;
db.all(query, callback);
```

✅ **Good Example** (`taskService.ts`):
```typescript
// Safe: parameterized query
const query = `SELECT * FROM tasks WHERE title LIKE ?`;
db.all(query, [`%${searchTerm}%`], callback);
```

### Frontend - Form Validation

❌ **Bad Example** (`LoginForm.bad.tsx`):
```typescript
// No validation, direct DOM access!
const email = (document.getElementById('email') as any).value;
fetch('/api/login', { body: JSON.stringify({ email, password }) });
```

✅ **Good Example** (`LoginForm.tsx`):
```typescript
// Proper validation before submission
const validateEmail = (email: string): string | undefined => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email';
  return undefined;
};
```

## 🎬 Getting Started

### Quick Demo (5 minutes)

1. Open `backend/src/bad-examples/authService.bad.ts`
2. Select all code (Cmd+A / Ctrl+A)
3. Open Copilot Chat (Cmd+I / Ctrl+I)
4. Ask: "Review this code for security issues"
5. See what Copilot catches!

### Full Tutorial (2 hours)

Follow **[TUTORIAL.md](./TUTORIAL.md)** for all 6 exercises:
1. Baseline review (no custom rules)
2. Add repository-level instructions
3. Add backend path-scoped instructions
4. Add frontend path-scoped instructions
5. Use custom review prompts
6. Configure automatic PR reviews

## 🤝 Contributing

This is a teaching demo! Feel free to:

- Adapt it for your team's specific needs
- Add more examples for your tech stack
- Create additional exercises
- Translate to other languages
- Share improvements back

## 📝 License

MIT License - feel free to use this for teaching, training, or personal learning.

## 🙏 Acknowledgments

This demo is based on research into GitHub Copilot code review best practices, including:

- Official GitHub Copilot documentation
- Real-world implementation examples
- Security best practices (OWASP)
- React and TypeScript conventions
- Express.js security patterns

## 📞 Support

This is a self-contained teaching project. For issues with:

- **GitHub Copilot**: See [official docs](https://docs.github.com/en/copilot)
- **This demo**: Review the TUTORIAL.md troubleshooting section
- **Your implementation**: Adapt the examples to your needs

## 🚦 Next Steps

1. ✅ Complete the setup (run `./setup.sh`)
2. 📚 Start the tutorial (open `TUTORIAL.md`)
3. 🎯 Work through all 6 exercises
4. 📝 Review the cheat sheet for quick reference
5. 🎥 Use the video script to present to your team

---

**Ready to level up your code reviews with AI? Start with [TUTORIAL.md](./TUTORIAL.md)!**
