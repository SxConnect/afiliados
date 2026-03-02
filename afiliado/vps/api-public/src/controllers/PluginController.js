/**
 * Plugin Controller
 * Handles plugin validation endpoints
 */

const PluginService = require('../services/PluginService');

class PluginController {
    constructor() {
        this.pluginService = new PluginService();
    }

    /**
     * POST /plugin/check
     * Check if plugin is authorized
     */
    async check(req, res) {
        try {
            const { licenseId, userId, machineId } = req.user;
            const { pluginId } = req.body;

            if (!pluginId) {
                return res.status(400).json({ error: 'Plugin ID is required' });
            }

            const result = await this.pluginService.checkPlugin(licenseId, userId, pluginId);

            if (!result.success) {
                return res.status(404).json({ error: result.error });
            }

            // Log usage
            const ipAddress = req.ip || req.connection.remoteAddress;
            await this.pluginService.logPluginUsage(
                licenseId,
                machineId,
                pluginId,
                'check',
                ipAddress
            );

            res.json(result);

        } catch (error) {
            console.error('Error in check:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * GET /plugin/list
     * Get all authorized plugins
     */
    async list(req, res) {
        try {
            const { licenseId, userId } = req.user;

            const result = await this.pluginService.getAuthorizedPlugins(licenseId, userId);

            if (!result.success) {
                return res.status(404).json({ error: result.error });
            }

            res.json(result);

        } catch (error) {
            console.error('Error in list:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new PluginController();
