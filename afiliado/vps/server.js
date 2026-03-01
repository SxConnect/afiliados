const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later' }
});

app.use('/api/', limiter);

// Environment variables validation
const requiredEnvVars = ['JWT_SECRET', 'LICENSE_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

// In-memory storage (replace with database in production)
const licenses = new Map();
const quotas = new Map();

// Helper functions
function generateFingerprint(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

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
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime()
    });
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
        const licenseKey = `license:${whatsapp}`;
        let license = licenses.get(licenseKey);

        if (!license) {
            // Create free tier license
            license = {
                whatsapp,
                plan: 'free',
                fingerprint,
                plugins: [],
                quota: 10,
                quotaUsed: 0,
                createdAt: new Date().toISOString(),
                expiresAt: null
            };
            licenses.set(licenseKey, license);
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

        const licenseKey = `license:${whatsapp}`;
        const license = licenses.get(licenseKey);

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

        const licenseKey = `license:${whatsapp}`;
        const license = licenses.get(licenseKey);

        if (!license) {
            return res.status(404).json({ error: 'License not found' });
        }

        const available = license.quota - license.quotaUsed;
        if (available < amount) {
            return res.status(403).json({
                error: 'Insufficient quota',
                available,
                requested: amount
            });
        }

        // Consume quota
        license.quotaUsed += amount;
        licenses.set(licenseKey, license);

        const responseData = {
            success: true,
            quotaUsed: license.quotaUsed,
            quotaRemaining: license.quota - license.quotaUsed
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

        const licenseKey = `license:${whatsapp}`;
        const license = licenses.get(licenseKey);

        if (!license) {
            return res.status(404).json({ error: 'License not found' });
        }

        const hasPlugin = license.plugins.includes(pluginId);
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

function gracefulShutdown(signal) {
    console.log(`\n${signal} received, shutting down gracefully...`);

    if (server) {
        server.close(() => {
            console.log('✅ HTTP server closed');
            process.exit(0);
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
            console.error('⚠️ Forced shutdown after timeout');
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
    console.log(`✅ License API Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Security: JWT + HMAC signatures enabled`);
});

module.exports = app;
