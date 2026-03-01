require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authMiddleware = require('../middleware/auth');
const licenseRoutes = require('../routes/license');
const whatsappRoutes = require('../routes/whatsapp');
const pluginRoutes = require('../routes/plugins');
const metricsRoutes = require('../routes/metrics');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de segurança
app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

// Rotas públicas
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

// Rotas protegidas
app.use('/api/license', licenseRoutes);
app.use('/api/whatsapp', authMiddleware, whatsappRoutes);
app.use('/api/plugins', authMiddleware, pluginRoutes);
app.use('/api/metrics', authMiddleware, metricsRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Core Engine rodando na porta ${PORT}`);
    console.log(`📡 Ambiente: ${process.env.NODE_ENV}`);
});

module.exports = app;
