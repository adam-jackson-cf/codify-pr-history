import { useState } from 'react';

// VIOLATION: Using 'any' types everywhere
// VIOLATION: No proper TypeScript interfaces

/**
 * BAD EXAMPLE: Authentication hook with multiple violations
 *
 * Issues demonstrated:
 * 1. Using 'any' types instead of proper interfaces
 * 2. No error handling (missing try-catch)
 * 3. No loading states
 * 4. Not using useCallback (performance issue)
 * 5. Storing password in state (security issue!)
 * 6. No token validation on mount
 */
export function useAuth() {
  // VIOLATION: Using 'any' type
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<any>(localStorage.getItem('token'));
  // VIOLATION: Storing password in state!
  const [password, setPassword] = useState('');

  // VIOLATION: No error handling, no try-catch
  // VIOLATION: Not using useCallback
  const login = async (email: any, pwd: any) => {
    // VIOLATION: No loading state

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pwd }),
    });

    // VIOLATION: No error handling for failed requests
    const data = await response.json();

    setUser(data.user);
    setToken(data.token);
    // VIOLATION: Storing password!
    setPassword(pwd);
    localStorage.setItem('token', data.token);
  };

  // VIOLATION: No error handling
  // VIOLATION: Not using useCallback
  const register = async (data: any) => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    setUser(result.user);
    setToken(result.token);
    localStorage.setItem('token', result.token);
  };

  // VIOLATION: Not using useCallback
  const logout = () => {
    setUser(null);
    setToken(null);
    setPassword(''); // VIOLATION: Clearing password that shouldn't have been stored!
    localStorage.removeItem('token');
  };

  // VIOLATION: No validation, no error state, storing password
  return {
    user,
    token,
    password, // VIOLATION: Exposing password!
    login,
    register,
    logout,
  };
}
