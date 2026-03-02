/**
 * License Controller
 * Handles license status endpoints
 */

const LicenseService = require('../services/LicenseService');

class LicenseController {
    constructor() {
        this.licenseService = new LicenseService();
    }

    /**
     * GET /license/status
     * Get license status and details
     */
    async getStatus(req, res) {
        try {
            const { licenseId, userId } = req.user;

            const result = await this.licenseService.getStatus(licenseId, userId);

            if (!result.success) {
                return res.status(404).json({ error: result.error });
            }

            res.json(result);

        } catch (error) {
            console.error('Error in getStatus:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * GET /license/quota
     * Check quota availability
     */
    async checkQuota(req, res) {
        try {
            const { licenseId, userId } = req.user;
            const amount = parseInt(req.query.amount) || 1;

            const result = await this.licenseService.checkQuota(licenseId, userId, amount);

            if (!result.success) {
                return res.status(404).json({ error: result.error });
            }

            res.json(result);

        } catch (error) {
            console.error('Error in checkQuota:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new LicenseController();
