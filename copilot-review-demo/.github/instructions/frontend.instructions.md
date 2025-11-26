---
applyTo: "frontend/**/*.tsx"
---
# Frontend React/TypeScript Coding Standards

This file defines frontend-specific coding standards for Copilot code review.

## Naming Conventions

- Use PascalCase for component names (e.g., `UserProfile`, `TaskList`)
- Use camelCase for variables and functions
- Use descriptive names for props and state variables

## Code Style

- Use functional components with hooks (not class components)
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Use composition over prop drilling

## Error Handling

- Use try-catch for all async operations
- Display user-friendly error messages
- Show loading states during async operations
- Handle network errors gracefully

## Testing

- Write components that are easy to test
- Keep business logic separate from presentation
- Use data-testid for test selectors when needed
- Make components testable by accepting dependencies as props

## Security

- Use environment variables for API URLs (not hardcoded)
- Validate all user input before submission
- Sanitize output to prevent XSS attacks
- Never store sensitive data in localStorage or sessionStorage

## TypeScript Usage

- Define explicit prop interfaces for all components
- Use TypeScript strict mode
- Avoid using `any` type - use `unknown` if type is truly unknown
- Define interfaces for all data structures
- Use proper typing for event handlers

## State Management

- Use `useState` for local component state, `useReducer` for complex state logic
- Use `useCallback` to memoize event handlers passed as props
- Use `useMemo` to memoize expensive calculations
- Avoid storing derived data in state

## Form Handling

- Use controlled components (value + onChange) for form inputs
- Validate input on both change and submit
- Show validation errors clearly, disable submit button during submission
- Always include labels associated with inputs using htmlFor/id

## Accessibility (a11y)

- Use semantic HTML elements (button, nav, main, etc.)
- Include alt text for images, associate labels with inputs using htmlFor/id
- Use aria attributes when needed
- Ensure keyboard navigation works

## Performance

- Use `useCallback` for event handlers passed as props
- Use `useMemo` for expensive computations
- Implement pagination for long lists
- Avoid inline function definitions in JSX

## Styling

- Use CSS modules or styled-components (not inline styles)
- Avoid inline styles except for dynamic values

## Hooks Best Practices

- Follow the Rules of Hooks (only call at top level)
- Include all dependencies in useEffect/useCallback/useMemo arrays
- Custom hooks should start with "use" prefix
- Clean up side effects in useEffect return function

## Example

```typescript
// Good: Proper TypeScript, controlled inputs, accessibility, error handling
interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email);
      onSuccess();
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  }, [email, onSuccess]);

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-describedby={error ? "email-error" : undefined}
      />
      {error && <div id="email-error" role="alert">{error}</div>}
      <button type="submit" disabled={loading}>Login</button>
    </form>
  );
};

// Bad: No types, uncontrolled input, no accessibility
function LoginForm({ onSuccess }: any) {
  const handleSubmit = () => {
    const email = document.getElementById('email').value;
    fetch('/api/login', { body: JSON.stringify({ email }) });
  };
  return <div><input id="email" /><div onClick={handleSubmit}>Submit</div></div>;
}
```

