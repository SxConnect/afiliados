/**
 * Entitlement Resolver Service
 * Serviço central para resolver e consolidar permissões de usuários
 * 
 * Responsabilidades:
 * - Consolidar permissões do plano base
 * - Aplicar add-ons ativos
 * - Aplicar overrides administrativos
 * - Aplicar trials ativos
 * - Gerar snapshot cacheável de permissões
 * - Invalidar cache quando necessário
 */

const { getInstance: getPool } = require('../database/pool');
const { getInstance: getLogger } = require('../utils/logger');

class EntitlementResolverService {
    constructor() {
        this.pool = getPool();
        this.logger = getLogger();
        this.CACHE_TTL = 3600; // 1 hora em segundos
    }

    /**
     * Resolve e retorna todas as permissões efetivas de uma licença
     * @param {string} licenseId - UUID da licença
     * @param {boolean} forceRefresh - Força recálculo ignorando cache
     * @returns {Promise<Object>} Entitlements consolidados
     */
    async resolve(licenseId, forceRefresh = false) {
        try {
            // 1. Verificar cache válido
            if (!forceRefresh) {
                const cached = await this.getCachedEntitlement(licenseId);
                if (cached) {
                    this.logger.debug('Entitlement cache hit', { licenseId });
                    return cached;
                }
            }

            // 2. Buscar dados base
            const licenseData = await this.getLicenseData(licenseId);
            if (!licenseData) {
                throw new Error('License not found');
            }

            // 3. Consolidar permissões
            const entitlement = await this.consolidateEntitlements(licenseData);

            // 4. Salvar snapshot
            await this.saveSnapshot(licenseData.user_id, licenseId, entitlement);

            this.logger.info('Entitlement resolved', {
                licenseId,
                userId: licenseData.user_id,
                version: entitlement.snapshot_version
            });

            return entitlement;

        } catch (error) {
            this.logger.error('Error resolving entitlement', {
                error: error.message,
                licenseId
            });
            throw error;
        }
    }

    /**
     * Busca entitlement do cache (tabela entitlements)
     */
    async getCachedEntitlement(licenseId) {
        const query = `
            SELECT *
            FROM entitlements
            WHERE license_id = $1
            AND is_valid = true
            AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
            ORDER BY snapshot_version DESC
            LIMIT 1
        `;

        const result = await this.pool.queryOne(query, [licenseId]);
        return result;
    }

    /**
     * Busca dados completos da licença
     */
    async getLicenseData(licenseId) {
        const query = `
            SELECT 
                l.id as license_id,
                l.user_id,
                l.plan_id,
                l.status as license_status,
                l.expiration_date,
                u.status as user_status,
                p.slug as plan_slug,
                p.name as plan_name,
                s.id as subscription_id,
                s.status as subscription_status
            FROM licenses l
            JOIN users u ON l.user_id = u.id
            JOIN plans p ON l.plan_id = p.id
            LEFT JOIN subscriptions s ON l.id = s.license_id AND s.deleted_at IS NULL
            WHERE l.id = $1 AND l.deleted_at IS NULL
        `;

        return await this.pool.queryOne(query, [licenseId]);
    }

    /**
     * Consolida todas as permissões de diferentes fontes
     */
    async consolidateEntitlements(licenseData) {
        const { license_id, user_id, plan_id, subscription_id } = licenseData;

        // 1. Features do plano base
        const planFeatures = await this.getPlanFeatures(plan_id);

        // 2. Add-ons da assinatura
        const addonFeatures = subscription_id
            ? await this.getAddonFeatures(subscription_id)
            : {};

        // 3. Overrides administrativos
        const overrides = await this.getOverrides(license_id);

        // 4. Plugin entitlements
        const plugins = await this.getPluginEntitlements(license_id);

        // 5. Trials ativos
        const trials = await this.getActiveTrials(license_id);

        // 6. Consolidar tudo
        const consolidated = this.mergeEntitlements({
            planFeatures,
            addonFeatures,
            overrides,
            plugins,
            trials
        });

        // 7. Calcular quotas e limites
        const quotas = await this.calculateQuotas(license_id, consolidated.features);
        const limits = this.extractLimits(consolidated.features);

        return {
            user_id,
            license_id,
            snapshot_version: await this.getNextVersion(license_id),
            features: consolidated.features,
            plugins: consolidated.plugins,
            quotas,
            limits,
            overrides: overrides,
            computed_at: new Date(),
            expires_at: new Date(Date.now() + this.CACHE_TTL * 1000),
            is_valid: true
        };
    }

