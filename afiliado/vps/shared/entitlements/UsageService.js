/**
 * Usage Service
 * Gerencia contadores de uso e quotas
 * 
 * Responsabilidades:
 * - Incrementar contadores de uso
 * - Verificar limites
 * - Bloquear automaticamente quando ultrapassar
 * - Resetar contadores por período
 * - Gerenciar quotas por feature/plugin/recurso
 */

const { getInstance: getPool } = require('../database/pool');
const { getInstance: getLogger } = require('../utils/logger');

class UsageService {
    constructor() {
        this.pool = getPool();
        this.logger = getLogger();
    }

    /**
     * Incrementa contador de uso
     * @param {string} licenseId - UUID da licença
     * @param {string} counterKey - Chave do contador (ex: 'monthly_executions')
     * @param {number} amount - Quantidade a incrementar (default: 1)
     * @param {string} counterType - Tipo do contador (feature, plugin, resource, api_call)
     * @param {string} periodType - Tipo de período (daily, monthly, yearly, lifetime)
     * @returns {Promise<Object>} Resultado da operação
     */
    async increment(licenseId, counterKey, amount = 1, counterType = 'feature', periodType = 'monthly') {
        try {
            // 1. Buscar ou criar contador
            const counter = await this.getOrCreateCounter(licenseId, counterKey, counterType, periodType);

            // 2. Verificar se está bloqueado
            if (counter.is_blocked) {
                return {
                    success: false,
                    blocked: true,
                    message: 'Usage limit exceeded',
                    counter
                };
            }

            // 3. Verificar se período expirou (resetar se necessário)
            if (new Date(counter.period_end) < new Date()) {
                await this.resetCounter(counter.id);
                return this.increment(licenseId, counterKey, amount, counterType, periodType);
            }

            // 4. Incrementar valor ATOMICAMENTE com verificação de limite
            // Usa UPDATE condicional para evitar race condition
            const query = `
                UPDATE usage_counters
                SET 
                    current_value = current_value + $1,
                    is_blocked = CASE 
                        WHEN limit_value IS NOT NULL AND (current_value + $1) >= limit_value THEN true
                        ELSE is_blocked
                    END,
                    blocked_at = CASE 
                        WHEN limit_value IS NOT NULL AND (current_value + $1) >= limit_value THEN CURRENT_TIMESTAMP
                        ELSE blocked_at
                    END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                AND (limit_value IS NULL OR current_value + $1 <= limit_value OR is_blocked = false)
                RETURNING *
            `;

            const updated = await this.pool.queryOne(query, [amount, counter.id]);

            // Se não retornou nada, significa que o limite seria ultrapassado
            if (!updated) {
                // Buscar estado atual para retornar
                const currentState = await this.pool.queryOne(
                    'SELECT * FROM usage_counters WHERE id = $1',
                    [counter.id]
                );

                return {
                    success: false,
                    blocked: true,
                    message: 'Usage limit would be exceeded',
                    counter: currentState,
                    remaining: currentState.limit_value ? currentState.limit_value - currentState.current_value : null
                };
            }

            const shouldBlock = updated.is_blocked;
            const newValue = updated.current_value;

            this.logger.info('Usage incremented', {
                licenseId,
                counterKey,
                amount,
                newValue,
                limit: counter.limit_value,
                blocked: shouldBlock
            });

            return {
                success: true,
                blocked: shouldBlock,
                counter: updated,
                remaining: counter.limit_value ? counter.limit_value - newValue : null
            };

        } catch (error) {
            this.logger.error('Error incrementing usage', {
                error: error.message,
                licenseId,
                counterKey
            });
            throw error;
        }
    }

    /**
     * Busca ou cria contador
     */
    async getOrCreateCounter(licenseId, counterKey, counterType, periodType) {
        // Calcular período atual
        const { periodStart, periodEnd } = this.calculatePeriod(periodType);

        // Buscar contador existente
        let query = `
            SELECT *
            FROM usage_counters
            WHERE license_id = $1
            AND counter_key = $2
            AND counter_type = $3
            AND period_start = $4
        `;

        let counter = await this.pool.queryOne(query, [licenseId, counterKey, counterType, periodStart]);

        // Se não existe, criar
        if (!counter) {
            counter = await this.createCounter(licenseId, counterKey, counterType, periodType, periodStart, periodEnd);
        }

        return counter;
    }

    /**
     * Cria novo contador
     */
    async createCounter(licenseId, counterKey, counterType, periodType, periodStart, periodEnd) {
        // Buscar user_id da licença
        const licenseQuery = `SELECT user_id FROM licenses WHERE id = $1`;
        const license = await this.pool.queryOne(licenseQuery, [licenseId]);

        if (!license) {
            throw new Error('License not found');
        }

        // Buscar limite da feature (se aplicável)
        let limitValue = null;
        if (counterType === 'feature') {
            const limitQuery = `
                SELECT pf.value
                FROM licenses l
                JOIN plan_features pf ON l.plan_id = pf.plan_id
                JOIN features f ON pf.feature_id = f.id
                WHERE l.id = $1
                AND f.feature_key = $2
                AND pf.deleted_at IS NULL
            `;
            const limitResult = await this.pool.queryOne(limitQuery, [licenseId, counterKey]);
            if (limitResult && limitResult.value) {
                limitValue = parseInt(limitResult.value);
            }
        }

        // Criar contador
        const query = `
            INSERT INTO usage_counters (
                user_id,
                license_id,
                counter_type,
                counter_key,
                period_type,
                period_start,
                period_end,
                limit_value,
                current_value,
                is_blocked
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, false)
            RETURNING *
        `;

        const values = [
            license.user_id,
            licenseId,
            counterType,
            counterKey,
            periodType,
            periodStart,
            periodEnd,
            limitValue
        ];

        return await this.pool.queryOne(query, values);
    }

