/**
 * Plugin Routes
 */

const express = require('express');
const router = express.Router();
const PluginController = require('../controllers/PluginController');
const { verifyToken } = require('../middlewares/authMiddleware');

// POST /plugin/check - Check plugin authorization
router.post('/check', verifyToken, PluginController.check.bind(PluginController));

// GET /plugin/list - List authorized plugins
router.get('/list', verifyToken, PluginController.list.bind(PluginController));

module.exports = router;
