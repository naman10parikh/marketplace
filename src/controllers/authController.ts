import { Request, Response, NextFunction } from 'express';
import { validateSignupData } from '../utils/validation';
import { createUser, verifyUserEmail } from '../services/authService';
import { ApiError } from '../middleware/errorHandler';

/**
 * Handle signup request
 * @route POST /auth/signup
 */
export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    
    // Validate input
    const validationError = validateSignupData(email, password);
    if (validationError) {
      throw new ApiError(validationError.error, 400);
    }
    
    // Create user
    const user = await createUser(email, password);
    
    // Return success response
    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle email verification
 * @route GET /auth/verify
 */
export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.query.token;
    
    if (!token || typeof token !== 'string') {
      throw new ApiError('Verification token is required', 400);
    }
    
    // Verify email
    const user = await verifyUserEmail(token);
    
    // Return success response
    res.status(200).json({
      message: 'Email verified successfully',
      user
    });
  } catch (error) {
    next(error);
  }
} 