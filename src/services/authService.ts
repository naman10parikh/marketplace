import bcrypt from 'bcrypt';
import { User } from '../generated/prisma/index';
import { generateVerificationToken } from '../utils/token';
import { sendVerificationEmail } from './emailService';
import { ApiError } from '../middleware/errorHandler';
import { prisma } from '../utils/prisma';

/**
 * Creates a new user in the database
 * @param email User's email address
 * @param password User's password (will be hashed)
 * @returns The created user object (without password)
 */
export async function createUser(email: string, password: string): Promise<Omit<User, 'passwordHash'>> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ApiError('User with this email already exists', 409);
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        verificationToken,
        emailVerified: false
      }
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Return user without passwordHash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    // If this is a known error, rethrow it
    if (error instanceof ApiError) {
      throw error;
    }
    
    // For db errors related to email uniqueness
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      throw new ApiError('User with this email already exists', 409);
    }
    
    // Otherwise, throw a general error
    throw new ApiError('An error occurred while creating the user', 500);
  }
}

/**
 * Verifies a user's email using a verification token
 * @param token Verification token
 * @returns The updated user object (without password)
 */
export async function verifyUserEmail(token: string): Promise<Omit<User, 'passwordHash'>> {
  if (!token) {
    throw new ApiError('Verification token is required', 400);
  }

  try {
    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    });

    if (!user) {
      throw new ApiError('Invalid verification token', 404);
    }

    if (user.emailVerified) {
      throw new ApiError('Email is already verified', 410);
    }

    // Update user to mark email as verified and clear token
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null
      }
    });

    // Return user without passwordHash
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  } catch (error) {
    // If this is a known error, rethrow it
    if (error instanceof ApiError) {
      throw error;
    }
    
    // For db errors related to user not found
    if (error.code === 'P2025') {
      throw new ApiError('Invalid verification token', 404);
    }
    
    // Otherwise, throw a general error
    throw new ApiError('An error occurred during email verification', 500);
  }
} 