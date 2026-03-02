/**
 * Script para implementar Redis Cache no sistema de Entitlements
 * Executar apenas se os testes de carga indicarem necessidade
 */

const fs = require('fs');
const path = require('path');

class RedisCacheImplementation {
    constructor() {
        this.serverPath = path.join(__dirname, '..', 'server.js');
        this.packagePath = path.join(__dirname, '..', 'package.json');
    }

    async implement() {
        console.log('🚀 IMPLEMENTANDO REDIS CACHE');
        console.log('='.repeat(80));
        console.log('');

        // 1. Adicionar dependência do Redis
        console.log('1️⃣  Adicionando dependência do Redis...');
        await this.addRedisDependency();

        // 2. Criar módulo de cache
        console.log('2️⃣  Criando módulo de cache...');
        await this.createCacheModule();

        // 3. Criar configuração
        console.log('3️⃣  Criando arquivo de configuração...');
        await this.createConfig();

        // 4. Gerar código de integração
        console.log('4️⃣  Gerando código de integração...');
        await this.generateIntegrationCode();

        console.log('');
        console.log('='.repeat(80));
        console.log('✅ IMPLEMENTAÇÃO CONCLUÍDA');
        console.log('='.repeat(80));
        console.log('');
        console.log('📋 PRÓXIMOS PASSOS:');
        console.log('');
        console.log('1. Instalar dependências:');
        console.log('   npm install');
        console.log('');
        console.log('2. Configurar Redis no .env:');
        console.log('   REDIS_HOST=localhost');
        console.log('   REDIS_PORT=6379');
        console.log('   REDIS_PASSWORD=');
        console.log('   CACHE_TTL=300');
        console.log('');
        console.log('3. Iniciar Redis:');
        console.log('   docker run -d -p 6379:6379 redis:alpine');
        console.log('');
        console.log('4. Integrar o cache no server.js:');
        console.log('   - Veja o arquivo: cache-integration-example.js');
        console.log('');
        console.log('5. Executar novos testes de carga:');
        console.log('   ./run-load-test.sh');
        console.log('');
    }

