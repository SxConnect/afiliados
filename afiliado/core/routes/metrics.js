const express = require('express');
const router = express.Router();
const VPSService = require('../services/VPSService');

/**
 * GET /api/metrics/quota
 * Obtém informações de quota
 */
router.get('/quota', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const quotaInfo = await VPSService.checkQuota(token);

        res.json({
            success: true,
            quota: quotaInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/metrics/system
 * Obtém métricas do sistema
 */
router.get('/system', (req, res) => {
    const used = process.memoryUsage();

    res.json({
        success: true,
        metrics: {
            memory: {
                rss: Math.round(used.rss / 1024 / 1024),
                heapTotal: Math.round(used.heapTotal / 1024 / 1024),
                heapUsed: Math.round(used.heapUsed / 1024 / 1024),
                external: Math.round(used.external / 1024 / 1024)
            },
            uptime: process.uptime(),
            platform: process.platform,
            nodeVersion: process.version
        }
    });
});

module.exports = router;
