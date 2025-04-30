import { Router } from 'express';
import { signup, verifyEmail } from '../controllers/authController';

const router = Router();

// POST /auth/signup - Register a new user
router.post('/signup', signup);

// GET /auth/verify - Verify email address
router.get('/verify', verifyEmail);

export default router; 