    async addRedisDependency() {
        const packageJson = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));

        if (!packageJson.dependencies.redis) {
            packageJson.dependencies.redis = '^4.6.0';
            fs.writeFileSync(this.packagePath, JSON.stringify(packageJson, null, 4));
            console.log('   ✅ Dependência "redis" adicionada ao package.json');
        } else {
            console.log('   ℹ️  Dependência "redis" já existe');
        }
    }

    async createCacheModule() {
        const cacheModulePath = path.join(__dirname, '..', 'cache.js');

        const cacheModule = `const redis = require('redis');

class CacheService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.ttl = parseInt(process.env.CACHE_TTL) || 300; // 5 minutes default
    }

    async connect() {
        try {
            this.client = redis.createClient({
                socket: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT) || 6379,
                },
                password: process.env.REDIS_PASSWORD || undefined,
            });

            this.client.on('error', (err) => {
                console.error('❌ Redis Client Error:', err);
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

            await this.client.connect();
            return true;
        } catch (error) {
            console.error('❌ Failed to connect to Redis:', error.message);
            this.isConnected = false;
            return false;
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
            console.error('Cache get error:', error);
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
            console.error('Cache set error:', error);
            return false;
        }
    }

    async del(key) {
        if (!this.isConnected) return false;

        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            console.error('Cache delete error:', error);
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
            console.error('Cache invalidate error:', error);
            return false;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.quit();
            this.isConnected = false;
        }
    }

    // Helper: Generate cache key
    generateKey(prefix, ...parts) {
        return \`\${prefix}:\${parts.join(':')}\`;
    }

    // Helper: Check if cache is available
    isAvailable() {
        return this.isConnected;
    }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
`;

        fs.writeFileSync(cacheModulePath, cacheModule);
        console.log('   ✅ Módulo de cache criado: cache.js');
    }

    async createConfig() {
        const envExamplePath = path.join(__dirname, '..', '.env.example');
        let envExample = '';

        if (fs.existsSync(envExamplePath)) {
            envExample = fs.readFileSync(envExamplePath, 'utf8');
        }

        if (!envExample.includes('REDIS_HOST')) {
            const redisConfig = `
# Redis Cache Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CACHE_TTL=300
`;
            envExample += redisConfig;
            fs.writeFileSync(envExamplePath, envExample);
            console.log('   ✅ Configuração Redis adicionada ao .env.example');
        } else {
            console.log('   ℹ️  Configuração Redis já existe no .env.example');
        }
    }

    async generateIntegrationCode() {
        const integrationPath = path.join(__dirname, '..', 'cache-integration-example.js');

        const integrationCode = `/**
 * EXEMPLO DE INTEGRAÇÃO DO CACHE NO SERVER.JS
 * 
 * Este arquivo mostra como integrar o cache Redis nos endpoints existentes.
 * Copie e adapte o código conforme necessário.
 */

const cache = require('./cache');

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

// Adicionar no início do server.js, após as importações:
async function initializeCache() {
    const connected = await cache.connect();
    if (connected) {
        console.log('✅ Cache Redis inicializado');
    } else {
        console.log('⚠️  Cache Redis não disponível - operando sem cache');
    }
}

// Chamar antes de iniciar o servidor:
// initializeCache();

// ============================================================================
// EXEMPLO 1: VALIDATE LICENSE COM CACHE
// ============================================================================

app.post('/api/validate-license', async (req, res) => {
    try {
        const { whatsapp, fingerprint, signature } = req.body;

        if (!whatsapp || !fingerprint) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // 1. Tentar buscar do cache
        const cacheKey = cache.generateKey('license', whatsapp, fingerprint);
        const cached = await cache.get(cacheKey);
        
        if (cached) {
            console.log('✅ Cache HIT:', cacheKey);
            return res.json(cached);
        }

        console.log('❌ Cache MISS:', cacheKey);

        // 2. Processar normalmente (código original)
        const dataToVerify = { whatsapp, fingerprint };
        if (signature && !verifySignature(dataToVerify, signature)) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        const licenseKey = \`license:\${whatsapp}\`;
        let license = licenses.get(licenseKey);

        if (!license) {
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

        if (license.fingerprint !== fingerprint) {
            return res.status(403).json({
                error: 'License already activated on another device',
                plan: 'free'
            });
        }

        const token = jwt.sign(
            {
                whatsapp,
                plan: license.plan,
                fingerprint,
                exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
            },
            process.env.JWT_SECRET
        );

        const responseData = {
            plan: license.plan,
            quota: license.quota,
            quotaUsed: license.quotaUsed,
            plugins: license.plugins,
            token
        };
        const responseSignature = signData(responseData);

        const response = {
            ...responseData,
            signature: responseSignature
        };

        // 3. Salvar no cache
        await cache.set(cacheKey, response, 300); // 5 minutos

        res.json(response);

    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================================
// EXEMPLO 2: CHECK QUOTA COM CACHE
// ============================================================================

app.post('/api/check-quota', async (req, res) => {
    try {
        const { whatsapp, token } = req.body;

        if (!whatsapp || !token) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // 1. Tentar buscar do cache
        const cacheKey = cache.generateKey('quota', whatsapp);
        const cached = await cache.get(cacheKey);
        
        if (cached) {
            console.log('✅ Cache HIT:', cacheKey);
            return res.json(cached);
        }

        // 2. Buscar do banco/memória
        const licenseKey = \`license:\${whatsapp}\`;
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
        const response = {
            ...responseData,
            signature
        };

        // 3. Salvar no cache (TTL curto para dados que mudam)
        await cache.set(cacheKey, response, 60); // 1 minuto

        res.json(response);

    } catch (error) {
        console.error('Quota check error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================================
// EXEMPLO 3: CONSUME QUOTA COM INVALIDAÇÃO DE CACHE
// ============================================================================

app.post('/api/consume-quota', async (req, res) => {
    try {
        const { whatsapp, token, amount = 1 } = req.body;

        if (!whatsapp || !token) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const licenseKey = \`license:\${whatsapp}\`;
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

        // Consumir quota
        license.quotaUsed += amount;
        licenses.set(licenseKey, license);

        // IMPORTANTE: Invalidar cache relacionado
        const quotaCacheKey = cache.generateKey('quota', whatsapp);
        await cache.del(quotaCacheKey);
        console.log('🗑️  Cache invalidado:', quotaCacheKey);

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

// ============================================================================
// GRACEFUL SHUTDOWN COM CACHE
// ============================================================================

function gracefulShutdown(signal) {
    console.log(\`\\n\${signal} received, shutting down gracefully...\`);

    if (server) {
        server.close(async () => {
            console.log('✅ HTTP server closed');
            
            // Desconectar do Redis
            await cache.disconnect();
            console.log('✅ Redis disconnected');
            
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

// ============================================================================
// MÉTRICAS DE CACHE (OPCIONAL)
// ============================================================================

// Endpoint para verificar status do cache
app.get('/api/cache/status', (req, res) => {
    res.json({
        connected: cache.isAvailable(),
        ttl: cache.ttl,
    });
});

// Endpoint para limpar cache (admin only)
app.post('/api/cache/clear', async (req, res) => {
    // Adicionar autenticação admin aqui
    
    const { pattern } = req.body;
    const cleared = await cache.invalidatePattern(pattern || '*');
    
    res.json({
        success: cleared,
        message: cleared ? 'Cache cleared' : 'Failed to clear cache'
    });
});

module.exports = { initializeCache };
`;

        fs.writeFileSync(integrationPath, integrationCode);
        console.log('   ✅ Exemplo de integração criado: cache-integration-example.js');
    }
}

// Executar
if (require.main === module) {
    const implementation = new RedisCacheImplementation();
    implementation.implement().catch(console.error);
}

module.exports = RedisCacheImplementation;
