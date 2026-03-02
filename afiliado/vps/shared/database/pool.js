/**
 * PostgreSQL Connection Pool
 * Manages database connections with retry logic and health checks
 */

const { Pool } = require('pg');

class DatabasePool {
    constructor() {
        this.pool = null;
        this.isConnected = false;
        this.retryAttempts = 5;
        this.retryDelay = 5000; // 5 seconds
        this.initialize();
    }

    /**
     * Initialize database pool
     */
    initialize() {
        const config = {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || 'afiliados_vps_licenses',
            user: process.env.DB_USER || 'afiliados_vps_user',
            password: process.env.DB_PASSWORD,
            max: parseInt(process.env.DB_POOL_MAX || '20'),
            min: parseInt(process.env.DB_POOL_MIN || '5'),
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
            // Performance tuning
            statement_timeout: 30000,
            query_timeout: 30000,
            // SSL configuration
            ssl: process.env.DB_SSL === 'true' ? {
                rejectUnauthorized: false
            } : false
        };

        this.pool = new Pool(config);

        // Event handlers
        this.pool.on('connect', () => {
            this.isConnected = true;
            console.log('✅ Database connected');
        });

        this.pool.on('error', (err) => {
            console.error('❌ Unexpected database error:', err);
            this.isConnected = false;
        });

        this.pool.on('remove', () => {
            console.log('🔄 Database client removed from pool');
        });

        // Test connection
        this.testConnection();
    }

    /**
     * Test database connection with retry
     */
    async testConnection(attempt = 1) {
        try {
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            this.isConnected = true;
            console.log('✅ Database connection test successful');
            return true;
        } catch (error) {
            console.error(`❌ Database connection test failed (attempt ${attempt}/${this.retryAttempts}):`, error.message);

            if (attempt < this.retryAttempts) {
                console.log(`🔄 Retrying in ${this.retryDelay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.testConnection(attempt + 1);
            }

            this.isConnected = false;
            throw new Error('Failed to connect to database after multiple attempts');
        }
    }

    /**
     * Execute query
     * @param {String} text - SQL query
     * @param {Array} params - Query parameters
     * @returns {Object} - Query result
     */
    async query(text, params = []) {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;

            if (duration > 1000) {
                console.warn(`⚠️  Slow query (${duration}ms):`, text.substring(0, 100));
            }

            return result;
        } catch (error) {
            console.error('❌ Query error:', error.message);
            console.error('Query:', text);
            console.error('Params:', params);
            throw error;
        }
    }

    /**
     * Execute query and return first row
     * @param {String} text - SQL query
     * @param {Array} params - Query parameters
     * @returns {Object|null} - First row or null
     */
    async queryOne(text, params = []) {
        const result = await this.query(text, params);
        return result.rows[0] || null;
    }

    /**
     * Execute query and return all rows
     * @param {String} text - SQL query
     * @param {Array} params - Query parameters
     * @returns {Array} - All rows
     */
    async queryMany(text, params = []) {
        const result = await this.query(text, params);
        return result.rows;
    }

    /**
     * Execute transaction
     * @param {Function} callback - Transaction callback
     * @returns {*} - Callback result
     */
    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Get pool statistics
     * @returns {Object} - Pool stats
     */
    getStats() {
        return {
            total: this.pool.totalCount,
            idle: this.pool.idleCount,
            waiting: this.pool.waitingCount,
            isConnected: this.isConnected
        };
    }

    /**
     * Health check
     * @returns {Boolean} - True if healthy
     */
    async healthCheck() {
        try {
            await this.query('SELECT 1');
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Close all connections
     */
    async close() {
        try {
            await this.pool.end();
            this.isConnected = false;
            console.log('✅ Database pool closed');
        } catch (error) {
            console.error('❌ Error closing database pool:', error.message);
            throw error;
        }
    }
}

// Singleton instance
let instance = null;

module.exports = {
    getInstance: () => {
        if (!instance) {
            instance = new DatabasePool();
        }
        return instance;
    },
    DatabasePool
};
