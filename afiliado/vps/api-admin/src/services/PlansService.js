/**
 * Plans Service (Admin)
 * CRUD operations for subscription plans
 */

const { getInstance: getQueries } = require('../../../shared/database/queries');
const { getInstance: getLogger } = require('../../../shared/utils/logger');

class PlansService {
    constructor() {
        this.queries = getQueries();
        this.logger = getLogger();
    }

    /**
     * List all plans
     */
    async list({ includeInactive = false } = {}) {
        try {
            let query = `
                SELECT p.*,
                       COUNT(DISTINCT l.id) as license_count,
                       COUNT(DISTINCT s.id) as subscription_count
                FROM plans p
                LEFT JOIN licenses l ON p.id = l.plan_id AND l.deleted_at IS NULL
                LEFT JOIN subscriptions s ON p.id = s.plan_id AND s.deleted_at IS NULL
                WHERE p.deleted_at IS NULL
            `;

            if (!includeInactive) {
                query += ` AND p.is_active = true`;
            }

            query += ` GROUP BY p.id ORDER BY p.sort_order ASC, p.created_at DESC`;

            const plans = await this.queries.pool.queryMany(query);

            return { success: true, plans };

        } catch (error) {
            this.logger.error('Error listing plans', { error: error.message });
            throw error;
        }
    }

    /**
     * Get plan by ID
     */
    async getById(planId) {
        try {
            const plan = await this.queries.findById('plans', planId);
            if (!plan) {
                return { success: false, error: 'Plan not found' };
            }

            // Get plugin permissions
            const plugins = await this.queries.pool.queryMany(
                `SELECT * FROM plugin_permissions WHERE plan_id = $1 AND deleted_at IS NULL`,
                [planId]
            );

            // Get statistics
            const stats = await this.queries.pool.queryOne(
                `SELECT
                    COUNT(DISTINCT l.id) as total_licenses,
                    COUNT(DISTINCT CASE WHEN l.status = 'active' THEN l.id END) as active_licenses,
                    COUNT(DISTINCT s.id) as total_subscriptions,
                    COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active_subscriptions
                 FROM plans p
                 LEFT JOIN licenses l ON p.id = l.plan_id AND l.deleted_at IS NULL
                 LEFT JOIN subscriptions s ON p.id = s.plan_id AND s.deleted_at IS NULL
                 WHERE p.id = $1`,
                [planId]
            );

            return {
                success: true,
                plan: {
                    ...plan,
                    plugins,
                    stats
                }
            };

        } catch (error) {
            this.logger.error('Error getting plan', { error: error.message, planId });
            throw error;
        }
    }

    /**
     * Create plan
     */
    async create(data, adminId) {
        try {
            // Validate required fields
            if (!data.name || !data.slug || data.price_monthly === undefined) {
                return { success: false, error: 'Missing required fields' };
            }

            // Check if slug already exists
            const existing = await this.queries.pool.queryOne(
                `SELECT id FROM plans WHERE slug = $1 AND deleted_at IS NULL`,
                [data.slug]
            );
            if (existing) {
                return { success: false, error: 'Slug already exists' };
            }

            // Create plan
            const plan = await this.queries.create('plans', {
                name: data.name,
                slug: data.slug,
                description: data.description || null,
                price_monthly: data.price_monthly,
                price_yearly: data.price_yearly || null,
                quota_monthly: data.quota_monthly || 0,
                max_machines: data.max_machines || 1,
                features: data.features || [],
                is_active: data.is_active !== undefined ? data.is_active : true,
                sort_order: data.sort_order || 0
            });

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: adminId,
                action: 'create',
                resource_type: 'plans',
                resource_id: plan.id,
                changes: { created: plan }
            });

            this.logger.info('Plan created', { planId: plan.id, adminId });

