import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import analyticsService from '../services/analytics.service';

/**
 * Middleware to track API requests in PostHog
 */
export const analyticsMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  // Track response
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;

    // Only track API routes
    if (req.path.startsWith('/api/')) {
      analyticsService.trackApiRequest(
        req.method,
        req.path,
        res.statusCode,
        responseTime,
        req.user?.id
      );
    }
  });

  next();
};