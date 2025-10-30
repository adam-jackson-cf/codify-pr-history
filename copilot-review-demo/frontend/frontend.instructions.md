# Frontend React/TypeScript Coding Standards

**Scope:** This file contains coding standards specific to the frontend React application.

## React Component Patterns

- Use functional components with hooks (not class components)
- Name components using PascalCase (e.g., `UserProfile`, `TaskList`)
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Use composition over prop drilling (Context API or state management when needed)

## TypeScript Usage

- Define explicit prop interfaces for all components
- Use TypeScript strict mode
- Avoid using `any` type - use `unknown` if type is truly unknown
- Define interfaces for all data structures (User, Task, etc.)
- Use proper typing for event handlers (e.g., `ChangeEvent<HTMLInputElement>`)

## State Management

- Use `useState` for local component state
- Use `useReducer` for complex state logic
- Use `useCallback` to memoize event handlers and prevent unnecessary re-renders
- Use `useMemo` to memoize expensive calculations
- Avoid storing derived data in state

## Form Handling

- Use controlled components (value + onChange) for form inputs
- Validate input on both change and submit
- Show validation errors clearly next to the relevant field
- Disable submit button during submission
- Clear validation errors when user starts typing
- Use proper input types (email, password, number, etc.)
- Always include labels associated with inputs (for accessibility)

## Error Handling

- Always use try-catch for async operations
- Display user-friendly error messages
- Log errors to console for debugging
- Provide retry mechanisms for failed requests
- Handle network errors gracefully
- Show loading states during async operations

## API Communication

- Define TypeScript interfaces for all API request/response shapes
- Use environment variables for API URLs (not hardcoded)
- Include proper headers (Content-Type, Authorization)
- Check response status before processing data
- Handle both success and error responses
- Implement request timeout handling

## Accessibility (a11y)

- Use semantic HTML elements (button, nav, main, etc.)
- Include alt text for all images
- Associate labels with form inputs using htmlFor/id
- Use aria attributes when needed (aria-label, aria-describedby, etc.)
- Ensure keyboard navigation works
- Use role attributes appropriately
- Test with screen readers

## Performance

- Use `useCallback` for event handlers passed as props
- Use `useMemo` for expensive computations
- Implement pagination or virtualization for long lists
- Avoid inline function definitions in JSX (causes re-renders)
- Use React.memo() for expensive components that don't change often
- Lazy load components when appropriate

## Styling

- Use CSS modules or styled-components (not inline styles)
- Follow a consistent naming convention for CSS classes
- Use Tailwind or a CSS framework consistently if adopted
- Avoid inline styles except for dynamic values
- Keep styles scoped to components

## Component Structure

- Props interface at the top
- Component function with proper return type (JSX.Element)
- State declarations
- useEffect hooks
- Event handlers (using useCallback)
- Render logic
- Export at bottom

## Hooks Best Practices

- Follow the Rules of Hooks (only call at top level)
- Include all dependencies in useEffect/useCallback/useMemo arrays
- Custom hooks should start with "use" prefix
- Extract reusable logic into custom hooks
- Clean up side effects in useEffect return function

## Testing Considerations

- Write components that are easy to test
- Avoid directly accessing DOM elements
- Use data-testid for test selectors when needed
- Keep business logic separate from presentation
- Make components testable by accepting dependencies as props

## Code Review Checklist for Frontend

When reviewing frontend code, specifically check:
- [ ] All components have proper TypeScript prop interfaces
- [ ] No usage of `any` type (use proper types or `unknown`)
- [ ] Form inputs are controlled with proper validation
- [ ] Error handling with try-catch for all async operations
- [ ] Loading states shown during async operations
- [ ] Proper accessibility attributes (labels, aria, roles)
- [ ] Event handlers use useCallback to prevent re-renders
- [ ] No inline styles (use CSS classes or CSS-in-JS)
- [ ] API URLs use environment variables, not hardcoded
- [ ] No prop drilling deeper than 2-3 levels
- [ ] Components follow single responsibility principle
- [ ] All list items have key props
- [ ] Semantic HTML elements used appropriately