    /**
     * Busca features do plano
     */
    async getPlanFeatures(planId) {
        const query = `
            SELECT 
                f.feature_key,
                f.feature_type,
                pf.value,
                pf.is_enabled
            FROM plan_features pf
            JOIN features f ON pf.feature_id = f.id
            WHERE pf.plan_id = $1
            AND pf.deleted_at IS NULL
            AND pf.is_enabled = true
        `;

        const rows = await this.pool.queryMany(query, [planId]);

        const features = {};
        rows.forEach(row => {
            features[row.feature_key] = this.parseFeatureValue(row.value, row.feature_type);
        });

        return features;
    }

    /**
     * Busca features de add-ons
     */
    async getAddonFeatures(subscriptionId) {
        const query = `
            SELECT 
                addon_type,
                addon_key,
                addon_value,
                is_active,
                expires_at
            FROM subscription_addons
            WHERE subscription_id = $1
            AND deleted_at IS NULL
            AND is_active = true
            AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        `;

        const rows = await this.pool.queryMany(query, [subscriptionId]);

        const features = {};
        rows.forEach(row => {
            if (row.addon_type === 'feature') {
                features[row.addon_key] = this.parseFeatureValue(row.addon_value);
            }
        });

        return features;
    }

    /**
     * Busca overrides administrativos
     */
    async getOverrides(licenseId) {
        const query = `
            SELECT 
                override_type,
                override_key,
                override_value,
                expires_at
            FROM entitlement_overrides
            WHERE license_id = $1
            AND deleted_at IS NULL
            AND is_active = true
            AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        `;

        const rows = await this.pool.queryMany(query, [licenseId]);

        const overrides = {};
        rows.forEach(row => {
            overrides[row.override_key] = this.parseFeatureValue(row.override_value);
        });

        return overrides;
    }

    /**
     * Busca plugin entitlements
     */
    async getPluginEntitlements(licenseId) {
        const query = `
            SELECT 
                pr.plugin_key,
                pe.is_enabled,
                pe.granted_by,
                pe.trial_ends_at,
                pe.quota_limit,
                pe.quota_used
            FROM plugin_entitlements pe
            JOIN plugin_registry pr ON pe.plugin_id = pr.id
            WHERE pe.license_id = $1
            AND pe.deleted_at IS NULL
            AND pe.is_enabled = true
        `;

        const rows = await this.pool.queryMany(query, [licenseId]);

        const plugins = {};
        rows.forEach(row => {
            plugins[row.plugin_key] = {
                enabled: row.is_enabled,
                granted_by: row.granted_by,
                trial_ends_at: row.trial_ends_at,
                quota_limit: row.quota_limit,
                quota_used: row.quota_used,
                is_trial: row.trial_ends_at && new Date(row.trial_ends_at) > new Date()
            };
        });

        return plugins;
    }

    /**
     * Busca trials ativos
     */
    async getActiveTrials(licenseId) {
        const query = `
            SELECT 
                pr.plugin_key,
                pe.trial_ends_at
            FROM plugin_entitlements pe
            JOIN plugin_registry pr ON pe.plugin_id = pr.id
            WHERE pe.license_id = $1
            AND pe.deleted_at IS NULL
            AND pe.trial_ends_at IS NOT NULL
            AND pe.trial_ends_at > CURRENT_TIMESTAMP
        `;

        const rows = await this.pool.queryMany(query, [licenseId]);

        const trials = {};
        rows.forEach(row => {
            trials[row.plugin_key] = {
                trial_ends_at: row.trial_ends_at
            };
        });

        return trials;
    }

