/**
 * Cleanup Job
 * Jobs de limpeza e manutenção do sistema
 * 
 * Responsabilidades:
 * - Limpar snapshots antigos de entitlements
 * - Resetar contadores expirados
 * - Limpar trials expirados
 * - Limpar overrides expirados
 */

const { getInstance: getPool } = require('../database/pool');
const { getInstance: getLogger } = require('../utils/logger');

class CleanupJob {
    constructor() {
        this.pool = getPool();
        this.logger = getLogger();
    }

    /**
     * Executa todos os jobs de limpeza
     */
    async runAll() {
        this.logger.info('Starting cleanup jobs...');

        try {
            const results = await Promise.allSettled([
                this.cleanupOldSnapshots(),
                this.resetExpiredCounters(),
                this.cleanupExpiredTrials(),
                this.cleanupExpiredOverrides()
            ]);

            const summary = {
                snapshots_cleaned: results[0].status === 'fulfilled' ? results[0].value : 0,
                counters_reset: results[1].status === 'fulfilled' ? results[1].value : 0,
                trials_cleaned: results[2].status === 'fulfilled' ? results[2].value : 0,
                overrides_cleaned: results[3].status === 'fulfilled' ? results[3].value : 0,
                errors: results.filter(r => r.status === 'rejected').map(r => r.reason.message)
            };

            this.logger.info('Cleanup jobs completed', summary);

            return summary;

        } catch (error) {
            this.logger.error('Error running cleanup jobs', { error: error.message });
            throw error;
        }
    }

    /**
     * Limpa snapshots antigos de entitlements (mantém últimos 30 dias)
     */
    async cleanupOldSnapshots() {
        try {
            const query = `
                DELETE FROM entitlements
                WHERE is_valid = false
                AND computed_at < CURRENT_TIMESTAMP - INTERVAL '30 days'
                RETURNING id
            `;

            const deleted = await this.pool.queryMany(query);

            this.logger.info('Old snapshots cleaned', { count: deleted.length });

            return deleted.length;

        } catch (error) {
            this.logger.error('Error cleaning old snapshots', { error: error.message });
            throw error;
        }
    }

    /**
     * Reseta contadores expirados
     */
    async resetExpiredCounters() {
        try {
            const query = `
                UPDATE usage_counters
                SET 
                    current_value = 0,
                    is_blocked = false,
                    blocked_at = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE period_end < CURRENT_TIMESTAMP
                AND current_value > 0
                RETURNING id
            `;

            const reset = await this.pool.queryMany(query);

            this.logger.info('Expired counters reset', { count: reset.length });

            return reset.length;

        } catch (error) {
            this.logger.error('Error resetting expired counters', { error: error.message });
            throw error;
        }
    }

    /**
     * Limpa trials expirados de plugins
     */
    async cleanupExpiredTrials() {
        try {
            const query = `
                UPDATE plugin_entitlements
                SET 
                    is_enabled = false,
                    updated_at = CURRENT_TIMESTAMP
                WHERE trial_ends_at < CURRENT_TIMESTAMP
                AND is_enabled = true
                AND granted_by = 'trial'
                AND deleted_at IS NULL
                RETURNING id
            `;

            const disabled = await this.pool.queryMany(query);

            this.logger.info('Expired trials cleaned', { count: disabled.length });

            return disabled.length;

        } catch (error) {
            this.logger.error('Error cleaning expired trials', { error: error.message });
            throw error;
        }
    }

    /**
     * Limpa overrides expirados
     */
    async cleanupExpiredOverrides() {
        try {
            const query = `
                UPDATE entitlement_overrides
                SET 
                    is_active = false,
                    updated_at = CURRENT_TIMESTAMP
                WHERE expires_at < CURRENT_TIMESTAMP
                AND is_active = true
                AND deleted_at IS NULL
                RETURNING id
            `;

            const disabled = await this.pool.queryMany(query);

            this.logger.info('Expired overrides cleaned', { count: disabled.length });

            return disabled.length;

        } catch (error) {
            this.logger.error('Error cleaning expired overrides', { error: error.message });
            throw error;
        }
    }

    /**
     * Limpa logs de uso antigos (mantém últimos 90 dias)
     */
    async cleanupOldUsageLogs() {
        try {
            const query = `
                DELETE FROM usage_logs
                WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days'
                RETURNING id
            `;

            const deleted = await this.pool.queryMany(query);

            this.logger.info('Old usage logs cleaned', { count: deleted.length });

            return deleted.length;

        } catch (error) {
            this.logger.error('Error cleaning old usage logs', { error: error.message });
            throw error;
        }
    }

    /**
     * Limpa audit logs antigos (mantém últimos 180 dias)
     */
    async cleanupOldAuditLogs() {
        try {
            const query = `
                DELETE FROM audit_logs
                WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '180 days'
                RETURNING id
            `;

            const deleted = await this.pool.queryMany(query);

            this.logger.info('Old audit logs cleaned', { count: deleted.length });

            return deleted.length;

        } catch (error) {
            this.logger.error('Error cleaning old audit logs', { error: error.message });
            throw error;
        }
    }

    /**
     * Estatísticas de uso do banco
     */
    async getDatabaseStats() {
        try {
            const query = `
                SELECT 
                    schemaname,
                    tablename,
                    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
                    n_live_tup as row_count
                FROM pg_stat_user_tables
                WHERE schemaname = 'public'
                ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
                LIMIT 20
            `;

            const stats = await this.pool.queryMany(query);

            return stats;

        } catch (error) {
            this.logger.error('Error getting database stats', { error: error.message });
            throw error;
        }
    }
}

// Singleton
let instance = null;

module.exports = {
    getInstance: () => {
        if (!instance) {
            instance = new CleanupJob();
        }
        return instance;
    },
    CleanupJob
};

