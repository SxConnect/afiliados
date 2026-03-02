/**
 * License Service
 * Gerencia licenças com cache e banco de dados
 */

const database = require('../config/database');
const cache = require('../config/cache');

class LicenseService {
    constructor() {
        this.cacheTTL = 300; // 5 minutos
    }

    /**
     * Buscar licença (com cache)
     */
    async getLicense(whatsapp) {
        // 1. Tentar buscar do cache
        const cacheKey = cache.generateKey('license', whatsapp);
        const cached = await cache.get(cacheKey);

        if (cached) {
            console.log('✅ Cache HIT:', cacheKey);
            return cached;
        }

        console.log('❌ Cache MISS:', cacheKey);

        // 2. Buscar do banco de dados
        const query = `
            SELECT 
                whatsapp,
                plan,
                fingerprint,
                plugins,
                quota,
                quota_used,
                created_at,
                expires_at
            FROM licenses
            WHERE whatsapp = $1
        `;

        try {
            const result = await database.query(query, [whatsapp]);

            if (result.rows.length === 0) {
                return null;
            }

            const license = {
                whatsapp: result.rows[0].whatsapp,
                plan: result.rows[0].plan,
                fingerprint: result.rows[0].fingerprint,
                plugins: result.rows[0].plugins || [],
                quota: result.rows[0].quota,
                quotaUsed: result.rows[0].quota_used,
                createdAt: result.rows[0].created_at,
                expiresAt: result.rows[0].expires_at,
            };

            // 3. Salvar no cache
            await cache.set(cacheKey, license, this.cacheTTL);

            return license;
        } catch (error) {
            console.error('Error fetching license:', error);
            throw error;
        }
    }

    /**
     * Criar nova licença
     */
    async createLicense(whatsapp, fingerprint, plan = 'free') {
        const query = `
            INSERT INTO licenses (
                whatsapp,
                plan,
                fingerprint,
                plugins,
                quota,
                quota_used,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING *
        `;

        const quota = plan === 'free' ? 10 : 100;

        try {
            const result = await database.query(query, [
                whatsapp,
                plan,
                fingerprint,
                JSON.stringify([]),
                quota,
                0,
            ]);

            const license = {
                whatsapp: result.rows[0].whatsapp,
                plan: result.rows[0].plan,
                fingerprint: result.rows[0].fingerprint,
                plugins: result.rows[0].plugins || [],
                quota: result.rows[0].quota,
                quotaUsed: result.rows[0].quota_used,
                createdAt: result.rows[0].created_at,
                expiresAt: result.rows[0].expires_at,
            };

            // Salvar no cache
            const cacheKey = cache.generateKey('license', whatsapp);
            await cache.set(cacheKey, license, this.cacheTTL);

            return license;
        } catch (error) {
            console.error('Error creating license:', error);
            throw error;
        }
    }

    /**
     * Consumir quota
     */
    async consumeQuota(whatsapp, amount = 1) {
        const query = `
            UPDATE licenses
            SET quota_used = quota_used + $1
            WHERE whatsapp = $2
            AND (quota - quota_used) >= $1
            RETURNING quota, quota_used
        `;

        try {
            const result = await database.query(query, [amount, whatsapp]);

            if (result.rows.length === 0) {
                return { success: false, error: 'Insufficient quota' };
            }

            // Invalidar cache
            const cacheKey = cache.generateKey('license', whatsapp);
            await cache.del(cacheKey);

            return {
                success: true,
                quotaUsed: result.rows[0].quota_used,
                quotaRemaining: result.rows[0].quota - result.rows[0].quota_used,
            };
        } catch (error) {
            console.error('Error consuming quota:', error);
            throw error;
        }
    }

    /**
     * Verificar plugin
     */
    async hasPlugin(whatsapp, pluginId) {
        const license = await this.getLicense(whatsapp);

        if (!license) {
            return false;
        }

        return license.plugins.includes(pluginId);
    }

    /**
     * Invalidar cache de licença
     */
    async invalidateCache(whatsapp) {
        const cacheKey = cache.generateKey('license', whatsapp);
        await cache.del(cacheKey);
    }
}

module.exports = new LicenseService();
