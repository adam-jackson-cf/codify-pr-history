import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// VIOLATION: Hardcoded JWT secret instead of using environment variable
const JWT_SECRET = 'super-secret-key-12345';
const JWT_EXPIRES_IN = '24h';

interface User {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
}

/**
 * BAD EXAMPLE: Authentication service with multiple security violations
 *
 * Issues demonstrated:
 * 1. Hardcoded JWT secret
 * 2. No error handling (missing try-catch blocks)
 * 3. Using any types
 * 4. No password strength validation
 * 5. Synchronous bcrypt (blocking)
 */
export class AuthService {
  // VIOLATION: Hardcoded salt rounds as magic number
  hashPassword(password: string) {
    // VIOLATION: Synchronous hashing blocks the event loop
    // VIOLATION: No error handling
    return bcrypt.hashSync(password, 5); // Also using weak salt rounds
  }

  verifyPassword(password: string, hash: string) {
    // VIOLATION: Synchronous operation
    // VIOLATION: No error handling
    return bcrypt.compareSync(password, hash);
  }

  // VIOLATION: Using 'any' type instead of proper typing
  generateToken(user: any) {
    // VIOLATION: No error handling
    // VIOLATION: Using hardcoded secret
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return token;
  }

  // VIOLATION: Using 'any' return type
  verifyToken(token: string): any {
    // VIOLATION: No error handling for expired or invalid tokens
    // VIOLATION: Using hardcoded secret
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  }

  // VIOLATION: No password strength validation function
  // Users can register with weak passwords like "123"
}

// VIOLATION: Exporting the secret (massive security issue!)
export { JWT_SECRET };
