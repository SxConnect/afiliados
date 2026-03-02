/**
 * Plugin Service
 * Handles plugin validation and permissions
 */

const { getInstance: getQueries } = require('../../../shared/database/queries');
const { getInstance: getLogger } = require('../../../shared/utils/logger');

class PluginService {
    constructor() {
        this.queries = getQueries();
        this.logger = getLogger();
    }

    /**
     * Check if plugin is authorized for license
     */
    async checkPlugin(licenseId, userId, pluginId) {
        try {
            const license = await this.queries.findById('licenses', licenseId);

            if (!license || license.user_id !== userId) {
                return { success: false, error: 'License not found', authorized: false };
            }

            // Get plan
            const plan = await this.queries.findById('plans', license.plan_id);

            // Check plugin permission
            const permission = await this.queries.pool.queryOne(
                `SELECT * FROM plugin_permissions 
                 WHERE plan_id = $1 AND plugin_id = $2 AND is_enabled = true AND deleted_at IS NULL`,
                [plan.id, pluginId]
            );

            const authorized = !!permission;

            this.logger.info('Plugin check', {
                licenseId,
                pluginId,
                authorized,
                plan: plan.name
            });

            return {
                success: true,
                pluginId,
                authorized,
                plan: plan.name,
                message: authorized
                    ? `Plugin ${pluginId} is authorized`
                    : `Plugin ${pluginId} requires upgrade to ${this.getRequiredPlan(pluginId)}`
            };

        } catch (error) {
            this.logger.error('Error checking plugin', { error: error.message, licenseId, pluginId });
            throw error;
        }
    }

    /**
     * Get all authorized plugins for license
     */
    async getAuthorizedPlugins(licenseId, userId) {
        try {
            const license = await this.queries.findById('licenses', licenseId);

            if (!license || license.user_id !== userId) {
                return { success: false, error: 'License not found' };
            }

            const plan = await this.queries.findById('plans', license.plan_id);

            // Get all plugins for plan
            const plugins = await this.queries.pool.queryMany(
                `SELECT plugin_id, plugin_name, is_enabled, metadata
                 FROM plugin_permissions
                 WHERE plan_id = $1 AND is_enabled = true AND deleted_at IS NULL
                 ORDER BY plugin_name`,
                [plan.id]
            );

            return {
                success: true,
                plan: plan.name,
                plugins: plugins.map(p => ({
                    id: p.plugin_id,
                    name: p.plugin_name,
                    enabled: p.is_enabled,
                    metadata: p.metadata
                }))
            };

        } catch (error) {
            this.logger.error('Error getting authorized plugins', { error: error.message, licenseId });
            throw error;
        }
    }

    /**
     * Get required plan for plugin
     */
    getRequiredPlan(pluginId) {
        const pluginPlans = {
            'auto-responder': 'Free',
            'message-scheduler': 'Basic',
            'bulk-sender': 'Pro',
            'analytics': 'Pro',
            'api-integration': 'Enterprise',
            'custom-webhooks': 'Enterprise'
        };

        return pluginPlans[pluginId] || 'Pro';
    }

    /**
     * Log plugin usage
     */
    async logPluginUsage(licenseId, machineId, pluginId, action, ipAddress) {
        try {
            await this.queries.createUsageLog({
                license_id: licenseId,
                machine_id: machineId,
                action: `plugin_${action}`,
                quota_consumed: 0,
                ip_address: ipAddress,
                metadata: { plugin_id: pluginId }
            });

            this.logger.debug('Plugin usage logged', { licenseId, pluginId, action });

        } catch (error) {
            this.logger.error('Error logging plugin usage', { error: error.message });
        }
    }
}

module.exports = PluginService;
