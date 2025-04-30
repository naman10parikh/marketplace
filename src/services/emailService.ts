/**
 * Service for sending emails
 * For development, we'll just log the email details to the console
 * In production, this would integrate with an email provider like SendGrid, Mailgun, etc.
 */

/**
 * This is a mock email service for development purposes.
 * In a production environment, this would be replaced with a real email service.
 */

/**
 * Sends a verification email to the specified email address
 * with a link containing the verification token
 * @param email Email address to send to
 * @param token Verification token
 */
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  // In a real implementation, this would connect to an email service like SendGrid, Mailgun, etc.
  // For development/demo purposes, we'll just log the email content
  
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const verificationLink = `${baseUrl}/auth/verify?token=${token}`;
  
  console.log('--------- VERIFICATION EMAIL ---------');
  console.log(`To: ${email}`);
  console.log('Subject: Verify your email address');
  console.log(`
Click the link below to verify your email address:
${verificationLink}`);
  console.log('-------------------------------------');
  
  // Simulate async email sending with a short delay
  await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Sends a password reset email
 * @param email Recipient email address
 * @param token Reset token
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
  
  // In development, just log the email
  console.log('--------- PASSWORD RESET EMAIL ---------');
  console.log(`To: ${email}`);
  console.log(`Subject: Reset your password`);
  console.log(`\nClick the link below to reset your password:\n${resetUrl}\n`);
  console.log('----------------------------------------');
  
  // Simulate waiting for email to send
  await new Promise(resolve => setTimeout(resolve, 100));
} 