# 🚀 COMO RODAR O SISTEMA LOCALMENTE

Guia completo para rodar todo o sistema SaaS de Licenças em sua máquina local.

---

## 📋 PRÉ-REQUISITOS

### Obrigatórios
- ✅ Node.js 20+ ([Download](https://nodejs.org/))
- ✅ PostgreSQL 15+ ([Download](https://www.postgresql.org/download/))
- ✅ Redis 7+ ([Download](https://redis.io/download))
- ✅ Git ([Download](https://git-scm.com/downloads))

### Opcional (mas recomendado)
- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))
- VS Code ([Download](https://code.visualstudio.com/))
- Postman ou Insomnia (para testar APIs)

---

## 🗄️ PASSO 1: CONFIGURAR BANCO DE DADOS

### Opção A: PostgreSQL Local

#### 1.1. Criar Database
```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar database e usuário
CREATE DATABASE licenses_db;
CREATE USER licenses_user WITH PASSWORD 'dev123';
GRANT ALL PRIVILEGES ON DATABASE licenses_db TO licenses_user;

# Sair
\q
```

#### 1.2. Executar Migrations
```bash
cd afiliado/vps/database

# Executar schema
psql -U licenses_user -d licenses_db -f migrations/001_initial_schema.sql

# Executar seeds (dados de teste)
psql -U licenses_user -d licenses_db -f seeds/001_initial_data.sql
```

### Opção B: Docker (Mais Fácil)

```bash
# Subir PostgreSQL e Redis com Docker
cd afiliado/vps
docker-compose up -d postgres redis

# Aguardar containers iniciarem (30 segundos)
sleep 30

# Executar migrations
docker exec -i afiliados-postgres psql -U licenses_user -d licenses_db < database/migrations/001_initial_schema.sql

# Executar seeds
docker exec -i afiliados-postgres psql -U licenses_user -d licenses_db < database/seeds/001_initial_data.sql
```

---

## 🔐 PASSO 2: GERAR CHAVES DE SEGURANÇA

### 2.1. Gerar Chaves RSA

```bash
# Criar pasta para chaves
mkdir -p afiliado/vps/keys

# Gerar chave privada
openssl genrsa -out afiliado/vps/keys/private_key.pem 2048

# Gerar chave pública
openssl rsa -in afiliado/vps/keys/private_key.pem -pubout -out afiliado/vps/keys/public_key.pem

# Converter para base64 (uma linha)
# Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("afiliado/vps/keys/private_key.pem")) > afiliado/vps/keys/private_key_base64.txt
[Convert]::ToBase64String([IO.File]::ReadAllBytes("afiliado/vps/keys/public_key.pem")) > afiliado/vps/keys/public_key_base64.txt

# Linux/Mac
cat afiliado/vps/keys/private_key.pem | base64 -w 0 > afiliado/vps/keys/private_key_base64.txt
cat afiliado/vps/keys/public_key.pem | base64 -w 0 > afiliado/vps/keys/public_key_base64.txt
```

### 2.2. Gerar Secrets

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# License Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# HMAC Secret (Webhooks)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ⚙️ PASSO 3: CONFIGURAR VARIÁVEIS DE AMBIENTE

### 3.1. API Pública

```bash
cd afiliado/vps/api-public
cp .env.example .env
```

Editar `.env`:
```env
NODE_ENV=development
PORT=4000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=licenses_db
DB_USER=licenses_user
DB_PASSWORD=dev123

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# RSA Keys (colar conteúdo dos arquivos base64)
RSA_PRIVATE_KEY=<conteúdo de private_key_base64.txt>
RSA_PUBLIC_KEY=<conteúdo de public_key_base64.txt>

# JWT
JWT_SECRET=<seu_jwt_secret_aqui>
JWT_EXPIRES_IN=24h

# License
LICENSE_SECRET=<seu_license_secret_aqui>

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
```

### 3.2. API Admin

```bash
cd afiliado/vps/api-admin
cp .env.example .env
```

Editar `.env`:
```env
NODE_ENV=development
PORT=4001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=licenses_db
DB_USER=licenses_user
DB_PASSWORD=dev123

# JWT
JWT_SECRET=<mesmo_jwt_secret_da_api_publica>
JWT_EXPIRES_IN=24h

# Admin Panel
ADMIN_CORS_ORIGIN=http://localhost:3001

# Logging
LOG_LEVEL=debug
```

### 3.3. Webhook API

```bash
cd afiliado/vps/api-webhook
cp .env.example .env
```

Editar `.env`:
```env
NODE_ENV=development
PORT=4002

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=licenses_db
DB_USER=licenses_user
DB_PASSWORD=dev123

# Mercado Pago
MERCADOPAGO_WEBHOOK_SECRET=<seu_hmac_secret_aqui>

# Stripe
STRIPE_WEBHOOK_SECRET=<seu_stripe_secret_aqui>

# Logging
LOG_LEVEL=debug
```

### 3.4. Admin Panel

```bash
cd afiliado/vps/admin-panel
cp .env.example .env
```

Editar `.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4001
```

---

## 📦 PASSO 4: INSTALAR DEPENDÊNCIAS

### 4.1. API Pública
```bash
cd afiliado/vps/api-public
npm install
```

### 4.2. API Admin
```bash
cd afiliado/vps/api-admin
npm install
```

### 4.3. Webhook API
```bash
cd afiliado/vps/api-webhook
npm install
```

### 4.4. Admin Panel
```bash
cd afiliado/vps/admin-panel
npm install
```

---

## 🚀 PASSO 5: RODAR OS SERVIÇOS

### Opção A: Rodar Manualmente (4 terminais)

#### Terminal 1: API Pública
```bash
cd afiliado/vps/api-public
npm run dev
```
✅ Rodando em: http://localhost:4000

#### Terminal 2: API Admin
```bash
cd afiliado/vps/api-admin
npm run dev
```
✅ Rodando em: http://localhost:4001

#### Terminal 3: Webhook API
```bash
cd afiliado/vps/api-webhook
npm run dev
```
✅ Rodando em: http://localhost:4002

#### Terminal 4: Admin Panel
```bash
cd afiliado/vps/admin-panel
npm run dev
```
✅ Rodando em: http://localhost:3001

### Opção B: Script de Inicialização (Windows)

Criar arquivo `start-all-dev.bat`:
```batch
@echo off
start cmd /k "cd afiliado\vps\api-public && npm run dev"
start cmd /k "cd afiliado\vps\api-admin && npm run dev"
start cmd /k "cd afiliado\vps\api-webhook && npm run dev"
start cmd /k "cd afiliado\vps\admin-panel && npm run dev"
echo Todos os serviços foram iniciados!
```

Executar:
```bash
start-all-dev.bat
```

### Opção C: Docker Compose (Mais Fácil)

```bash
cd afiliado/vps
docker-compose up
```

---

## 🔍 PASSO 6: VERIFICAR SE ESTÁ FUNCIONANDO

### 6.1. Health Checks

```bash
# API Pública
curl http://localhost:4000/health

# API Admin
curl http://localhost:4001/health

# Webhook API
curl http://localhost:4002/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2026-03-01T10:00:00Z",
  "version": "1.0.0"
}
```

### 6.2. Admin Panel

Abrir navegador: http://localhost:3001

Você deve ver a página de login.

---

## 👤 PASSO 7: CRIAR ADMIN INICIAL

### 7.1. Gerar Hash de Senha

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10))"
```

### 7.2. Inserir no Banco

```bash
psql -U licenses_user -d licenses_db
```

```sql
INSERT INTO admin_users (email, password_hash, name, role, is_active)
VALUES (
  'admin@localhost.com',
  '$2a$10$...',  -- Colar hash gerado acima
  'Admin Local',
  'super_admin',
  true
);
```

### 7.3. Fazer Login

1. Abrir http://localhost:3001
2. Email: `admin@localhost.com`
3. Senha: `admin123`

---

## 🧪 PASSO 8: TESTAR AS APIs

### 8.1. Testar API Pública

```bash
# Validar licença (vai falhar pois não tem licença ainda)
curl -X POST http://localhost:4000/api/auth/validate \
  -H "Content-Type: application/json" \
  -d '{
    "license_key": "ABCD1234-EFGH5678-IJKL9012-MNOP3456",
    "fingerprint": "test-machine-123"
  }'
```

### 8.2. Testar API Admin

```bash
# Login
curl -X POST http://localhost:4001/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@localhost.com",
    "password": "admin123"
  }'

# Copiar o token da resposta e usar nos próximos requests
TOKEN="seu_token_aqui"

# Listar usuários
curl -X GET http://localhost:4001/admin/users \
  -H "Authorization: Bearer $TOKEN"
```

### 8.3. Usar Admin Panel

1. Fazer login
2. Navegar pelas páginas
3. Criar um plano
4. Criar um usuário
5. Criar uma licença

---

## 📊 PASSO 9: POPULAR COM DADOS DE TESTE

### 9.1. Criar Planos

Via Admin Panel ou API:

```bash
curl -X POST http://localhost:4001/admin/plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Plano Básico",
    "slug": "basico",
    "description": "Plano para iniciantes",
    "price_monthly": 29.90,
    "quota_monthly": 1000,
    "max_machines": 1,
    "features": ["Feature 1", "Feature 2"]
  }'
```

### 9.2. Criar Usuários

```bash
curl -X POST http://localhost:4001/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+5511999999999",
    "email": "teste@example.com",
    "name": "Usuário Teste"
  }'
```

### 9.3. Criar Licenças

```bash
curl -X POST http://localhost:4001/admin/licenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid-do-usuario",
    "plan_id": "uuid-do-plano"
  }'
```

---

## 🐛 TROUBLESHOOTING

### Problema: Erro de conexão com banco

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
# Windows
sc query postgresql-x64-15

# Linux/Mac
sudo systemctl status postgresql

# Verificar conexão
psql -U licenses_user -d licenses_db -c "SELECT 1"
```

### Problema: Erro de conexão com Redis

**Solução:**
```bash
# Verificar se Redis está rodando
# Windows
sc query Redis

# Linux/Mac
sudo systemctl status redis

# Testar conexão
redis-cli ping
```

### Problema: Porta já em uso

**Solução:**
```bash
# Windows - Matar processo na porta 4000
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

### Problema: Módulos não encontrados

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Problema: Erro de permissão no banco

**Solução:**
```sql
-- Conectar como postgres
psql -U postgres

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE licenses_db TO licenses_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO licenses_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO licenses_user;
```

---

## 📝 LOGS E DEBUG

### Ver Logs em Tempo Real

```bash
# API Pública
tail -f afiliado/vps/api-public/logs/app.log

# API Admin
tail -f afiliado/vps/api-admin/logs/app.log

# Webhook API
tail -f afiliado/vps/api-webhook/logs/app.log
```

### Aumentar Nível de Log

Editar `.env` de cada API:
```env
LOG_LEVEL=debug
```

---

## 🎯 PRÓXIMOS PASSOS

Agora que tudo está rodando:

1. ✅ Explorar o Admin Panel
2. ✅ Criar planos, usuários e licenças
3. ✅ Testar validação de licença
4. ✅ Ver audit logs
5. ✅ Testar webhooks (com ngrok)
6. ✅ Ler a documentação completa

---

## 📚 RECURSOS ÚTEIS

- [Documentação API Admin](./API_ADMIN_COMPLETA.md)
- [Exemplos de Uso](./EXEMPLOS_USO_API_ADMIN.md)
- [Arquitetura](./FASE2_ARQUITETURA.md)
- [Checklist de Deploy](./CHECKLIST_DEPLOY_FASE2.md)

---

## 🎊 PRONTO!

Seu sistema SaaS de Licenças está rodando localmente! 🚀

**URLs:**
- Admin Panel: http://localhost:3001
- API Pública: http://localhost:4000
- API Admin: http://localhost:4001
- Webhook API: http://localhost:4002

**Credenciais:**
- Email: admin@localhost.com
- Senha: admin123

Divirta-se explorando! 🎉
