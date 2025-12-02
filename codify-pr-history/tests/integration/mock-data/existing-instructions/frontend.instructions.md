---
applyTo: "frontend/**/*.tsx"
---
# Frontend Coding Standards

Frontend-specific coding standards for React development.

## Component Structure

- Use functional components with hooks
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks

## State Management

- Use React hooks for local state
- Avoid unnecessary re-renders
- Use useCallback and useMemo appropriately

## Accessibility

- Use semantic HTML elements
- Add ARIA attributes where needed
- Ensure keyboard navigation works
- Test with screen readers

## Performance

- Implement code splitting for large bundles
- Lazy load components when appropriate
- Optimize images and assets
- Use React.memo for expensive components
