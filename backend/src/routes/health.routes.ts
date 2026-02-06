import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';

const router = Router();

/**
 * Health check endpoint for Railway
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check Supabase connection
    const { error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1);

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      supabase: error ? 'error' : 'connected',
    };

    res.status(200).json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;