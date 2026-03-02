/**
 * Usage Controller
 * Handles usage reporting and quota consumption
 */

const LicenseService = require('../services/LicenseService');

class UsageController {
    constructor() {
        this.licenseService = new LicenseService();
    }

    /**
     * POST /usage/report
     * Report usage and consume quota
     */
    async report(req, res) {
        try {
            const { licenseId, userId, machineId } = req.user;
            const { action, amount } = req.body;

            if (!action) {
                return res.status(400).json({ error: 'Action is required' });
            }

            const quotaAmount = parseInt(amount) || 1;
            const ipAddress = req.ip || req.connection.remoteAddress;

            const result = await this.licenseService.consumeQuota(
                licenseId,
                userId,
                machineId,
                quotaAmount,
                action,
                ipAddress
            );

            if (!result.success) {
                return res.status(403).json({
                    error: result.error,
                    available: result.available,
                    requested: result.requested
                });
            }

            res.json(result);

        } catch (error) {
            console.error('Error in report:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new UsageController();
