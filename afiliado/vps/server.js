const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Simulação de banco de dados
const users = new Map();
const sessions = new Map();

// Versão da API
const API_VERSION = '1.0.0';

// Chave privada para assinatura (em produção, usar arquivo seguro)
let privateKey;
try {
    privateKey = fs.readFileSync(path.join(__dirname, 'keys', 'private.pem'), 'utf8');
} catch (err) {
    console.warn('AVISO: Chave privada não encontrada. Assinatura desabilitada.');
}

// Planos disponíveis
const plans = {
    free: { videoLimit: 10, pluginLimit: 0, features: ['basic'] },
    base: { videoLimit: 100, pluginLimit: 1, features: ['basic', 'metrics'] },
    growth: { videoLimit: 500, pluginLimit: 3, features: ['basic', 'metrics', 'analytics'] },
    pro: { videoLimit: 10000, pluginLimit: 999, features: ['all'] }
};

// Middleware de CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// Gerar assinatura
function signData(data) {
    if (!privateKey) {
        return 'signature-disabled';
    }
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    return sign.sign(privateKey, 'base64');
}

// Validar usuário
app.post('/api/v1/validate', (req, res) => {
    const { phone, fingerprint } = req.body;

    if (!phone || !fingerprint) {
        return res.status(400).json({ error: 'Dados inválidos' });
    }

    // Buscar ou criar usuário
    let user = users.get(phone);
    if (!user) {
        user = {
            id: crypto.randomUUID(),
            phone,
            plan: 'free',
            quotaUsed: 0,
            quotaLimit: plans.free.videoLimit,
            activePlugins: [],
            fingerprint,
            createdAt: new Date()
        };
        users.set(phone, user);
    }

    // Verificar fingerprint
    if (user.fingerprint !== fingerprint) {
        return res.status(403).json({ error: 'Dispositivo não autorizado' });
    }

    // Gerar token de sessão
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 horas
    const signature = signData(token);

    sessions.set(token, {
        userId: user.id,
        expiresAt
    });

    res.json({
        valid: true,
        user,
        token: {
            token,
            expiresAt,
            signature
        },
        plugins: []
    });
});

// Verificar quota
app.get('/api/v1/quota/:userId', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: 'Sessão inválida' });
    }

    const user = Array.from(users.values()).find(u => u.id === req.params.userId);
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
        used: user.quotaUsed,
        limit: user.quotaLimit,
        remaining: user.quotaLimit - user.quotaUsed
    });
});

// Incrementar uso
app.post('/api/v1/usage/:userId', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: 'Sessão inválida' });
    }

    const user = Array.from(users.values()).find(u => u.id === req.params.userId);
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (user.quotaUsed >= user.quotaLimit) {
        return res.status(403).json({ error: 'Quota excedida' });
    }

    user.quotaUsed++;

    res.json({
        success: true,
        used: user.quotaUsed,
        remaining: user.quotaLimit - user.quotaUsed
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: API_VERSION,
        uptime: process.uptime(),
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        }
    });
});

// Status da licença
app.get('/api/license/status', (req, res) => {
    res.json({
        status: 'active',
        version: API_VERSION,
        features: ['validation', 'quota', 'plugins']
    });
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`VPS License API v${API_VERSION} rodando na porta ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});
