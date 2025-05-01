import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

/**
 * Generate a random verification token
 * @returns Random token string
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a JWT token
 * @param userId User ID to include in token
 * @returns Signed JWT token
 */
export function generateJwtToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' });
}

/**
 * Verify a JWT token
 * @param token Token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyJwtToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
} 