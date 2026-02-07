const { validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

/**
 * Validation Middleware
 * Processes express-validator results and returns formatted errors
 */

/**
 * Validate middleware
 * Checks validation results and returns 400 with errors if validation fails
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));
    
    logger.warn('Validation failed:', {
      url: req.url,
      method: req.method,
      errors: formattedErrors,
    });
    
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Bad Request',
      message: 'Validation failed',
      details: formattedErrors,
    });
  }
  
  next();
};

/**
 * Sanitize text input
 * Removes potentially harmful characters while preserving basic formatting
 */
const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Remove HTML tags and potentially harmful characters
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"]/g, '') // Remove common XSS characters
    .trim();
};

/**
 * Sanitize user input middleware
 * Can be applied to specific routes that need extra sanitization
 */
const sanitizeUserInput = (req, res, next) => {
  if (req.body) {
    // Sanitize common text fields
    if (req.body.displayName) {
      req.body.displayName = sanitizeText(req.body.displayName);
    }
    if (req.body.bio) {
      req.body.bio = sanitizeText(req.body.bio);
    }
    if (req.body.content) {
      req.body.content = sanitizeText(req.body.content);
    }
  }
  
  next();
};

module.exports = {
  validate,
  sanitizeText,
  sanitizeUserInput,
};
