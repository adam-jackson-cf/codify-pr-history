import { Request, Response } from 'express';
import { AuthService } from './authService.bad';

/**
 * BAD EXAMPLE: User controller with multiple violations
 *
 * Issues demonstrated:
 * 1. No input validation
 * 2. Missing error handling
 * 3. Revealing user existence in error messages
 * 4. No logging
 * 5. Returning sensitive data (password hashes)
 * 6. Using 'any' types
 */
export class UserController {
  private authService: AuthService;
  private users: Map<string, any>; // VIOLATION: Using 'any' type

  constructor() {
    this.authService = new AuthService();
    this.users = new Map();
  }

  /**
   * VIOLATION: No try-catch error handling
   * VIOLATION: No input validation
   */
  async register(req: Request, res: Response) {
    // VIOLATION: No validation of email format, password strength, etc.
    const { email, password, name } = req.body;

    // VIOLATION: This reveals to attackers whether an email exists
    if (this.users.has(email)) {
      res.status(400).json({
        error: `User with email ${email} already exists`,
      });
      return;
    }

    // VIOLATION: No error handling
    const passwordHash = this.authService.hashPassword(password);

    const user = {
      id: this.users.size + 1,
      email: email,
      name: name,
      passwordHash: passwordHash,
      createdAt: new Date().toISOString(),
    };

    this.users.set(email, user);
    const token = this.authService.generateToken(user);

    // VIOLATION: No logging of security event

    // VIOLATION: Returning password hash to client (security issue!)
    res.status(201).json({
      message: 'User registered',
      user: user, // This includes passwordHash!
      token: token,
    });
  }

  /**
   * VIOLATION: No error handling
   * VIOLATION: No input validation
   * VIOLATION: No rate limiting consideration
   */
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = this.users.get(email);

    // VIOLATION: Different error messages reveal user existence
    if (!user) {
      res.status(404).json({
        error: 'User not found with that email',
      });
      return;
    }

    // VIOLATION: No error handling
    const valid = this.authService.verifyPassword(password, user.passwordHash);

    // VIOLATION: Different error message (security issue - timing attacks possible)
    if (!valid) {
      res.status(401).json({
        error: 'Incorrect password',
      });
      return;
    }

    const token = this.authService.generateToken(user);

    // VIOLATION: No logging of login events

    // VIOLATION: Returning password hash
    res.json({
      message: 'Login successful',
      user: user, // Includes passwordHash!
      token: token,
    });
  }

  /**
   * VIOLATION: No authentication middleware check
   * VIOLATION: No error handling
   */
  async getProfile(req: Request, res: Response) {
    // VIOLATION: Directly accessing request without type safety
    const userId = (req as any).userId;

    // VIOLATION: No authorization check

    const user = Array.from(this.users.values()).find((u: any) => u.id === userId);

    // VIOLATION: Exposing full error details
    if (!user) {
      res.status(404).json({
        error: 'User not found',
        attempted_id: userId, // VIOLATION: Leaking internal details
      });
      return;
    }

    // VIOLATION: Returning password hash
    res.json({
      user: user,
    });
  }

  /**
   * VIOLATION: No authorization - any user can delete any account!
   * VIOLATION: No error handling
   */
  async deleteUser(req: Request, res: Response) {
    const { email } = req.params;

    // VIOLATION: No ownership check - anyone can delete anyone's account!

    const deleted = this.users.delete(email);

    // VIOLATION: No logging of critical security event

    if (deleted) {
      res.json({ message: 'User deleted' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  }
}