    /**
     * Calcula período baseado no tipo
     */
    calculatePeriod(periodType) {
        const now = new Date();
        let periodStart, periodEnd;

        switch (periodType) {
            case 'daily':
                periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                periodEnd = new Date(periodStart);
                periodEnd.setDate(periodEnd.getDate() + 1);
                break;

            case 'monthly':
                periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
                periodEnd = new Date(periodStart);
                periodEnd.setMonth(periodEnd.getMonth() + 1);
                break;

            case 'yearly':
                periodStart = new Date(now.getFullYear(), 0, 1);
                periodEnd = new Date(periodStart);
                periodEnd.setFullYear(periodEnd.getFullYear() + 1);
                break;

            case 'lifetime':
                periodStart = new Date(0); // Epoch
                periodEnd = new Date('2099-12-31');
                break;

            default:
                throw new Error(`Invalid period type: ${periodType}`);
        }

        return { periodStart, periodEnd };
    }

    /**
     * Reseta contador
     */
    async resetCounter(counterId) {
        const query = `
            UPDATE usage_counters
            SET 
                current_value = 0,
                is_blocked = false,
                blocked_at = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `;

        await this.pool.query(query, [counterId]);
        this.logger.info('Counter reset', { counterId });
    }

    /**
     * Verifica se pode usar (sem incrementar)
     */
    async canUse(licenseId, counterKey, amount = 1, counterType = 'feature', periodType = 'monthly') {
        const counter = await this.getOrCreateCounter(licenseId, counterKey, counterType, periodType);

        // Verificar se está bloqueado
        if (counter.is_blocked) {
            return {
                allowed: false,
                reason: 'blocked',
                counter
            };
        }

        // Verificar se período expirou
        if (new Date(counter.period_end) < new Date()) {
            return {
                allowed: true,
                reason: 'period_expired',
                counter
            };
        }

        // Verificar se ultrapassaria limite
        if (counter.limit_value) {
            const wouldExceed = (counter.current_value + amount) > counter.limit_value;
            return {
                allowed: !wouldExceed,
                reason: wouldExceed ? 'limit_exceeded' : 'ok',
                counter,
                remaining: counter.limit_value - counter.current_value
            };
        }

        return {
            allowed: true,
            reason: 'no_limit',
            counter
        };
    }

    /**
     * Busca status de uso
     */
    async getUsageStatus(licenseId, counterKey = null) {
        let query = `
            SELECT *
            FROM usage_counters
            WHERE license_id = $1
            AND period_end > CURRENT_TIMESTAMP
        `;

        const params = [licenseId];

        if (counterKey) {
            query += ` AND counter_key = $2`;
            params.push(counterKey);
        }

        query += ` ORDER BY counter_key, period_start DESC`;

        const counters = await this.pool.queryMany(query, params);

        return counters.map(counter => ({
            counter_key: counter.counter_key,
            counter_type: counter.counter_type,
            period_type: counter.period_type,
            limit: counter.limit_value,
            used: counter.current_value,
            remaining: counter.limit_value ? counter.limit_value - counter.current_value : null,
            percentage: counter.limit_value ? Math.round((counter.current_value / counter.limit_value) * 100) : null,
            is_blocked: counter.is_blocked,
            period_end: counter.period_end
        }));
    }

    /**
     * Desbloqueia contador manualmente (admin)
     */
    async unblock(counterId, adminId) {
        const query = `
            UPDATE usage_counters
            SET 
                is_blocked = false,
                blocked_at = NULL,
                metadata = jsonb_set(
                    COALESCE(metadata, '{}'::jsonb),
                    '{unblocked_by}',
                    to_jsonb($2::text)
                ),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;

        const result = await this.pool.queryOne(query, [counterId, adminId]);

        this.logger.info('Counter unblocked', { counterId, adminId });

        return result;
    }

    /**
     * Ajusta limite de contador (admin)
     */
    async adjustLimit(counterId, newLimit, adminId) {
        const query = `
            UPDATE usage_counters
            SET 
                limit_value = $2,
                metadata = jsonb_set(
                    COALESCE(metadata, '{}'::jsonb),
                    '{limit_adjusted_by}',
                    to_jsonb($3::text)
                ),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;

        const result = await this.pool.queryOne(query, [counterId, newLimit, adminId]);

        this.logger.info('Counter limit adjusted', { counterId, newLimit, adminId });

        return result;
    }

    /**
     * Reseta todos os contadores expirados (job diário)
     */
    async resetExpiredCounters() {
        const query = `
            UPDATE usage_counters
            SET 
                current_value = 0,
                is_blocked = false,
                blocked_at = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE period_end < CURRENT_TIMESTAMP
            AND current_value > 0
            RETURNING id, counter_key, license_id
        `;

        const reset = await this.pool.queryMany(query);

        this.logger.info('Expired counters reset', { count: reset.length });

        return reset;
    }
}

// Singleton
let instance = null;

module.exports = {
    getInstance: () => {
        if (!instance) {
            instance = new UsageService();
        }
        return instance;
    },
    UsageService
};
