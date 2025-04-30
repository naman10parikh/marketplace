import { Request, Response, NextFunction } from 'express';

/**
 * Custom API error class that includes status code
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  // Determine status code
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  
  // Create error response
  const errorResponse = {
    error: err.message || 'Internal Server Error',
    statusCode
  };
  
  // Send error response
  res.status(statusCode).json(errorResponse);
}; 