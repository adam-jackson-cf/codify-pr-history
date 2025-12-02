---
applyTo: "backend/**/*.ts"
---
# Backend Coding Standards

Backend-specific coding standards for API development.

## Security

### SQL Injection Prevention

- Use parameterized queries or prepared statements
- NEVER concatenate user input directly into SQL queries
- Use ? placeholders for all dynamic values

❌ BAD:
```typescript
const query = `SELECT * FROM users WHERE id = ${userId}`;
db.all(query, callback);
```

✅ GOOD:
```typescript
const query = `SELECT * FROM users WHERE id = ?`;
db.all(query, [userId], callback);
```

### Authentication

- Use bcrypt for password hashing
- Never store passwords in plain text
- Implement proper session management

## API Design

- Follow RESTful conventions
- Use appropriate HTTP status codes
- Validate all request parameters
- Return consistent error formats
