/**
 * Custom validation utilities
 */

export class Validators {
  /**
   * Validate UUID
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>"']/g, '') // Remove potentially dangerous characters
      .substring(0, 5000); // Limit length
  }

  /**
   * Validate display name
   */
  static isValidDisplayName(name: string): boolean {
    return name.length >= 3 && name.length <= 30;
  }

  /**
   * Validate FCM token
   */
  static isValidFCMToken(token: string): boolean {
    // FCM tokens are typically 152+ characters
    return token.length >= 100 && token.length <= 200;
  }
}

export default Validators;