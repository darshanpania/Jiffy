/**
 * Request Validation Middleware
 */

const { validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: errors.array(),
    });
  }
  
  next();
};

module.exports = { validate };
