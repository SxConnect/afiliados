/**
 * PostgreSQL Database Configuration
 * Pool de conexões otimizado para 10K usuários
 */

const { Pool } = require('pg');

class Database {
    constructor() {
        this.pool = null;
    }

    async connect() {
        if (this.pool) {
            return this.pool;
        }

        const config = {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME || 'afiliados_vps_licenses',
            user: process.env.DB_USER || 'afiliados_vps_user',
            password: process.env.DB_PASSWORD,

            // Pool Configuration para 2 instâncias
            max: parseInt(process.env.DB_POOL_MAX) || 20, // 20 conexões por instância
            min: parseInt(process.env.DB_POOL_MIN) || 5,
            idleTimeoutMillis: 30000, // 30 segundos
            connectionTimeoutMillis: 5000, // 5 segundos

            // Statement timeout (200ms)
            statement_timeout: 200,

            // Query timeout
            query_timeout: 5000,
        };

        this.pool = new Pool(config);

        // Event handlers
        this.pool.on('connect', (client) => {
            console.log('✅ New database client connected');
        });

        this.pool.on('error', (err, client) => {
            console.error('❌ Unexpected database error:', err);
        });

        this.pool.on('remove', (client) => {
            console.log('🔌 Database client removed from pool');
        });

        // Test connection
        try {
            const client = await this.pool.connect();
            console.log('✅ PostgreSQL connected successfully');
            console.log(`📊 Pool: max=${config.max}, min=${config.min}`);
            client.release();
        } catch (error) {
            console.error('❌ Failed to connect to PostgreSQL:', error.message);
            throw error;
        }

        return this.pool;
    }

    async query(text, params) {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;

            // Log slow queries (> 200ms)
            if (duration > 200) {
                console.warn(`⚠️ Slow query (${duration}ms):`, text.substring(0, 100));
            }

            return result;
        } catch (error) {
            console.error('❌ Query error:', error.message);
            throw error;
        }
    }

    async getClient() {
        return await this.pool.connect();
    }

    async disconnect() {
        if (this.pool) {
            await this.pool.end();
            console.log('✅ PostgreSQL pool closed');
            this.pool = null;
        }
    }

    // Health check
    async healthCheck() {
        try {
            const result = await this.query('SELECT NOW()');
            const poolStats = {
                total: this.pool.totalCount,
                idle: this.pool.idleCount,
                waiting: this.pool.waitingCount,
            };
            return {
                connected: true,
                timestamp: result.rows[0].now,
                pool: poolStats,
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message,
            };
        }
    }
}

// Singleton instance
const database = new Database();

module.exports = database;
