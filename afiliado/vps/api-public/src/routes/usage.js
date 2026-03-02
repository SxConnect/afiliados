/**
 * Usage Routes
 */

const express = require('express');
const router = express.Router();
const UsageController = require('../controllers/UsageController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { usageLimiter } = require('../middlewares/rateLimitMiddleware');

// POST /usage/report - Report usage
router.post('/report', verifyToken, usageLimiter, UsageController.report.bind(UsageController));

module.exports = router;
