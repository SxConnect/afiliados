/**
 * Plugin Registry Service
 * Gerencia o registro central de plugins
 * 
 * Responsabilidades:
 * - Registrar novos plugins
 * - Validar acesso a plugins
 * - Gerenciar trials de plugins
 * - Verificar dependências de features
 * - Controlar plugins premium
 */

const { getInstance: getPool } = require('../database/pool');
const { getInstance: getLogger } = require('../utils/logger');

class PluginRegistryService {
    constructor() {
        this.pool = getPool();
        this.logger = getLogger();
    }

    /**
     * Registra novo plugin no sistema
     */
    async registerPlugin(pluginData) {
        try {
            const query = `
                INSERT INTO plugin_registry (
                    plugin_key,
                    name,
                    description,
                    version,
                    category,
                    is_premium,
                    base_price,
                    requires_features,
                    metadata,
                    is_active
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `;

            const values = [
                pluginData.plugin_key,
                pluginData.name,
                pluginData.description || null,
                pluginData.version || '1.0.0',
                pluginData.category || 'general',
                pluginData.is_premium || false,
                pluginData.base_price || 0,
                JSON.stringify(pluginData.requires_features || []),
                JSON.stringify(pluginData.metadata || {}),
                pluginData.is_active !== undefined ? pluginData.is_active : true
            ];

            const plugin = await this.pool.queryOne(query, values);

            this.logger.info('Plugin registered', {
                pluginKey: plugin.plugin_key,
                version: plugin.version
            });

            return { success: true, plugin };

        } catch (error) {
            this.logger.error('Error registering plugin', {
                error: error.message,
                pluginKey: pluginData.plugin_key
            });
            throw error;
        }
    }

    /**
     * Busca plugin por key
     */
    async getPlugin(pluginKey) {
        const query = `
            SELECT *
            FROM plugin_registry
            WHERE plugin_key = $1
            AND deleted_at IS NULL
        `;

        return await this.pool.queryOne(query, [pluginKey]);
    }

