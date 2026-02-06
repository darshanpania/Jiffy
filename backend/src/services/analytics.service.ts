import axios from 'axios';
import logger from '../utils/logger';

/**
 * PostHog Analytics Service
 * Track backend events and API usage
 */
export class AnalyticsService {
  private apiKey: string;
  private host: string;
  private enabled: boolean;

  constructor() {
    this.apiKey = process.env.POSTHOG_API_KEY || '';
    this.host = process.env.POSTHOG_HOST || 'https://app.posthog.com';
    this.enabled = !!this.apiKey && process.env.NODE_ENV === 'production';

    if (!this.enabled) {
      logger.warn('PostHog analytics disabled (missing API key or not in production)');
    }
  }

  /**
   * Track event
   */
  async capture(event: string, properties: Record<string, any> = {}, distinctId?: string) {
    if (!this.enabled) {
      logger.debug(`[Analytics] ${event}`, properties);
      return;
    }

    try {
      await axios.post(
        `${this.host}/capture/`,
        {
          api_key: this.apiKey,
          event,
          properties: {
            ...properties,
            source: 'backend',
            timestamp: new Date().toISOString(),
          },
          distinct_id: distinctId || 'backend-system',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      logger.debug(`Event tracked: ${event}`);
    } catch (error) {
      logger.error('Failed to track event:', error);
    }
  }

  /**
   * Track API request
   */
  async trackApiRequest(
    method: string,
    path: string,
    statusCode: number,
    responseTime: number,
    userId?: string
  ) {
    await this.capture(
      'api_request',
      {
        method,
        path,
        status_code: statusCode,
        response_time_ms: responseTime,
      },
      userId
    );
  }

  /**
   * Track error
   */
  async trackError(
    errorMessage: string,
    errorCode: string,
    path: string,
    userId?: string
  ) {
    await this.capture(
      'api_error',
      {
        error_message: errorMessage,
        error_code: errorCode,
        path,
      },
      userId
    );
  }

  /**
   * Track FCM notification sent
   */
  async trackNotification(
    type: string,
    recipientCount: number,
    successCount: number
  ) {
    await this.capture('notification_sent', {
      notification_type: type,
      recipient_count: recipientCount,
      success_count: successCount,
      success_rate: (successCount / recipientCount) * 100,
    });
  }

  /**
   * Track GIF API usage
   */
  async trackGifSearch(
    source: 'GIPHY' | 'TENOR',
    query: string,
    resultCount: number,
    userId?: string
  ) {
    await this.capture(
      'gif_search_backend',
      {
        source,
        query,
        result_count: resultCount,
      },
      userId
    );
  }
}

export default new AnalyticsService();