            return { success: true, plan };

        } catch (error) {
            this.logger.error('Error creating plan', { error: error.message });
            throw error;
        }
    }

    /**
     * Update plan
     */
    async update(planId, data, adminId) {
        try {
            const oldPlan = await this.queries.findById('plans', planId);
            if (!oldPlan) {
                return { success: false, error: 'Plan not found' };
            }

            // Update plan
            const plan = await this.queries.update('plans', planId, {
                name: data.name !== undefined ? data.name : oldPlan.name,
                description: data.description !== undefined ? data.description : oldPlan.description,
                price_monthly: data.price_monthly !== undefined ? data.price_monthly : oldPlan.price_monthly,
                price_yearly: data.price_yearly !== undefined ? data.price_yearly : oldPlan.price_yearly,
                quota_monthly: data.quota_monthly !== undefined ? data.quota_monthly : oldPlan.quota_monthly,
                max_machines: data.max_machines !== undefined ? data.max_machines : oldPlan.max_machines,
                features: data.features !== undefined ? data.features : oldPlan.features,
                is_active: data.is_active !== undefined ? data.is_active : oldPlan.is_active,
                sort_order: data.sort_order !== undefined ? data.sort_order : oldPlan.sort_order
            });

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: adminId,
                action: 'update',
                resource_type: 'plans',
                resource_id: planId,
                changes: { old: oldPlan, new: plan }
            });

            this.logger.info('Plan updated', { planId, adminId });

            return { success: true, plan };

        } catch (error) {
            this.logger.error('Error updating plan', { error: error.message, planId });
            throw error;
        }
    }

    /**
     * Delete plan (soft delete)
     */
    async delete(planId, adminId) {
        try {
            // Check if plan has active licenses
            const activeLicenses = await this.queries.pool.queryOne(
                `SELECT COUNT(*) as count FROM licenses 
                 WHERE plan_id = $1 AND status = 'active' AND deleted_at IS NULL`,
                [planId]
            );

            if (parseInt(activeLicenses.count) > 0) {
                return {
                    success: false,
                    error: 'Cannot delete plan with active licenses'
                };
            }

            const plan = await this.queries.softDelete('plans', planId);
            if (!plan) {
                return { success: false, error: 'Plan not found' };
            }

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: adminId,
                action: 'delete',
                resource_type: 'plans',
                resource_id: planId
            });

            this.logger.info('Plan deleted', { planId, adminId });

            return { success: true };

        } catch (error) {
            this.logger.error('Error deleting plan', { error: error.message, planId });
            throw error;
        }
    }

    /**
     * Add plugin permission to plan
     */
    async addPlugin(planId, pluginData, adminId) {
        try {
            const plan = await this.queries.findById('plans', planId);
            if (!plan) {
                return { success: false, error: 'Plan not found' };
            }

            // Check if plugin already exists
            const existing = await this.queries.pool.queryOne(
                `SELECT id FROM plugin_permissions 
                 WHERE plan_id = $1 AND plugin_id = $2 AND deleted_at IS NULL`,
                [planId, pluginData.plugin_id]
            );

            if (existing) {
                return { success: false, error: 'Plugin already added to this plan' };
            }

            const plugin = await this.queries.create('plugin_permissions', {
                plan_id: planId,
                plugin_id: pluginData.plugin_id,
                plugin_name: pluginData.plugin_name,
                is_enabled: pluginData.is_enabled !== undefined ? pluginData.is_enabled : true,
                metadata: pluginData.metadata || {}
            });

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: adminId,
                action: 'add_plugin',
                resource_type: 'plans',
                resource_id: planId,
                changes: { plugin }
            });

            this.logger.info('Plugin added to plan', { planId, pluginId: plugin.id, adminId });

            return { success: true, plugin };

        } catch (error) {
            this.logger.error('Error adding plugin to plan', { error: error.message, planId });
            throw error;
        }
    }

    /**
     * Remove plugin permission from plan
     */
    async removePlugin(planId, pluginId, adminId) {
        try {
            const plugin = await this.queries.pool.queryOne(
                `UPDATE plugin_permissions 
                 SET deleted_at = CURRENT_TIMESTAMP
                 WHERE plan_id = $1 AND id = $2 AND deleted_at IS NULL
                 RETURNING *`,
                [planId, pluginId]
            );

            if (!plugin) {
                return { success: false, error: 'Plugin not found' };
            }

            // Log audit
            await this.queries.createAuditLog({
                actor_type: 'admin',
                actor_id: adminId,
                action: 'remove_plugin',
                resource_type: 'plans',
                resource_id: planId,
                changes: { plugin }
            });

            this.logger.info('Plugin removed from plan', { planId, pluginId, adminId });

            return { success: true };

        } catch (error) {
            this.logger.error('Error removing plugin from plan', { error: error.message, planId });
            throw error;
        }
    }
}

module.exports = PlansService;
