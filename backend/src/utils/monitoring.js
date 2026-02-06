/**
 * Monitoring Utilities
 * Health checks and system metrics
 */

const supabase = require('../config/supabase');
const logger = require('../config/logger');

class MonitoringService {
  /**
   * Check Supabase connection
   */
  async checkSupabaseHealth() {
    try {
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      return !error;
    } catch (error) {
      logger.error('Supabase health check failed:', error);
      return false;
    }
  }
  
  /**
   * Get system metrics
   */
  getSystemMetrics() {
    return {
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      cpu: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform,
    };
  }
  
  /**
   * Comprehensive health check
   */
  async getHealthStatus() {
    const supabaseHealthy = await this.checkSupabaseHealth();
    const metrics = this.getSystemMetrics();
    
    return {
      status: supabaseHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        supabase: supabaseHealthy ? 'up' : 'down',
        fcm: process.env.FCM_PROJECT_ID ? 'configured' : 'not_configured',
        giphy: process.env.GIPHY_API_KEY ? 'configured' : 'not_configured',
        tenor: process.env.TENOR_API_KEY ? 'configured' : 'not_configured',
      },
      metrics,
    };
  }
}

module.exports = new MonitoringService();
