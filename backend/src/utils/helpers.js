/**
 * Helper Utilities
 */

const crypto = require('crypto');

class Helpers {
  /**
   * Generate random string
   */
  static generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
  
  /**
   * Hash string (for caching keys, etc.)
   */
  static hashString(str) {
    return crypto.createHash('sha256').update(str).digest('hex');
  }
  
  /**
   * Validate UUID
   */
  static isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
  
  /**
   * Sleep/delay function
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Retry function with exponential backoff
   */
  static async retry(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.sleep(delay * Math.pow(2, i));
      }
    }
  }
  
  /**
   * Sanitize user input
   */
  static sanitize(input) {
    if (typeof input !== 'string') return input;
    return input.replace(/[<>"']/g, '');
  }
  
  /**
   * Format timestamp
   */
  static formatTimestamp(date) {
    return new Date(date).toISOString();
  }
}

module.exports = Helpers;
