import axios from 'axios';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

interface GifItem {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  source: 'GIPHY' | 'TENOR';
}

export class GifService {
  private giphyApiKey: string;
  private tenorApiKey: string;
  private giphyBaseUrl = 'https://api.giphy.com/v1/gifs';
  private tenorBaseUrl = 'https://tenor.googleapis.com/v2';

  constructor() {
    this.giphyApiKey = process.env.GIPHY_API_KEY || '';
    this.tenorApiKey = process.env.TENOR_API_KEY || '';

    if (!this.giphyApiKey) {
      logger.warn('GIPHY API key not configured');
    }
    if (!this.tenorApiKey) {
      logger.warn('Tenor API key not configured');
    }
  }

  /**
   * Search GIFs from GIPHY
   */
  async searchGiphy(query: string, limit: number = 25, offset: number = 0): Promise<GifItem[]> {
    try {
      if (!this.giphyApiKey) {
        throw new AppError('GIPHY API key not configured', 500);
      }

      const response = await axios.get(`${this.giphyBaseUrl}/search`, {
        params: {
          api_key: this.giphyApiKey,
          q: query,
          limit,
          offset,
          rating: 'pg-13',
          lang: 'en',
        },
      });

      const gifs: GifItem[] = response.data.data.map((gif: any) => ({
        id: gif.id,
        title: gif.title || '',
        url: gif.images.original.url,
        previewUrl: gif.images.downsized.url,
        thumbnailUrl: gif.images.fixed_width_small.url,
        width: parseInt(gif.images.original.width),
        height: parseInt(gif.images.original.height),
        source: 'GIPHY' as const,
      }));

      logger.info(`GIPHY search: "${query}" returned ${gifs.length} results`);
      return gifs;
    } catch (error: any) {
      logger.error('GIPHY search failed:', error.message);
      throw new AppError('GIPHY search failed', 500);
    }
  }

  /**
   * Get trending GIFs from GIPHY
   */
  async getTrendingGiphy(limit: number = 25): Promise<GifItem[]> {
    try {
      if (!this.giphyApiKey) {
        throw new AppError('GIPHY API key not configured', 500);
      }

      const response = await axios.get(`${this.giphyBaseUrl}/trending`, {
        params: {
          api_key: this.giphyApiKey,
          limit,
          rating: 'pg-13',
        },
      });

      const gifs: GifItem[] = response.data.data.map((gif: any) => ({
        id: gif.id,
        title: gif.title || '',
        url: gif.images.original.url,
        previewUrl: gif.images.downsized.url,
        thumbnailUrl: gif.images.fixed_width_small.url,
        width: parseInt(gif.images.original.width),
        height: parseInt(gif.images.original.height),
        source: 'GIPHY' as const,
      }));

      return gifs;
    } catch (error) {
      throw new AppError('Failed to fetch trending GIFs from GIPHY', 500);
    }
  }

  /**
   * Search GIFs from Tenor
   */
  async searchTenor(query: string, limit: number = 25, pos: string = ''): Promise<GifItem[]> {
    try {
      if (!this.tenorApiKey) {
        throw new AppError('Tenor API key not configured', 500);
      }

      const response = await axios.get(`${this.tenorBaseUrl}/search`, {
        params: {
          key: this.tenorApiKey,
          q: query,
          limit,
          pos: pos || undefined,
          media_filter: 'gif',
          contentfilter: 'medium',
        },
      });

      const gifs: GifItem[] = response.data.results.map((gif: any) => ({
        id: gif.id,
        title: gif.content_description || gif.title || '',
        url: gif.media_formats.gif.url,
        previewUrl: gif.media_formats.tinygif?.url || gif.media_formats.gif.url,
        thumbnailUrl: gif.media_formats.nanogif?.url || gif.media_formats.tinygif?.url,
        width: gif.media_formats.gif.dims[0],
        height: gif.media_formats.gif.dims[1],
        source: 'TENOR' as const,
      }));

      logger.info(`Tenor search: "${query}" returned ${gifs.length} results`);
      return gifs;
    } catch (error: any) {
      logger.error('Tenor search failed:', error.message);
      throw new AppError('Tenor search failed', 500);
    }
  }

  /**
   * Get trending GIFs from Tenor
   */
  async getTrendingTenor(limit: number = 25): Promise<GifItem[]> {
    try {
      if (!this.tenorApiKey) {
        throw new AppError('Tenor API key not configured', 500);
      }

      const response = await axios.get(`${this.tenorBaseUrl}/featured`, {
        params: {
          key: this.tenorApiKey,
          limit,
          media_filter: 'gif',
          contentfilter: 'medium',
        },
      });

      const gifs: GifItem[] = response.data.results.map((gif: any) => ({
        id: gif.id,
        title: gif.content_description || '',
        url: gif.media_formats.gif.url,
        previewUrl: gif.media_formats.tinygif?.url || gif.media_formats.gif.url,
        thumbnailUrl: gif.media_formats.nanogif?.url || gif.media_formats.tinygif?.url,
        width: gif.media_formats.gif.dims[0],
        height: gif.media_formats.gif.dims[1],
        source: 'TENOR' as const,
      }));

      return gifs;
    } catch (error) {
      throw new AppError('Failed to fetch trending GIFs from Tenor', 500);
    }
  }

  /**
   * Save favorite GIF to Supabase
   */
  async saveFavoriteGif(userId: string, gif: GifItem) {
    try {
      const { data, error } = await supabaseAdmin
        .from('favorite_gifs')
        .insert({
          user_id: userId,
          gif_id: gif.id,
          gif_url: gif.url,
          gif_source: gif.source,
          title: gif.title,
          thumbnail_url: gif.thumbnailUrl,
          preview_url: gif.previewUrl,
          width: gif.width,
          height: gif.height,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Duplicate key
          throw new AppError('GIF already in favorites', 400);
        }
        throw new AppError('Failed to save favorite GIF', 500);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's favorite GIFs
   */
  async getFavoriteGifs(userId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('favorite_gifs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new AppError('Failed to fetch favorite GIFs', 500);
      }

      return data || [];
    } catch (error) {
      throw error;
    }
  }
}

export default new GifService();