    /**
     * Lista todos os plugins
     */
    async listPlugins({ category, isPremium, isActive } = {}) {
        let query = `
            SELECT *
            FROM plugin_registry
            WHERE deleted_at IS NULL
        `;

        const params = [];
        let paramIndex = 1;

        if (category) {
            query += ` AND category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        if (isPremium !== undefined) {
            query += ` AND is_premium = $${paramIndex}`;
            params.push(isPremium);
            paramIndex++;
        }

        if (isActive !== undefined) {
            query += ` AND is_active = $${paramIndex}`;
            params.push(isActive);
            paramIndex++;
        }

        query += ` ORDER BY category, name`;

        return await this.pool.queryMany(query, params);
    }

    /**
     * Verifica se licença tem acesso ao plugin
     */
    async checkAccess(licenseId, pluginKey) {
        try {
            // 1. Buscar plugin
            const plugin = await this.getPlugin(pluginKey);
            if (!plugin) {
                return {
                    allowed: false,
                    reason: 'plugin_not_found'
                };
            }

            if (!plugin.is_active) {
                return {
                    allowed: false,
                    reason: 'plugin_inactive'
                };
            }

            // 2. Verificar entitlement do plugin
            const entitlementQuery = `
                SELECT *
                FROM plugin_entitlements
                WHERE license_id = $1
                AND plugin_id = $2
                AND deleted_at IS NULL
            `;

            const entitlement = await this.pool.queryOne(entitlementQuery, [licenseId, plugin.id]);

            if (!entitlement) {
                return {
                    allowed: false,
                    reason: 'no_entitlement',
                    plugin
                };
            }

            if (!entitlement.is_enabled) {
                return {
                    allowed: false,
                    reason: 'entitlement_disabled',
                    plugin
                };
            }

            // 3. Verificar trial
            if (entitlement.trial_ends_at) {
                const trialEnded = new Date(entitlement.trial_ends_at) < new Date();
                if (trialEnded) {
                    return {
                        allowed: false,
                        reason: 'trial_expired',
                        trial_ended_at: entitlement.trial_ends_at,
                        plugin
                    };
                }
            }

            // 4. Verificar quota do plugin (se aplicável)
            if (entitlement.quota_limit) {
                if (entitlement.quota_used >= entitlement.quota_limit) {
                    return {
                        allowed: false,
                        reason: 'quota_exceeded',
                        quota_limit: entitlement.quota_limit,
                        quota_used: entitlement.quota_used,
                        plugin
                    };
                }
            }

            // 5. Verificar features requeridas
            if (plugin.requires_features && plugin.requires_features.length > 0) {
                const hasRequiredFeatures = await this.checkRequiredFeatures(
                    licenseId,
                    plugin.requires_features
                );

                if (!hasRequiredFeatures.success) {
                    return {
                        allowed: false,
                        reason: 'missing_required_features',
                        missing_features: hasRequiredFeatures.missing,
                        plugin
                    };
                }
            }

            // Acesso permitido
            return {
                allowed: true,
                entitlement,
                plugin,
                is_trial: entitlement.trial_ends_at && new Date(entitlement.trial_ends_at) > new Date(),
                trial_ends_at: entitlement.trial_ends_at,
                quota_remaining: entitlement.quota_limit
                    ? entitlement.quota_limit - entitlement.quota_used
                    : null
            };

        } catch (error) {
            this.logger.error('Error checking plugin access', {
                error: error.message,
                licenseId,
                pluginKey
            });
            throw error;
        }
    }

    /**
     * Verifica se licença tem features requeridas
     */
    async checkRequiredFeatures(licenseId, requiredFeatures) {
        const query = `
            SELECT f.feature_key, pf.value
            FROM licenses l
            JOIN plan_features pf ON l.plan_id = pf.plan_id
            JOIN features f ON pf.feature_id = f.id
            WHERE l.id = $1
            AND f.feature_key = ANY($2)
            AND pf.is_enabled = true
            AND pf.deleted_at IS NULL
        `;

        const features = await this.pool.queryMany(query, [licenseId, requiredFeatures]);

        const foundKeys = features.map(f => f.feature_key);
        const missing = requiredFeatures.filter(key => !foundKeys.includes(key));

        return {
            success: missing.length === 0,
            found: foundKeys,
            missing
        };
    }

    /**
     * Concede acesso a plugin para licença
     */
    async grantAccess(licenseId, pluginKey, options = {}) {
        try {
            // Buscar plugin
            const plugin = await this.getPlugin(pluginKey);
            if (!plugin) {
                throw new Error('Plugin not found');
            }

            // Buscar user_id da licença
            const licenseQuery = `SELECT user_id FROM licenses WHERE id = $1`;
            const license = await this.pool.queryOne(licenseQuery, [licenseId]);

            // Verificar se já existe entitlement
            const existingQuery = `
                SELECT id FROM plugin_entitlements
                WHERE license_id = $1 AND plugin_id = $2 AND deleted_at IS NULL
            `;
            const existing = await this.pool.queryOne(existingQuery, [licenseId, plugin.id]);

            if (existing) {
                // Atualizar existente
                const updateQuery = `
                    UPDATE plugin_entitlements
                    SET 
                        is_enabled = $1,
                        granted_by = $2,
                        trial_ends_at = $3,
                        quota_limit = $4,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $5
                    RETURNING *
                `;

                return await this.pool.queryOne(updateQuery, [
                    options.is_enabled !== undefined ? options.is_enabled : true,
                    options.granted_by || 'admin_override',
                    options.trial_ends_at || null,
                    options.quota_limit || null,
                    existing.id
                ]);
            }

            // Criar novo entitlement
            const insertQuery = `
                INSERT INTO plugin_entitlements (
                    user_id,
                    license_id,
                    plugin_id,
                    is_enabled,
                    granted_by,
                    trial_ends_at,
                    quota_limit,
                    quota_used
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, 0)
                RETURNING *
            `;

            const entitlement = await this.pool.queryOne(insertQuery, [
                license.user_id,
                licenseId,
                plugin.id,
                options.is_enabled !== undefined ? options.is_enabled : true,
                options.granted_by || 'admin_override',
                options.trial_ends_at || null,
                options.quota_limit || null
            ]);

            this.logger.info('Plugin access granted', {
                licenseId,
                pluginKey,
                grantedBy: options.granted_by
            });

            return entitlement;

        } catch (error) {
            this.logger.error('Error granting plugin access', {
                error: error.message,
                licenseId,
                pluginKey
            });
            throw error;
        }
    }

    /**
     * Revoga acesso a plugin
     */
    async revokeAccess(licenseId, pluginKey) {
        const plugin = await this.getPlugin(pluginKey);
        if (!plugin) {
            throw new Error('Plugin not found');
        }

        const query = `
            UPDATE plugin_entitlements
            SET 
                is_enabled = false,
                updated_at = CURRENT_TIMESTAMP
            WHERE license_id = $1
            AND plugin_id = $2
            AND deleted_at IS NULL
            RETURNING *
        `;

        const result = await this.pool.queryOne(query, [licenseId, plugin.id]);

        this.logger.info('Plugin access revoked', { licenseId, pluginKey });

        return result;
    }

    /**
     * Inicia trial de plugin
     */
    async startTrial(licenseId, pluginKey, durationDays = 7) {
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + durationDays);

        return await this.grantAccess(licenseId, pluginKey, {
            granted_by: 'trial',
            trial_ends_at: trialEndsAt,
            is_enabled: true
        });
    }

    /**
     * Incrementa uso de plugin
     */
    async incrementUsage(licenseId, pluginKey, amount = 1) {
        const plugin = await this.getPlugin(pluginKey);
        if (!plugin) {
            throw new Error('Plugin not found');
        }

        const query = `
            UPDATE plugin_entitlements
            SET 
                quota_used = quota_used + $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE license_id = $1
            AND plugin_id = $2
            AND deleted_at IS NULL
            RETURNING *
        `;

        return await this.pool.queryOne(query, [licenseId, plugin.id, amount]);
    }

    /**
     * Lista plugins disponíveis para uma licença
     */
    async getAvailablePlugins(licenseId) {
        const query = `
            SELECT 
                pr.*,
                pe.is_enabled,
                pe.granted_by,
                pe.trial_ends_at,
                pe.quota_limit,
                pe.quota_used,
                CASE 
                    WHEN pe.trial_ends_at IS NOT NULL AND pe.trial_ends_at > CURRENT_TIMESTAMP THEN true
                    ELSE false
                END as is_trial_active
            FROM plugin_registry pr
            LEFT JOIN plugin_entitlements pe ON pr.id = pe.plugin_id AND pe.license_id = $1 AND pe.deleted_at IS NULL
            WHERE pr.deleted_at IS NULL
            AND pr.is_active = true
            ORDER BY pr.category, pr.name
        `;

        return await this.pool.queryMany(query, [licenseId]);
    }
}

// Singleton
let instance = null;

module.exports = {
    getInstance: () => {
        if (!instance) {
            instance = new PluginRegistryService();
        }
        return instance;
    },
    PluginRegistryService
};
