/**
 * License Routes
 */

const express = require('express');
const router = express.Router();
const LicenseController = require('../controllers/LicenseController');
const { verifyToken } = require('../middlewares/authMiddleware');

// GET /license/status - Get license status
router.get('/status', verifyToken, LicenseController.getStatus.bind(LicenseController));

// GET /license/quota - Check quota
router.get('/quota', verifyToken, LicenseController.checkQuota.bind(LicenseController));

module.exports = router;
