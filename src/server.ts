import express, { Request, Response, NextFunction } from 'express';
import { Server } from 'http';

// Initialize Express app
const app = express();

// Middleware for JSON body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is up and running' });
});

// Default route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to MCP Server Marketplace API' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err.stack);
  res.status(500).json({
    error: {
      message: 'Internal Server Error',
    },
  });
});

// Define port
const PORT = process.env.PORT || 3000;

// Server instance
let server: Server | null = null;

// Start server function
export const startServer = (): Server => {
  server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${PORT}`);
  });
  return server;
};

// Stop server function
export const stopServer = (): void => {
  if (server) {
    server.close();
    server = null;
  }
};

// Start the server if this file is run directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