    /**
     * Merge de todas as fontes de entitlements
     * Ordem de precedência: overrides > trials > addons > plan
     */
    mergeEntitlements({ planFeatures, addonFeatures, overrides, plugins, trials }) {
        // Merge features (overrides tem precedência)
        const features = {
            ...planFeatures,
            ...addonFeatures,
            ...overrides
        };

        // Merge plugins com trials
        const mergedPlugins = { ...plugins };
        Object.keys(trials).forEach(pluginKey => {
            if (mergedPlugins[pluginKey]) {
                mergedPlugins[pluginKey].trial_ends_at = trials[pluginKey].trial_ends_at;
                mergedPlugins[pluginKey].is_trial = true;
            }
        });

        return {
            features,
            plugins: mergedPlugins
        };
    }

    /**
     * Calcula quotas atuais
     */
    async calculateQuotas(licenseId, features) {
        const quotas = {};

        // Buscar usage counters ativos
        const query = `
            SELECT 
                counter_key,
                limit_value,
                current_value,
                period_end,
                is_blocked
            FROM usage_counters
            WHERE license_id = $1
            AND period_end > CURRENT_TIMESTAMP
        `;

        const rows = await this.pool.queryMany(query, [licenseId]);

        rows.forEach(row => {
            quotas[row.counter_key] = {
                limit: row.limit_value,
                used: row.current_value,
                remaining: row.limit_value - row.current_value,
                reset_at: row.period_end,
                is_blocked: row.is_blocked
            };
        });

        return quotas;
    }

    /**
     * Extrai limites das features
     */
    extractLimits(features) {
        const limits = {};

        Object.keys(features).forEach(key => {
            if (key.startsWith('max_')) {
                limits[key] = features[key];
            }
        });

        return limits;
    }

    /**
     * Parse de valor de feature
     */
    parseFeatureValue(value, type = null) {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        }
        return value;
    }

    /**
     * Salva snapshot no banco
     */
    async saveSnapshot(userId, licenseId, entitlement) {
        // Invalidar snapshots anteriores
        await this.pool.query(
            `UPDATE entitlements SET is_valid = false WHERE license_id = $1`,
            [licenseId]
        );

        // Inserir novo snapshot
        const query = `
            INSERT INTO entitlements (
                user_id,
                license_id,
                snapshot_version,
                features,
                plugins,
                quotas,
                limits,
                overrides,
                computed_at,
                expires_at,
                is_valid
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id
        `;

        const values = [
            userId,
            licenseId,
            entitlement.snapshot_version,
            JSON.stringify(entitlement.features),
            JSON.stringify(entitlement.plugins),
            JSON.stringify(entitlement.quotas),
            JSON.stringify(entitlement.limits),
            JSON.stringify(entitlement.overrides),
            entitlement.computed_at,
            entitlement.expires_at,
            entitlement.is_valid
        ];

        await this.pool.queryOne(query, values);
    }

    /**
     * Obtém próxima versão do snapshot
     */
    async getNextVersion(licenseId) {
        const query = `
            SELECT COALESCE(MAX(snapshot_version), 0) + 1 as next_version
            FROM entitlements
            WHERE license_id = $1
        `;

        const result = await this.pool.queryOne(query, [licenseId]);
        return result.next_version;
    }

    /**
     * Invalida cache de entitlement
     */
    async invalidate(licenseId) {
        await this.pool.query(
            `UPDATE entitlements SET is_valid = false WHERE license_id = $1`,
            [licenseId]
        );

        this.logger.info('Entitlement cache invalidated', { licenseId });
    }

    /**
     * Verifica se usuário tem permissão para uma feature
     */
    async hasFeature(licenseId, featureKey) {
        const entitlement = await this.resolve(licenseId);
        return entitlement.features[featureKey] === true ||
            entitlement.features[featureKey] > 0;
    }

    /**
     * Verifica se usuário tem acesso a um plugin
     */
    async hasPlugin(licenseId, pluginKey) {
        const entitlement = await this.resolve(licenseId);
        const plugin = entitlement.plugins[pluginKey];

        if (!plugin) return false;
        if (!plugin.enabled) return false;

        // Verificar se trial expirou
        if (plugin.is_trial && plugin.trial_ends_at) {
            return new Date(plugin.trial_ends_at) > new Date();
        }

        return true;
    }
}

// Singleton
let instance = null;

module.exports = {
    getInstance: () => {
        if (!instance) {
            instance = new EntitlementResolverService();
        }
        return instance;
    },
    EntitlementResolverService
};
