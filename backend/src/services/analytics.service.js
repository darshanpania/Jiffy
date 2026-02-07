const { PostHog } = require('posthog-node');
const logger = require('../config/logger');
const config = require('../config/config');

/**
 * Analytics Service (PostHog)
 * Optional backend event tracking for monitoring and insights
 */
class AnalyticsService {
  constructor() {
    this.enabled = false;
    this.client = null;
    
    // Initialize PostHog if configured
    if (config.posthog && config.posthog.apiKey) {
      try {
        this.client = new PostHog(
          config.posthog.apiKey,
          {
            host: config.posthog.host || 'https://app.posthog.com',
            flushAt: 20, // Batch size
            flushInterval: 10000, // Flush every 10 seconds
          }
        );
        
        this.enabled = true;
        logger.info('PostHog analytics enabled');
      } catch (error) {
        logger.warn('PostHog initialization failed:', error.message);
      }
    } else {
      logger.debug('PostHog not configured - analytics disabled');
    }
  }
  
  /**
   * Track event
   */
  track(userId, event, properties = {}) {
    if (!this.enabled || !this.client) return;
    
    try {
      this.client.capture({
        distinctId: userId,
        event,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          environment: config.env,
        },
      });
      
      logger.debug(`Analytics: ${event} for ${userId}`);
    } catch (error) {
      logger.error('Analytics track error:', error.message);
    }
  }
  
  /**
   * Track user signup
   */
  trackSignup(userId, properties = {}) {
    this.track(userId, 'user_signup', {
      ...properties,
      source: 'backend',
    });
  }
  
  /**
   * Track user login
   */
  trackLogin(userId, properties = {}) {
    this.track(userId, 'user_login', properties);
  }
  
  /**
   * Track chat created
   */
  trackChatCreated(userId, chatId, chatType) {
    this.track(userId, 'chat_created', {
      chat_id: chatId,
      chat_type: chatType,
    });
  }
  
  /**
   * Track message sent
   */
  trackMessageSent(userId, chatId, messageType) {
    this.track(userId, 'message_sent', {
      chat_id: chatId,
      message_type: messageType,
    });
  }
  
  /**
   * Track GIF search
   */
  trackGifSearch(userId, query, source, cached) {
    this.track(userId, 'gif_search', {
      query,
      source,
      cached,
    });
  }
  
  /**
   * Track GIF favorite
   */
  trackGifFavorite(userId, gifId, source) {
    this.track(userId, 'gif_favorited', {
      gif_id: gifId,
      source,
    });
  }
  
  /**
   * Identify user with properties
   */
  identify(userId, properties = {}) {
    if (!this.enabled || !this.client) return;
    
    try {
      this.client.identify({
        distinctId: userId,
        properties: {
          ...properties,
          environment: config.env,
        },
      });
    } catch (error) {
      logger.error('Analytics identify error:', error.message);
    }
  }
  
  /**
   * Flush events (shutdown)
   */
  async flush() {
    if (!this.enabled || !this.client) return;
    
    try {
      await this.client.shutdown();
      logger.info('Analytics flushed');
    } catch (error) {
      logger.error('Analytics flush error:', error.message);
    }
  }
}

module.exports = new AnalyticsService();
