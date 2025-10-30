# Task Manager - Repository-Wide Coding Standards

This file contains coding standards that apply across the entire Task Manager project (both frontend and backend).

## General Principles

- Write clear, self-documenting code with descriptive variable and function names
- Keep functions focused on a single responsibility
- Prefer composition over inheritance
- Write code that is easy to test and maintain

## Error Handling

- All functions must implement proper error handling using try-catch blocks
- Never silently swallow errors - log them appropriately
- Return meaningful error messages to help with debugging
- Use custom error classes for domain-specific errors

## Security Requirements

- NEVER commit hardcoded credentials, API keys, or secrets to the repository
- All environment variables must be loaded from .env files
- All user input must be validated and sanitized before processing
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization checks
- Passwords must be hashed using bcrypt with appropriate salt rounds

## Code Style

- Use TypeScript strict mode for type safety
- Prefer async/await over callbacks or raw promises
- Use meaningful variable names (avoid single letters except for iterators)
- Keep line length under 100 characters
- Add JSDoc comments for all public functions and complex logic

## Testing Standards

- All business logic functions must have unit tests
- Aim for at least 80% code coverage
- Use descriptive test names that explain what is being tested
- Follow the Arrange-Act-Assert pattern in tests
- Mock external dependencies in unit tests

## Logging

- Log all security-relevant events (login attempts, permission changes, etc.)
- Use appropriate log levels (error, warn, info, debug)
- Include context in log messages (user ID, request ID, etc.)
- Never log sensitive information (passwords, tokens, credit cards)

## Git Commit Messages

- Use conventional commit format: type(scope): description
- Types: feat, fix, docs, style, refactor, test, chore
- Keep first line under 72 characters
- Include ticket/issue number when applicable

## Performance

- Avoid N+1 query problems in database operations
- Use pagination for large data sets
- Implement caching where appropriate
- Minimize database round trips

## Code Review Checklist

When reviewing code, check for:
- Proper error handling throughout
- No hardcoded secrets or credentials
- Input validation on all user-provided data
- Appropriate test coverage
- Clear and descriptive naming
- No commented-out code (remove or explain why it's there)
- Performance considerations for database queries
