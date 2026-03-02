/**
 * Auth Routes
 */

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimitMiddleware');

// POST /auth/validate - Validate license
router.post('/validate', authLimiter, AuthController.validate.bind(AuthController));

// POST /auth/refresh - Refresh token
router.post('/refresh', authLimiter, AuthController.refresh.bind(AuthController));

// GET /auth/verify - Verify token
router.get('/verify', verifyToken, AuthController.verify.bind(AuthController));

module.exports = router;
