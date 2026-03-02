# 🛠 Comandos Úteis - Sistema VPS

Referência rápida de comandos para desenvolvimento e manutenção.

---

## 🗄 Banco de Dados

### Migrations

```bash
# Ver status das migrations
node scripts/run-migrations.js --status

# Executar migrations pendentes
node scripts/run-migrations.js

# Executar migrations + seeds
node scripts/run-migrations.js --seed
```

### Acesso Direto ao Banco

```bash
# PostgreSQL local
psql -h localhost -U postgres -d saas_licenses

# PostgreSQL Docker
docker exec -it postgres psql -U postgres -d saas_licenses
```

### Queries Úteis

```sql
-- Ver todas as tabelas
\dt

-- Ver todas as views
\dv

-- Ver todos os índices
\di

-- Descrever tabela
\d entitlements

-- Ver migrations executadas
SELECT * FROM migrations ORDER BY executed_at DESC;

-- Ver entitlements ativos
SELECT * FROM v_user_entitlements LIMIT 10;

-- Ver usage counters ativos
SELECT * FROM v_active_usage_counters LIMIT 10;

-- Ver plugin entitlements
SELECT * FROM v_active_plugin_entitlements LIMIT 10;

-- Estatísticas de uso do banco
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🧹 Manutenção

### Job de Limpeza

```bash
# Executar job de limpeza
node scripts/run-cleanup-job.js

# Com estatísticas do banco
node scripts/run-cleanup-job.js --stats

# Ver logs
tail -f logs/cleanup.log
```

### Configurar Cron (Linux)

```bash
# Editar crontab
crontab -e

# Adicionar job diário às 3h da manhã
0 3 * * * cd /path/to/vps && node scripts/run-cleanup-job.js >> logs/cleanup.log 2>&1
```

### Configurar Task Scheduler (Windows)

```powershell
# Criar tarefa agendada
schtasks /create /tn "VPS Cleanup Job" /tr "node C:\path\to\vps\scripts\run-cleanup-job.js" /sc daily /st 03:00
```

---

## 🧪 Testes

### Testar Entitlements

```bash
# Criar arquivo de teste
cat > test-entitlements.js << 'EOF'
const { getInstance } = require('./shared/entitlements/EntitlementResolverService');

async function test() {
    const resolver = getInstance();
    
    // Substituir por UUID real
    const licenseId = 'uuid-da-licenca';
    
    console.log('Resolving entitlements...');
    const entitlement = await resolver.resolve(licenseId);
    
    console.log('\nFeatures:', JSON.stringify(entitlement.features, null, 2));
    console.log('\nPlugins:', JSON.stringify(entitlement.plugins, null, 2));
    console.log('\nQuotas:', JSON.stringify(entitlement.quotas, null, 2));
    
    process.exit(0);
}

test().catch(console.error);
EOF

# Executar teste
node test-entitlements.js
```

### Testar Usage Counters

```bash
# Criar arquivo de teste
cat > test-usage.js << 'EOF'
const { getInstance } = require('./shared/entitlements/UsageService');

async function test() {
    const usageService = getInstance();
    
    // Substituir por UUID real
    const licenseId = 'uuid-da-licenca';
    
    console.log('Testing usage increment...');
    
    // Incrementar
    const result = await usageService.increment(
        licenseId,
        'monthly_messages',
        1,
        'feature',
        'monthly'
    );
    
    console.log('\nResult:', JSON.stringify(result, null, 2));
    
    // Ver status
    const status = await usageService.getUsageStatus(licenseId);
    console.log('\nStatus:', JSON.stringify(status, null, 2));
    
    process.exit(0);
}

test().catch(console.error);
EOF

# Executar teste
node test-usage.js
```

### Testar Plugins

```bash
# Criar arquivo de teste
cat > test-plugins.js << 'EOF'
const { getInstance } = require('./shared/entitlements/PluginRegistryService');

async function test() {
    const pluginRegistry = getInstance();
    
    // Substituir por UUID real
    const licenseId = 'uuid-da-licenca';
    
    console.log('Checking plugin access...');
    
    // Verificar acesso
    const access = await pluginRegistry.checkAccess(licenseId, 'auto-responder');
    console.log('\nAccess:', JSON.stringify(access, null, 2));
    
    // Listar plugins disponíveis
    const plugins = await pluginRegistry.getAvailablePlugins(licenseId);
    console.log('\nAvailable plugins:', JSON.stringify(plugins, null, 2));
    
    process.exit(0);
}

test().catch(console.error);
EOF

# Executar teste
node test-plugins.js
```

---

## 🐳 Docker

### Comandos Básicos

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f api-public

# Parar todos os serviços
docker-compose down

# Rebuild e restart
docker-compose up -d --build

# Ver status dos containers
docker-compose ps
```

### Acesso aos Containers

```bash
# Entrar no container da API Pública
docker exec -it api-public sh

# Entrar no container do PostgreSQL
docker exec -it postgres bash

# Entrar no container da API Admin
docker exec -it api-admin sh
```

