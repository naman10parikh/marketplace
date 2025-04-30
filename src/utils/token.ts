import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * Generates a random verification token
 * @returns A random token string
 */
export function generateVerificationToken(): string {
  // Generate a random 32 byte hex string
  return randomBytes(32).toString('hex');
}

/**
 * Generates a JWT token
 * @param payload The data to embed in the token
 * @param expiresIn Token expiration time
 * @returns JWT token string
 */
export function generateJwtToken(
  payload: Record<string, any>,
  expiresIn = process.env.JWT_EXPIRATION || '1h'
): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verifies a JWT token
 * @param token The token to verify
 * @returns The decoded payload or null if invalid
 */
export function verifyJwtToken(token: string): any {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
} 