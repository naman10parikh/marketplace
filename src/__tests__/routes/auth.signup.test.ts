import request from 'supertest';
import app from '../../app';
import { prisma } from '../../utils/prisma';

describe('POST /auth/signup', () => {
  beforeAll(async () => {
    // Clean up database before tests
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up database between tests
    await prisma.user.deleteMany({});
  });

  it('should create a new user with valid input', async () => {
    // Create a timestamp to make email unique
    const timestamp = Date.now();
    const userData = {
      email: `test-${timestamp}@example.com`,
      password: 'Password123!'
    };

    const response = await request(app)
      .post('/auth/signup')
      .send(userData)
      .expect(201);

    // Check response structure
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user).toHaveProperty('email', userData.email);
    expect(response.body.user).toHaveProperty('emailVerified', false);
    expect(response.body.user).not.toHaveProperty('passwordHash');

    // Verify user is in the database
    const user = await prisma.user.findUnique({
      where: { email: userData.email }
    });
    expect(user).not.toBeNull();
    expect(user?.email).toBe(userData.email);
    expect(user?.emailVerified).toBe(false);
    expect(user?.passwordHash).toBeTruthy(); // Password should be hashed
  });

  it('should return 400 for missing email', async () => {
    const userData = {
      password: 'Password123!'
    };

    const response = await request(app)
      .post('/auth/signup')
      .send(userData)
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error.toLowerCase()).toContain('email');
  });

  it('should return 400 for missing password', async () => {
    const userData = {
      email: 'test@example.com'
    };

    const response = await request(app)
      .post('/auth/signup')
      .send(userData)
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error.toLowerCase()).toContain('password');
  });

  it('should return 400 for invalid email format', async () => {
    const userData = {
      email: 'invalid-email',
      password: 'Password123!'
    };

    const response = await request(app)
      .post('/auth/signup')
      .send(userData)
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error.toLowerCase()).toContain('email');
  });

  it('should return 400 for weak password', async () => {
    const userData = {
      email: 'test@example.com',
      password: '12345' // Too short
    };

    const response = await request(app)
      .post('/auth/signup')
      .send(userData)
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error.toLowerCase()).toContain('password');
  });

  it('should return 409 for duplicate email', async () => {
    const email = `duplicate-${Date.now()}@example.com`;
    const userData = {
      email,
      password: 'Password123!'
    };

    // Create the first user
    await request(app)
      .post('/auth/signup')
      .send(userData)
      .expect(201);

    // Try to create a duplicate
    const response = await request(app)
      .post('/auth/signup')
      .send(userData)
      .expect(409);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('already exists');
  });

  it('should set verificationToken for new users', async () => {
    const timestamp = Date.now();
    const userData = {
      email: `verification-${timestamp}@example.com`,
      password: 'Password123!'
    };

    await request(app)
      .post('/auth/signup')
      .send(userData)
      .expect(201);

    // Verify user has a verification token in the database
    const user = await prisma.user.findUnique({
      where: { email: userData.email }
    });
    
    expect(user).not.toBeNull();
    expect(user?.verificationToken).toBeTruthy();
  });
}); 