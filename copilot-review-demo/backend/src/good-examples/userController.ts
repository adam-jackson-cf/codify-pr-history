import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from './authService';

/**
 * Validation schema for user registration
 */
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

/**
 * Validation schema for user login
 */
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * User controller with proper error handling and validation
 *
 * Demonstrates:
 * - Input validation using Zod
 * - Proper error handling with try-catch
 * - Appropriate HTTP status codes
 * - Secure password handling
 * - Type-safe request/response handling
 */
export class UserController {
  private authService: AuthService;
  private users: Map<string, any>; // Simulating a database

  constructor() {
    this.authService = new AuthService();
    this.users = new Map();
  }

  /**
   * Register a new user
   * @param req - Express request object
   * @param res - Express response object
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const validatedData = registerSchema.parse(req.body);

      // Check if user already exists
      if (this.users.has(validatedData.email)) {
        res.status(409).json({
          error: 'User with this email already exists',
        });
        return;
      }

      // Validate password strength
      const passwordValidation = this.authService.validatePasswordStrength(
        validatedData.password
      );

      if (!passwordValidation.valid) {
        res.status(400).json({
          error: passwordValidation.message,
        });
        return;
      }

      // Hash the password
      const passwordHash = await this.authService.hashPassword(validatedData.password);

      // Create user object
      const user = {
        id: this.users.size + 1,
        email: validatedData.email,
        name: validatedData.name,
        passwordHash,
        createdAt: new Date().toISOString(),
      };

      // Save user (simulating database save)
      this.users.set(validatedData.email, user);

      // Generate token
      const token = this.authService.generateToken(user);

      // Log the registration event
      console.info(`New user registered: ${user.email} (ID: ${user.id})`);

      // Return user data without password hash
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
        token,
      });
    } catch (error) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }

      // Log unexpected errors
      console.error('Error during user registration:', error);

      // Return generic error message to client
      res.status(500).json({
        error: 'An error occurred during registration',
      });
    }
  }

  /**
   * Login an existing user
   * @param req - Express request object
   * @param res - Express response object
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const validatedData = loginSchema.parse(req.body);

      // Find user
      const user = this.users.get(validatedData.email);

      // Use generic error message for security
      if (!user) {
        // Log failed login attempt
        console.warn(`Failed login attempt for email: ${validatedData.email}`);

        res.status(401).json({
          error: 'Invalid email or password',
        });
        return;
      }

      // Verify password
      const isPasswordValid = await this.authService.verifyPassword(
        validatedData.password,
        user.passwordHash
      );

      if (!isPasswordValid) {
        // Log failed login attempt
        console.warn(
          `Failed login attempt for user: ${user.email} (ID: ${user.id}) - incorrect password`
        );

        res.status(401).json({
          error: 'Invalid email or password',
        });
        return;
      }

      // Generate token
      const token = this.authService.generateToken(user);

      // Log successful login
      console.info(`User logged in: ${user.email} (ID: ${user.id})`);

      // Return success response
      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (error) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }

      // Log unexpected errors
      console.error('Error during login:', error);

      // Return generic error message
      res.status(500).json({
        error: 'An error occurred during login',
      });
    }
  }

  /**
   * Get user profile
   * @param req - Express request object (with userId from auth middleware)
   * @param res - Express response object
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // Assume userId is added by authentication middleware
      const userId = (req as any).userId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
        });
        return;
      }

      // Find user by ID
      const user = Array.from(this.users.values()).find((u) => u.id === userId);

      if (!user) {
        res.status(404).json({
          error: 'User not found',
        });
        return;
      }

      // Return user profile without sensitive data
      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);

      res.status(500).json({
        error: 'An error occurred while fetching profile',
      });
    }
  }
}
