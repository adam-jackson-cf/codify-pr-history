# Repository-Wide Coding Standards

This file defines baseline coding standards that apply across the entire Task Manager project (both frontend and backend) for Copilot code review.

## Naming Conventions

- Use descriptive variable and function names (avoid single letters except for iterators)
- Use camelCase for variables and functions
- Use PascalCase for class and interface names
- Keep names self-documenting and clear

## Code Style

- Use TypeScript strict mode for type safety
- Prefer async/await over callbacks or raw promises
- Keep line length under 100 characters
- Add JSDoc comments for all public functions and complex logic
- Keep functions focused on a single responsibility
- Prefer composition over inheritance

## Error Handling

- Implement proper error handling using try-catch blocks for all async operations
- Log errors appropriately with context (user ID, request ID, endpoint)
- Return meaningful error messages to help with debugging
- Use custom error classes for domain-specific errors
- Never silently swallow errors

## Testing

- Write unit tests for all business logic functions
- Aim for at least 80% code coverage
- Use descriptive test names that explain what is being tested
- Follow the Arrange-Act-Assert pattern in tests
- Mock external dependencies in unit tests

## Security

- Load all environment variables from .env files (never hardcode credentials, API keys, or secrets)
- Validate and sanitize all user input before processing
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization checks
- Hash passwords using bcrypt with at least 10 salt rounds
- Never log sensitive information (passwords, tokens, credit cards)

## Logging

- Log all security-relevant events (login attempts, permission changes, etc.)
- Use appropriate log levels (error, warn, info, debug)
- Include context in log messages (user ID, request ID, etc.)

## Performance

- Avoid N+1 query problems in database operations
- Use pagination for large data sets
- Implement caching where appropriate
- Minimize database round trips

## Example

```typescript
// Good: Proper error handling, async/await, descriptive names
async function fetchUserData(userId: string): Promise<User> {
  try {
    const user = await db.getUserById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }
    return user;
  } catch (error) {
    logger.error('Failed to fetch user', { userId, error });
    throw error;
  }
}

// Bad: No error handling, callback style, unclear naming
function get(u: string, cb: any) {
  db.query(`SELECT * FROM users WHERE id = ${u}`, cb);
}
```
