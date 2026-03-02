/**
 * API Public Server
 * Main entry point for public API
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Middlewares
const requestLogger = require('./middlewares/requestLogger');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const { apiLimiter } = require('./middlewares/rateLimitMiddleware');

// Routes
const authRoutes = require('./routes/auth');
const licenseRoutes = require('./routes/license');
const usageRoutes = require('./routes/usage');
const pluginRoutes = require('./routes/plugin');

// Initialize app
const app = express();
const PORT = process.env.PORT || 4000;

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging
app.use(requestLogger);

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/license', licenseRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/plugin', pluginRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Graceful shutdown
let server;

function gracefulShutdown(signal) {
    console.log(`\n${signal} received, shutting down gracefully...`);

    if (server) {
        server.close(() => {
            console.log('✅ HTTP server closed');
            process.exit(0);
        });

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
    console.log('========================================');
    console.log('  🚀 API Public Server');
    console.log('========================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Security: JWT RS256 + HMAC`);
    console.log(`🛡️  Anti-Piracy: Enabled`);
    console.log('========================================');
});

module.exports = app;
