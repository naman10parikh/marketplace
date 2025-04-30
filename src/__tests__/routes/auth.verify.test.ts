import request from 'supertest';
import { User } from '../../generated/prisma/index';
import app from '../../app';
import { generateVerificationToken } from '../../utils/token';
import { prisma } from '../../utils/prisma';
import bcrypt from 'bcrypt';

describe('GET /auth/verify', () => {
  let testUser: User;
  let verificationToken: string;

  beforeAll(async () => {
    // Clean up database before all tests
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    // Clean up database after all tests
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up database between tests
    await prisma.user.deleteMany({});
    
    // Generate a verification token
    verificationToken = generateVerificationToken();
    
    // Create a test user with this token
    testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,  // Unique email for each test
        passwordHash: await bcrypt.hash('password123', 10),
        emailVerified: false,
        verificationToken: verificationToken
      }
    });
  });

  it('should verify a user with valid token', async () => {
    // Call verification endpoint with the correct token
    const response = await request(app)
      .get(`/auth/verify?token=${verificationToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('verified');

    // Check that the user is now verified in the database
    const updatedUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });

    expect(updatedUser).not.toBeNull();
    expect(updatedUser?.emailVerified).toBe(true);
    expect(updatedUser?.verificationToken).toBeNull(); // Token should be cleared
  });

  it('should return 400 for missing token', async () => {
    const response = await request(app)
      .get('/auth/verify')
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('token');
  });

  it('should return 404 for invalid token', async () => {
    const response = await request(app)
      .get('/auth/verify?token=invalid-token')
      .expect(404);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('token');

    // User should still be unverified
    const updatedUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });

    expect(updatedUser).not.toBeNull();
    expect(updatedUser?.emailVerified).toBe(false);
    expect(updatedUser?.verificationToken).toBe(verificationToken); // Token unchanged
  });

  it('should return 404 for already verified user', async () => {
    // First verify the user directly in the database
    await prisma.user.update({
      where: { id: testUser.id },
      data: {
        emailVerified: true,
        verificationToken: null
      }
    });

    // Try to verify again with the same token
    const response = await request(app)
      .get(`/auth/verify?token=${verificationToken}`)
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });
}); 