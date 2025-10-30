# Code Review Prompt

**Description:** Perform a comprehensive code review with prioritized feedback

## Instructions

Please perform a thorough code review of the provided code changes. Analyze the code for:

1. **Security Issues** 🔥
   - SQL injection vulnerabilities
   - Hardcoded secrets or credentials
   - Missing input validation
   - Authentication/authorization issues
   - XSS vulnerabilities

2. **Error Handling** 🔴
   - Missing try-catch blocks
   - Unhandled promise rejections
   - Poor error messages
   - Missing error logging

3. **Code Quality** 🟡
   - TypeScript type safety (no `any` types)
   - Proper naming conventions
   - Code organization and structure
   - Unnecessary complexity

4. **React/Frontend Specific** 🔵
   - Missing key props in lists
   - Prop drilling issues
   - Missing accessibility attributes
   - Inline styles instead of CSS
   - Uncontrolled form inputs
   - Missing useCallback/useMemo

5. **Backend/API Specific** 🟢
   - SQL injection via string concatenation
   - Missing request validation
   - Improper HTTP status codes
   - Missing rate limiting on auth endpoints

6. **Best Practices** ⚪
   - Missing comments/documentation
   - Code duplication
   - Magic numbers
   - TODOs or commented code

## Output Format

For each issue found, provide feedback in this format:

```
[Priority] Category: Issue Title (file:line)

Description: Brief description of the issue

Current Code:
```code snippet```

Suggested Fix:
```improved code```

Impact: Why this matters
```

## Priority Levels

- 🔥 **Critical**: Security vulnerabilities, data loss risks
- 🔴 **High**: Bugs, missing error handling, accessibility issues
- 🟡 **Medium**: Code quality, performance concerns
- 🟢 **Low**: Style issues, minor improvements
- ⚪ **Info**: Suggestions, best practices

## Constraints

- Focus on actionable feedback
- Provide specific code examples for fixes
- Prioritize security and correctness over style
- Keep suggestions concise but clear
- Reference the project's coding standards when relevant
