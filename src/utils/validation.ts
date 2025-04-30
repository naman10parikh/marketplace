/**
 * Validates an email format
 * @param email Email to validate
 * @returns boolean
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * @param password Password to validate
 * @returns boolean
 */
export function isValidPassword(password: string): boolean {
  // At least 8 characters, with at least one number and one letter
  return password.length >= 8 && 
         /[0-9]/.test(password) && 
         /[a-zA-Z]/.test(password);
}

/**
 * Validates signup data (email and password)
 * @param email User's email
 * @param password User's password
 * @returns An error object if validation fails, null if valid
 */
export function validateSignupData(email?: string, password?: string): { error: string } | null {
  // Validate email
  if (!email) {
    return { error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: 'Invalid email format' };
  }

  // Validate password
  if (!password) {
    return { error: 'Password is required' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { error: 'Password must contain at least one letter and one number' };
  }

  return null; // Valid data
} 