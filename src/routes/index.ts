import { Router } from 'express';
import authRoutes from './auth';

const router = Router();

// Register routes
router.use('/auth', authRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default router; 