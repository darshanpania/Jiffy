import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import gifService from '../services/gif.service';
import { strictRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/v1/gifs/search/giphy
 * Search GIFs from GIPHY
 */
router.get('/search/giphy', strictRateLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { q, limit, offset } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: { message: 'Search query is required' },
      });
    }

    const gifs = await gifService.searchGiphy(
      q,
      parseInt(limit as string) || 25,
      parseInt(offset as string) || 0
    );

    res.json({
      success: true,
      data: gifs,
      source: 'GIPHY',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * GET /api/v1/gifs/search/tenor
 * Search GIFs from Tenor
 */
router.get('/search/tenor', strictRateLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { q, limit, pos } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: { message: 'Search query is required' },
      });
    }

    const gifs = await gifService.searchTenor(
      q,
      parseInt(limit as string) || 25,
      pos as string || ''
    );

    res.json({
      success: true,
      data: gifs,
      source: 'TENOR',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * GET /api/v1/gifs/trending/giphy
 * Get trending GIFs from GIPHY
 */
router.get('/trending/giphy', async (req: AuthRequest, res: Response) => {
  try {
    const { limit } = req.query;
    const gifs = await gifService.getTrendingGiphy(parseInt(limit as string) || 25);

    res.json({
      success: true,
      data: gifs,
      source: 'GIPHY',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * GET /api/v1/gifs/trending/tenor
 * Get trending GIFs from Tenor
 */
router.get('/trending/tenor', async (req: AuthRequest, res: Response) => {
  try {
    const { limit } = req.query;
    const gifs = await gifService.getTrendingTenor(parseInt(limit as string) || 25);

    res.json({
      success: true,
      data: gifs,
      source: 'TENOR',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * POST /api/v1/gifs/favorites
 * Save GIF to favorites
 */
router.post('/favorites', async (req: AuthRequest, res: Response) => {
  try {
    const gif = await gifService.saveFavoriteGif(req.user!.id, req.body);

    res.status(201).json({
      success: true,
      data: gif,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * GET /api/v1/gifs/favorites
 * Get user's favorite GIFs
 */
router.get('/favorites', async (req: AuthRequest, res: Response) => {
  try {
    const favorites = await gifService.getFavoriteGifs(req.user!.id);

    res.json({
      success: true,
      data: favorites,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

export default router;