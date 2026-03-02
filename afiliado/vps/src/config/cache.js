/**
 * Redis Cache Configuration
 * Cache de snapshots de entitlements com TTL configurável
 */

const redis = require('redis');

class CacheService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.ttl = parseInt(process.env.CACHE_TTL) || 300; // 5 minutos default
    }

    async connect() {
        if (this.client && this.isConnected) {
            return this.client;
        }

        try {
            this.client = redis.createClient({
                socket: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT) || 6379,
                },
                password: process.env.REDIS_PASSWORD || undefined,
            });

            this.client.on('error', (err) => {
                console.error('❌ Redis Client Error:', err.message);
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                console.log('✅ Redis connected');
                this.isConnected = true;
            });

            this.client.on('disconnect', () => {
                console.log('⚠️  Redis disconnected');
                this.isConnected = false;
            });

            this.client.on('reconnecting', () => {
                console.log('🔄 Redis reconnecting...');
            });

            await this.client.connect();
            console.log(`📊 Cache TTL: ${this.ttl}s`);

            return this.client;
        } catch (error) {
            console.error('❌ Failed to connect to Redis:', error.message);
            console.log('⚠️  Operating without cache');
            this.isConnected = false;
            return null;
        }
    }

    async get(key) {
        if (!this.isConnected) return null;

        try {
            const data = await this.client.get(key);
            if (data) {
                return JSON.parse(data);
            }
            return null;
        } catch (error) {
            console.error('Cache get error:', error.message);
            return null;
        }
    }

    async set(key, value, ttl = null) {
        if (!this.isConnected) return false;

        try {
            const serialized = JSON.stringify(value);
            const expiry = ttl || this.ttl;
            await this.client.setEx(key, expiry, serialized);
            return true;
        } catch (error) {
            console.error('Cache set error:', error.message);
            return false;
        }
    }

    async del(key) {
        if (!this.isConnected) return false;

        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            console.error('Cache delete error:', error.message);
            return false;
        }
    }

    async invalidatePattern(pattern) {
        if (!this.isConnected) return false;

        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
            }
            return true;
        } catch (error) {
            console.error('Cache invalidate error:', error.message);
            return false;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.quit();
            this.isConnected = false;
            console.log('✅ Redis disconnected');
        }
    }

    // Helper: Generate cache key
    generateKey(prefix, ...parts) {
        return `${prefix}:${parts.join(':')}`;
    }

    // Helper: Check if cache is available
    isAvailable() {
        return this.isConnected;
    }

    // Health check
    async healthCheck() {
        if (!this.isConnected) {
            return {
                connected: false,
                error: 'Not connected',
            };
        }

        try {
            await this.client.ping();
            const info = await this.client.info('stats');
            return {
                connected: true,
                ttl: this.ttl,
                info: info.split('\n').slice(0, 5).join('\n'),
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
const cacheService = new CacheService();

module.exports = cacheService;
