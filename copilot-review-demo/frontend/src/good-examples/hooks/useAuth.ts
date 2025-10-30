import { useState, useCallback, useEffect } from 'react';

/**
 * Interface for user data
 */
interface User {
  id: number;
  email: string;
  name: string;
}

/**
 * Interface for login credentials
 */
interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Interface for registration data
 */
interface RegisterData {
  email: string;
  password: string;
  name: string;
}

/**
 * Interface for authentication state
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Interface for the return value of useAuth hook
 */
interface UseAuthReturn {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'auth_token';

/**
 * Custom hook for authentication with proper error handling and state management
 *
 * Demonstrates:
 * - Proper TypeScript typing
 * - Error handling with try-catch
 * - Loading states
 * - Secure token storage
 * - Clean separation of concerns
 * - useCallback for memoization
 */
export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem(TOKEN_KEY),
    isLoading: false,
    error: null,
  });

  /**
   * Validate user session on mount
   */
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        return;
      }

      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }));

        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // Token is invalid, clear it
          localStorage.removeItem(TOKEN_KEY);
          setAuthState({
            user: null,
            token: null,
            isLoading: false,
            error: null,
          });
          return;
        }

        const data = await response.json();

        setAuthState({
          user: data.user,
          token,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Session validation error:', error);
        localStorage.removeItem(TOKEN_KEY);
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          error: null,
        });
      }
    };

    validateSession();
  }, []);

  /**
   * Login function with proper error handling
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token securely
      localStorage.setItem(TOKEN_KEY, data.token);

      setAuthState({
        user: data.user,
        token: data.token,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      // Re-throw for component-level handling if needed
      throw error;
    }
  }, []);

  /**
   * Register function with proper error handling
   */
  const register = useCallback(async (data: RegisterData): Promise<void> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Registration failed');
      }

      // Store token securely
      localStorage.setItem(TOKEN_KEY, responseData.token);

      setAuthState({
        user: responseData.user,
        token: responseData.token,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      // Re-throw for component-level handling if needed
      throw error;
    }
  }, []);

  /**
   * Logout function
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);

    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    user: authState.user,
    token: authState.token,
    isLoading: authState.isLoading,
    error: authState.error,
    isAuthenticated: authState.user !== null && authState.token !== null,
    login,
    register,
    logout,
    clearError,
  };
}
