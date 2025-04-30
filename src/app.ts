import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { configDotenv } from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
configDotenv();

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(express.json()); // Parse JSON bodies

// Rate limiting will be added in middleware/rateLimiter.ts

// Routes
app.use('/', routes);

// Global error handler - must be after routes
app.use(errorHandler);

export default app; 