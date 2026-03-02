/**
 * Webhook API Server
 * Handles payment webhooks from Mercado Pago and Stripe
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const MercadoPagoProvider = require('./providers/MercadoPagoProvider');
const WebhookHandler = require('./handlers/WebhookHandler');
const { getInstance: getLogger } = require('../../shared/utils/logger');

const app = express();
const PORT = process.env.PORT || 4002;
const logger = getLogger();

// Trust proxy
app.set('trust proxy', 1);

// Security
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize providers
const mercadoPagoProvider = new MercadoPagoProvider();
const webhookHandler = new WebhookHandler();

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

/**
 * POST /webhook/mercadopago
 * Handle Mercado Pago webhooks
 */
app.post('/webhook/mercadopago', async (req, res) => {
    try {
        const signature = req.headers['x-signature'];
        const event = req.body;

        logger.info('Mercado Pago webhook received', {
            type: event.type,
            id: event.data?.id
        });

        // Validate signature
        if (signature && !mercadoPagoProvider.validateSignature(event, signature)) {
            logger.security('Invalid webhook signature', {
                ip: req.ip
            });
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Process webhook
        const result = await mercadoPagoProvider.processWebhook(event);

        if (!result.processed) {
            return res.status(400).json({ error: result.reason });
        }

        // Handle event based on type
        if (result.type === 'payment') {
            await webhookHandler.handlePayment(result);
        } else if (result.type === 'subscription') {
            await webhookHandler.handleSubscription(result);
        }

        logger.info('Webhook processed successfully', {
            type: result.type,
            externalId: result.externalId
        });

        res.json({ success: true });

    } catch (error) {
        logger.error('Error processing Mercado Pago webhook', {
            error: error.message
        });
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /webhook/stripe
 * Handle Stripe webhooks (future)
 */
app.post('/webhook/stripe', async (req, res) => {
    try {
        logger.info('Stripe webhook received');

        // TODO: Implement Stripe webhook handling

        res.json({ success: true, message: 'Stripe integration coming soon' });

    } catch (error) {
        logger.error('Error processing Stripe webhook', {
            error: error.message
        });
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack
    });
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
    console.log('  🔔 Webhook API Server');
    console.log('========================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💳 Mercado Pago: Enabled`);
    console.log(`💳 Stripe: Coming Soon`);
    console.log('========================================');
});

module.exports = app;
