---
applyTo: "backend/**/*.ts"
---
# Backend API Coding Standards

This file defines backend-specific coding standards for Copilot code review.

## Naming Conventions

- Use camelCase for variables and functions
- Use PascalCase for class and interface names
- Use descriptive names for endpoints and functions

## Code Style

- Follow RESTful conventions for endpoint design
- Use appropriate HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Prefer async/await over callbacks
- Keep functions focused on a single responsibility

## Error Handling

- Wrap all async operations in try-catch blocks
- Log errors with context (user ID, request ID, endpoint)
- Return generic error messages to clients (don't expose stack traces)
- Use consistent error message format across endpoints
- Never expose whether a user account exists in authentication errors

## Testing

- Write unit tests for all business logic functions
- Mock external dependencies (database, APIs)
- Test error handling paths
- Use descriptive test names

## Security

- Use parameterized queries or prepared statements (NEVER concatenate user input into SQL)
- Validate all request parameters using a validation library (e.g., Zod, Joi)
- Implement rate limiting on authentication endpoints (e.g., 5 attempts per 15 minutes)
- Use bcrypt with at least 10 salt rounds for password hashing (async methods only)
- Validate JWT tokens on protected routes
- Check user authorization before allowing access to resources
- Use helmet.js to set security headers
- Configure CORS appropriately (don't use "*" in production)
- Never log sensitive information (passwords, tokens, credit cards)

## HTTP Status Codes

Return proper HTTP status codes:
- 200: OK (successful GET, PUT, PATCH)
- 201: Created (successful POST)
- 204: No Content (successful DELETE)
- 400: Bad Request (validation error)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 409: Conflict (resource already exists)
- 500: Internal Server Error (unexpected errors)

## Database Operations

- Use parameterized queries or prepared statements
- Use an ORM when possible for automatic parameterization
- Implement proper indexing for frequently queried fields
- Use transactions for operations that modify multiple tables
- Avoid N+1 query problems

## Example

```typescript
// Good: Parameterized query, proper error handling, correct status code
async function getTaskById(taskId: string, userId: string): Promise<Task> {
  try {
    const task = await db.get(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    return task;
  } catch (error) {
    logger.error('Failed to fetch task', { taskId, userId, error });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Bad: SQL injection, no error handling, wrong status code
function getTask(id: string) {
  const query = `SELECT * FROM tasks WHERE id = ${id}`;
  db.query(query, (err, result) => {
    res.send(result);
  });
}
```