### Logs

```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver últimas 100 linhas
docker-compose logs --tail=100

# Ver logs de um serviço
docker-compose logs -f api-public

# Salvar logs em arquivo
docker-compose logs > logs/docker.log
```

---

## 📊 Monitoramento

### Verificar Portas

```bash
# Linux/Mac
lsof -i :4000  # API Pública
lsof -i :4001  # API Admin
lsof -i :4002  # Webhook API
lsof -i :5432  # PostgreSQL

# Windows
netstat -ano | findstr :4000
netstat -ano | findstr :4001
netstat -ano | findstr :4002
netstat -ano | findstr :5432
```

### Health Checks

```bash
# API Pública
curl http://localhost:4000/health

# API Admin
curl http://localhost:4001/health

# Webhook API
curl http://localhost:4002/health
```

### Estatísticas do Banco

```sql
-- Tamanho das tabelas
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Número de registros por tabela
SELECT 
    schemaname,
    tablename,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- Índices não utilizados
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND idx_scan = 0
ORDER BY tablename, indexname;

-- Queries lentas (se pg_stat_statements estiver habilitado)
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## 🔧 Desenvolvimento

### Instalar Dependências

```bash
# API Pública
cd api-public
npm install

# API Admin
cd api-admin
npm install

# Webhook API
cd api-webhook
npm install

# Admin Panel
cd admin-panel
npm install
```

### Rodar Localmente

```bash
# API Pública
cd api-public
npm run dev

# API Admin
cd api-admin
npm run dev

# Webhook API
cd api-webhook
npm run dev

# Admin Panel
cd admin-panel
npm run dev
```

### Lint e Format

```bash
# Lint
npm run lint

# Fix lint issues
npm run lint:fix

# Format com Prettier
npm run format
```

---

## 📝 Logs

### Ver Logs

```bash
# Logs da aplicação
tail -f logs/app.log

# Logs de erro
tail -f logs/error.log

# Logs do cleanup job
tail -f logs/cleanup.log

# Logs do Docker
docker-compose logs -f
```

### Limpar Logs

```bash
# Limpar logs antigos (>30 dias)
find logs/ -name "*.log" -mtime +30 -delete

# Limpar todos os logs
rm -f logs/*.log
```

---

## 🔐 Segurança

### Gerar Chaves RSA

```bash
# Gerar par de chaves RSA-2048
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem

# Converter para formato usado no .env
cat private.pem | tr '\n' '|'
cat public.pem | tr '\n' '|'
```

### Gerar API Keys

```bash
# Gerar API Key aleatória
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Gerar múltiplas API Keys
for i in {1..5}; do node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"; done
```

### Gerar JWT Secret

```bash
# Gerar JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🚀 Deploy

### Build para Produção

```bash
# Build API Pública
cd api-public
docker build -t api-public:latest .

# Build API Admin
cd api-admin
docker build -t api-admin:latest .

# Build Webhook API
cd api-webhook
docker build -t api-webhook:latest .

# Build Admin Panel
cd admin-panel
docker build -t admin-panel:latest .
```

### Deploy com Docker Compose

```bash
# Deploy em produção
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Parar
docker-compose -f docker-compose.prod.yml down
```

---

## 📚 Documentação

### Gerar Documentação

```bash
# Gerar docs da API com JSDoc
npm run docs

# Abrir documentação
open docs/index.html
```

### Ver Documentação

```bash
# Listar documentos disponíveis
ls -la docs/
ls -la planejamento/

# Ver documento específico
cat docs/ENTITLEMENTS_USAGE_GUIDE.md
cat planejamento/RELATORIO_AUDITORIA_FASE2.5.md
```

---

## 🆘 Troubleshooting

### Resetar Banco de Dados

```bash
# CUIDADO: Isso apaga todos os dados!

# Conectar ao banco
psql -h localhost -U postgres -d saas_licenses

# Dropar todas as tabelas
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

# Executar migrations novamente
node scripts/run-migrations.js
node scripts/run-migrations.js --seed
```

### Resetar Docker

```bash
# Parar e remover containers
docker-compose down

# Remover volumes (CUIDADO: apaga dados!)
docker-compose down -v

# Rebuild tudo
docker-compose up -d --build
```

### Verificar Conexão com Banco

```bash
# Testar conexão
psql -h localhost -U postgres -d saas_licenses -c "SELECT 1"

# Ver conexões ativas
psql -h localhost -U postgres -d saas_licenses -c "SELECT * FROM pg_stat_activity"
```

---

## 📞 Suporte

Para mais informações, consulte:

- **Documentação Completa:** `docs/`
- **Planejamento:** `planejamento/`
- **Guia de Uso:** `docs/ENTITLEMENTS_USAGE_GUIDE.md`
- **Auditoria Técnica:** `planejamento/RELATORIO_AUDITORIA_FASE2.5.md`

---

**Última atualização:** 01/03/2026

