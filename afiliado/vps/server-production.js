/**
 * Production Server com Cluster Mode
 * Arquitetura otimizada para 10K usuários
 */

const cluster = require('cluster');
const os = require('os');
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Importar serviços
const database = require('./src/config/database');
const cache = require('./src/config/cache');
const licenseService = require('./src/services/licenseService');

// Configuração
const PORT = process.env.PORT || 3000;
const WORKERS = parseInt(process.env.WORKERS) || 2; // 2 workers para 10K usuários
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Cluster Mode
if (cluster.isMaster && IS_PRODUCTION) {
    console.log('🚀 PRODUCTION MODE - CLUSTER ENABLED');
    console.log(`📊 Master process ${process.pid} is running`);
    console.log(`👷 Starting ${WORKERS} workers...`);

    // Fork workers
    for (let i = 0; i < WORKERS; i++) {
        cluster.fork();
    }

    // Worker died - restart
    cluster.on('exit', (worker, code, signal) => {
        console.log(`⚠️  Worker ${worker.process.pid} died (${signal || code})`);
        console.log('🔄 Starting new worker...');
        cluster.fork();
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('\n🛑 SIGTERM received, shutting down gracefully...');

        for (const id in cluster.workers) {
            cluster.workers[id].kill('SIGTERM');
        }

        setTimeout(() => {
            console.log('⚠️  Forcing shutdown...');
            process.exit(0);
        }, 10000);
    });

} else {
    // Worker process
    startWorker();
}

async function startWorker() {
    const app = express();

    // Middleware
    app.use(express.json());
    app.set('trust proxy', 1);

    // Rate limiting - AJUSTADO PARA PRODUÇÃO
    const limiter = rateLimit({
        windowMs: 60 * 1000, // 1 minuto
        max: 1000, // 1000 req/min por IP = ~16.67 req/s
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many requests, please try again later' },
        skip: (req) => {
            // Skip rate limit para health check
            return req.path === '/health';
        },
    });

    app.use('/api/', limiter);

    // Environment variables validation
    const requiredEnvVars = ['JWT_SECRET', 'LICENSE_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingEnvVars.length > 0) {
        console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
        process.exit(1);
    }

    // Initialize services
    try {
        await database.connect();
        await cache.connect();
    } catch (error) {
        console.error('❌ Failed to initialize services:', error);
        if (IS_PRODUCTION) {
            process.exit(1);
        }
    }

    // Helper functions
    function signData(data) {
        const hmac = crypto.createHmac('sha256', process.env.LICENSE_SECRET);
        hmac.update(JSON.stringify(data));
        return hmac.digest('hex');
    }

    function verifySignature(data, signature) {
        const expectedSignature = signData(data);
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    }

    // Health check endpoint
    app.get('/health', async (req, res) => {
        const dbHealth = await database.healthCheck();
        const cacheHealth = await cache.healthCheck();

        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            uptime: process.uptime(),
            worker: cluster.worker ? cluster.worker.id : 'single',
            database: dbHealth,
            cache: cacheHealth,
        };

        const statusCode = dbHealth.connected ? 200 : 503;
        res.status(statusCode).json(health);
    });

    // Validate license
    app.post('/api/validate-license', async (req, res) => {
        try {
            const { whatsapp, fingerprint, signature } = req.body;

            if (!whatsapp || !fingerprint) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Verify request signature
            const dataToVerify = { whatsapp, fingerprint };
            if (signature && !verifySignature(dataToVerify, signature)) {
                return res.status(401).json({ error: 'Invalid signature' });
            }

            // Check if license exists
            let license = await licenseService.getLicense(whatsapp);

            if (!license) {
                // Create free tier license
                license = await licenseService.createLicense(whatsapp, fingerprint, 'free');
            }

            // Validate fingerprint
            if (license.fingerprint !== fingerprint) {
                return res.status(403).json({
                    error: 'License already activated on another device',
                    plan: 'free'
                });
            }

            // Generate session token
            const token = jwt.sign(
                {
                    whatsapp,
                    plan: license.plan,
                    fingerprint,
                    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
                },
                process.env.JWT_SECRET
            );

            // Sign response
            const responseData = {
                plan: license.plan,
                quota: license.quota,
                quotaUsed: license.quotaUsed,
                plugins: license.plugins,
                token
            };
            const responseSignature = signData(responseData);

            res.json({
                ...responseData,
                signature: responseSignature
            });

        } catch (error) {
            console.error('Validation error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Check quota
    app.post('/api/check-quota', async (req, res) => {
        try {
            const { whatsapp, token } = req.body;

            if (!whatsapp || !token) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Verify token
            try {
                jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }

            const license = await licenseService.getLicense(whatsapp);

            if (!license) {
                return res.status(404).json({ error: 'License not found' });
            }

            const available = license.quota - license.quotaUsed;
            const responseData = {
                quota: license.quota,
                used: license.quotaUsed,
                available,
                canGenerate: available > 0
            };

            const signature = signData(responseData);

            res.json({
                ...responseData,
                signature
            });

        } catch (error) {
            console.error('Quota check error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Consume quota
    app.post('/api/consume-quota', async (req, res) => {
        try {
            const { whatsapp, token, amount = 1 } = req.body;

            if (!whatsapp || !token) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Verify token
            try {
                jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }

            const result = await licenseService.consumeQuota(whatsapp, amount);

            if (!result.success) {
                return res.status(403).json({
                    error: result.error,
                });
            }

            const responseData = {
                success: true,
                quotaUsed: result.quotaUsed,
                quotaRemaining: result.quotaRemaining
            };

            const signature = signData(responseData);

            res.json({
                ...responseData,
                signature
            });

        } catch (error) {
            console.error('Quota consumption error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Validate plugin
    app.post('/api/validate-plugin', async (req, res) => {
        try {
            const { whatsapp, token, pluginId } = req.body;

            if (!whatsapp || !token || !pluginId) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Verify token
            try {
                jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }

            const hasPlugin = await licenseService.hasPlugin(whatsapp, pluginId);

            const responseData = {
                pluginId,
                authorized: hasPlugin
            };

            const signature = signData(responseData);

            res.json({
                ...responseData,
                signature
            });

        } catch (error) {
            console.error('Plugin validation error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // 404 handler
    app.use((req, res) => {
        res.status(404).json({ error: 'Endpoint not found' });
    });

    // Error handler
    app.use((err, req, res, next) => {
        console.error('Unhandled error:', err);
        res.status(500).json({ error: 'Internal server error' });
    });

    // Graceful shutdown
    let server;

    async function gracefulShutdown(signal) {
        console.log(`\n${signal} received, shutting down gracefully...`);

        if (server) {
            server.close(async () => {
                console.log('✅ HTTP server closed');

                // Disconnect services
                await database.disconnect();
                await cache.disconnect();

                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('⚠️  Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        } else {
            process.exit(0);
        }
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Start server
    server = app.listen(PORT, '0.0.0.0', () => {
        const workerId = cluster.worker ? cluster.worker.id : 'single';
        console.log(`✅ Worker ${workerId} (PID: ${process.pid}) listening on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔒 Security: JWT + HMAC signatures enabled`);
        console.log(`⚡ Rate Limit: 1000 req/min per IP`);
    });
}

module.exports = { startWorker };
