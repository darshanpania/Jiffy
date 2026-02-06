/**
 * Authentication Routes
 * Handles token verification and session management
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Verify token
router.post('/verify', authController.verifyToken);

// Refresh session
router.post('/refresh', authController.refreshSession);

// Sign out (with auth)
router.post('/signout', authMiddleware, authController.signOut);

// Get current user
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
