# Backend API Coding Standards

**Scope:** This file contains coding standards specific to the backend API code.

## API Design

- Follow RESTful conventions for endpoint design
- Use appropriate HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Return proper HTTP status codes:
  - 200: OK (successful GET, PUT, PATCH)
  - 201: Created (successful POST)
  - 204: No Content (successful DELETE)
  - 400: Bad Request (validation error)
  - 401: Unauthorized (authentication required)
  - 403: Forbidden (insufficient permissions)
  - 404: Not Found (resource doesn't exist)
  - 409: Conflict (resource already exists)
  - 500: Internal Server Error (unexpected errors)

## Request Validation

- Validate all request parameters using a validation library (e.g., Zod, Joi)
- Validate request body, query parameters, and route parameters
- Return descriptive validation error messages
- Implement maximum request size limits
- Validate file uploads (type, size, content)

## Database Operations

- ALWAYS use parameterized queries or prepared statements
- NEVER concatenate user input directly into SQL queries
- Use an ORM when possible for automatic parameterization
- Implement proper indexing for frequently queried fields
- Use transactions for operations that modify multiple tables
- Avoid N+1 query problems

## SQL Injection Prevention

This is critical - review all database code for SQL injection vulnerabilities:
- ❌ BAD: `SELECT * FROM users WHERE id = ${userId}`
- ✅ GOOD: `SELECT * FROM users WHERE id = ?` with parameterized value
- ❌ BAD: `db.query('SELECT * FROM tasks WHERE title LIKE \'%' + search + '%\')`
- ✅ GOOD: `db.query('SELECT * FROM tasks WHERE title LIKE ?', ['%' + search + '%'])`
- Never trust user input for table names or column names

## Authentication & Authorization

- Implement rate limiting on authentication endpoints (e.g., 5 attempts per 15 minutes)
- Use bcrypt with at least 10 salt rounds for password hashing
- Use async bcrypt methods (bcrypt.hash, bcrypt.compare) not sync versions
- Store JWT tokens with appropriate expiration times
- Validate JWT tokens on protected routes
- Check user authorization before allowing access to resources
- Use httpOnly cookies for token storage when possible

## Error Handling

- Wrap all async operations in try-catch blocks
- Log errors with appropriate context (user ID, request ID, endpoint)
- Return generic error messages to clients (don't expose stack traces)
- Use different error messages for development vs production
- Never expose whether a user account exists in authentication errors
- Use consistent error message format across endpoints

## Security Headers

- Use helmet.js to set security headers
- Configure CORS appropriately (don't use "*" in production)
- Set Content-Security-Policy headers
- Enable HSTS (HTTP Strict Transport Security)
- Disable X-Powered-By header

## Logging

- Log all authentication events (login, logout, failed attempts)
- Log all authorization failures
- Log all database errors
- Include request IDs in logs for tracing
- Never log sensitive information (passwords, tokens, credit cards, SSNs)
- Use appropriate log levels (error, warn, info, debug)

## Response Format

- Use consistent JSON response structure across all endpoints
- Include helpful error messages
- Don't return sensitive data (password hashes, internal IDs)
- Sanitize output to prevent XSS attacks
- Set appropriate Content-Type headers

## Performance

- Implement pagination for list endpoints (default limit: 10-50 items)
- Use database indexes for frequently queried fields
- Cache expensive operations when appropriate
- Use streaming for large file uploads/downloads
- Implement request timeouts

## Code Review Checklist for Backend

When reviewing backend code, specifically check:
- [ ] All database queries use parameterized values (NO SQL injection)
- [ ] All user input is validated with a validation library
- [ ] Proper HTTP status codes are returned
- [ ] Error handling with try-catch blocks
- [ ] Authentication is required on protected endpoints
- [ ] Authorization checks verify resource ownership
- [ ] No hardcoded secrets or credentials
- [ ] Sensitive data is not logged
- [ ] Rate limiting on authentication endpoints
- [ ] Passwords are hashed asynchronously with bcrypt
- [ ] Security headers are configured
- [ ] Pagination is implemented for list endpoints
