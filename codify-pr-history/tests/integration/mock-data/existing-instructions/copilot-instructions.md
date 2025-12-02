# Repository Coding Standards

General coding standards for all code in this repository.

## Error Handling

- Wrap all async operations in try-catch blocks
- Log errors with appropriate context
- Return generic error messages to clients (don't expose implementation details)
- Handle errors gracefully and provide user-friendly feedback

❌ BAD:
```typescript
async function getData() {
  const result = await api.fetch(); // No error handling
  return result;
}
```

✅ GOOD:
```typescript
async function getData() {
  try {
    const result = await api.fetch();
    return result;
  } catch (error) {
    logger.error('Failed to fetch data', { error });
    throw new Error('Unable to retrieve data. Please try again.');
  }
}
```

## Code Style

- Use TypeScript for type safety
- Follow consistent naming conventions
- Write clear, self-documenting code
- Add comments for complex logic

## Testing

- Write unit tests for all business logic
- Target 80%+ code coverage
- Use descriptive test names
