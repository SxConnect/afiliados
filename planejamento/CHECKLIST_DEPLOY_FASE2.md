# ✅ CHECKLIST DE DEPLOY - FASE 2

## 📋 PRÉ-REQUISITOS

### Infraestrutura
- [ ] Servidor VPS com Docker instalado
- [ ] PostgreSQL 15+ instalado ou container
- [ ] Redis 7+ instalado ou container
- [ ] Domínio configurado com SSL
- [ ] Firewall configurado (portas 4000, 4001, 4002)

### Ferramentas
- [ ] Docker 24+
- [ ] Docker Compose 2.20+
- [ ] Git
- [ ] Node.js 20+ (para desenvolvimento)

---

## 🗄️ BANCO DE DADOS

### 1. Criar Database
```sql
CREATE DATABASE licenses_db;
CREATE USER licenses_user WITH PASSWORD 'senha_segura_aqui';
GRANT ALL PRIVILEGES ON DATABASE licenses_db TO licenses_user;
```

### 2. Executar Migrations
```bash
cd afiliado/vps/database
psql -U licenses_user -d licenses_db -f migrations/001_initial_schema.sql
```

### 3. Executar Seeds (opcional - dados de teste)
```bash
psql -U licenses_user -d licenses_db -f seeds/001_initial_data.sql
```

### 4. Verificar Tabelas
```sql
\dt
-- Deve mostrar 12 tabelas
```

---

## 🔐 GERAR CHAVES DE SEGURANÇA

### 1. Gerar Chaves RSA (2048 bits)
```bash
# Private key
openssl genrsa -out private_key.pem 2048

# Public key
openssl rsa -in private_key.pem -pubout -out public_key.pem

# Converter para formato base64 (uma linha)
cat private_key.pem | base64 -w 0 > private_key_base64.txt
cat public_key.pem | base64 -w 0 > public_key_base64.txt
```

### 2. Gerar JWT Secret
```bash
openssl rand -base64 64
```

### 3. Gerar HMAC Secret (para webhooks)
```bash
openssl rand -hex 32
```

### 4. Gerar License Secret
```bash
openssl rand -hex 32
```

---

## ⚙️ CONFIGURAR VARIÁVEIS DE AMBIENTE

### API Pública (.env)
```bash
cd afiliado/vps/api-public
cp .env.example .env
nano .env
```

**Configurar:**
```env
NODE_ENV=production
PORT=4000

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=licenses_db
DB_USER=licenses_user
DB_PASSWORD=sua_senha_aqui

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=sua_senha_redis

# RSA Keys (base64)
RSA_PRIVATE_KEY=sua_chave_privada_base64
RSA_PUBLIC_KEY=sua_chave_publica_base64

# JWT
JWT_SECRET=seu_jwt_secret_aqui
JWT_EXPIRES_IN=24h

# License
LICENSE_SECRET=seu_license_secret_aqui

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### API Admin (.env)
```bash
cd afiliado/vps/api-admin
cp .env.example .env
nano .env
```

**Configurar:**
```env
NODE_ENV=production
PORT=4001

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=licenses_db
DB_USER=licenses_user
DB_PASSWORD=sua_senha_aqui

# JWT
JWT_SECRET=seu_jwt_secret_aqui
JWT_EXPIRES_IN=24h

# Admin Panel
ADMIN_CORS_ORIGIN=https://admin.seudominio.com

# Logging
LOG_LEVEL=info
```

### Webhook API (.env)
```bash
cd afiliado/vps/api-webhook
cp .env.example .env
nano .env
```

**Configurar:**
```env
NODE_ENV=production
PORT=4002

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=licenses_db
DB_USER=licenses_user
DB_PASSWORD=sua_senha_aqui

# Mercado Pago
MERCADOPAGO_WEBHOOK_SECRET=seu_webhook_secret_mp

# Stripe
STRIPE_WEBHOOK_SECRET=seu_webhook_secret_stripe

# Logging
LOG_LEVEL=info
```

---

## 🐳 DOCKER COMPOSE

### 1. Criar docker-compose.production.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: licenses_db
      POSTGRES_USER: licenses_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U licenses_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api-public:
    build:
      context: .
      dockerfile: api-public/Dockerfile
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
    env_file:
      - api-public/.env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  api-admin:
    build:
      context: .
      dockerfile: api-admin/Dockerfile
    ports:
      - "4001:4001"
    environment:
      - NODE_ENV=production
    env_file:
      - api-admin/.env
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  api-webhook:
    build:
      context: .
      dockerfile: api-webhook/Dockerfile
    ports:
      - "4002:4002"
    environment:
      - NODE_ENV=production
    env_file:
      - api-webhook/.env
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 2. Build e Deploy
```bash
# Build das imagens
docker-compose -f docker-compose.production.yml build

# Subir os serviços
docker-compose -f docker-compose.production.yml up -d

# Verificar logs
docker-compose -f docker-compose.production.yml logs -f

# Verificar status
docker-compose -f docker-compose.production.yml ps
```

---

## 🔍 VERIFICAÇÕES PÓS-DEPLOY

### 1. Health Checks
```bash
# API Pública
curl http://localhost:4000/health

# API Admin
curl http://localhost:4001/health

# Webhook API
curl http://localhost:4002/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-01T10:00:00Z",
  "version": "1.0.0"
}
```

### 2. Testar Conexão com Banco
```bash
docker exec -it <container-postgres> psql -U licenses_user -d licenses_db -c "SELECT COUNT(*) FROM users;"
```

### 3. Testar Redis
```bash
docker exec -it <container-redis> redis-cli -a ${REDIS_PASSWORD} ping
```

### 4. Verificar Logs
```bash
# Logs da API Pública
docker logs <container-api-public> --tail 100

# Logs da API Admin
docker logs <container-api-admin> --tail 100

# Logs da Webhook API
docker logs <container-api-webhook> --tail 100
```

---

## 🔐 CRIAR ADMIN INICIAL

### 1. Conectar ao Banco
```bash
docker exec -it <container-postgres> psql -U licenses_user -d licenses_db
```

### 2. Criar Admin
```sql
INSERT INTO admin_users (email, password_hash, name, role, is_active)
VALUES (
  'admin@seudominio.com',
  '$2a$10$exemplo_hash_bcrypt_aqui',  -- Gerar com bcrypt
  'Super Admin',
  'super_admin',
  true
);
```

### 3. Gerar Hash de Senha (Node.js)
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('sua_senha_aqui', 10);
console.log(hash);
```

---

## 🌐 CONFIGURAR NGINX (Reverse Proxy)

### 1. Instalar Nginx
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

### 2. Configurar Sites
```nginx
# /etc/nginx/sites-available/api-public
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}

# /etc/nginx/sites-available/api-admin
server {
    listen 80;
    server_name admin-api.seudominio.com;

    location / {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}

# /etc/nginx/sites-available/api-webhook
server {
    listen 80;
    server_name webhook.seudominio.com;

    location / {
        proxy_pass http://localhost:4002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Ativar Sites
```bash
sudo ln -s /etc/nginx/sites-available/api-public /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api-admin /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api-webhook /etc/nginx/sites-enabled/

sudo nginx -t
sudo systemctl reload nginx
```

### 4. Configurar SSL (Let's Encrypt)
```bash
sudo certbot --nginx -d api.seudominio.com
sudo certbot --nginx -d admin-api.seudominio.com
sudo certbot --nginx -d webhook.seudominio.com
```

---

## 🔥 FIREWALL

### 1. Configurar UFW
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. Bloquear Portas Internas
```bash
# Não expor portas 4000, 4001, 4002 diretamente
# Apenas via Nginx
```

---

## 📊 MONITORAMENTO

### 1. Logs Centralizados
```bash
# Criar diretório de logs
mkdir -p /var/log/licenses-api

# Configurar logrotate
sudo nano /etc/logrotate.d/licenses-api
```

```
/var/log/licenses-api/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
}
```

### 2. Monitorar Recursos
```bash
# CPU e Memória
docker stats

# Espaço em disco
df -h

# Logs em tempo real
docker-compose logs -f
```

---

## 🔄 BACKUP

### 1. Backup do Banco de Dados
```bash
# Criar script de backup
nano /root/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
mkdir -p $BACKUP_DIR

docker exec <container-postgres> pg_dump -U licenses_user licenses_db | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

```bash
chmod +x /root/backup-db.sh

# Agendar no cron (diário às 3h)
crontab -e
0 3 * * * /root/backup-db.sh
```

### 2. Backup dos Volumes Docker
```bash
docker run --rm -v postgres_data:/data -v /backups:/backup alpine tar czf /backup/postgres_data_$(date +%Y%m%d).tar.gz -C /data .
```

---

## ✅ CHECKLIST FINAL

### Infraestrutura
- [ ] VPS configurado
- [ ] Docker instalado
- [ ] PostgreSQL rodando
- [ ] Redis rodando
- [ ] Firewall configurado
- [ ] SSL configurado

### Banco de Dados
- [ ] Database criado
- [ ] Migrations executadas
- [ ] Admin inicial criado
- [ ] Backup configurado

### APIs
- [ ] API Pública rodando (porta 4000)
- [ ] API Admin rodando (porta 4001)
- [ ] Webhook API rodando (porta 4002)
- [ ] Health checks OK
- [ ] Logs funcionando

### Segurança
- [ ] Chaves RSA geradas
- [ ] JWT secret configurado
- [ ] Senhas fortes
- [ ] HTTPS ativo
- [ ] CORS configurado
- [ ] Rate limiting ativo

### Monitoramento
- [ ] Logs centralizados
- [ ] Backup automático
- [ ] Alertas configurados

---

## 🚀 DEPLOY COMPLETO!

Seu sistema SaaS de licenças está pronto para produção! 🎉

**URLs:**
- API Pública: https://api.seudominio.com
- API Admin: https://admin-api.seudominio.com
- Webhook: https://webhook.seudominio.com

**Próximos passos:**
1. Testar todos os endpoints
2. Configurar webhooks no Mercado Pago
3. Criar planos iniciais
4. Documentar para a equipe
5. Monitorar logs e métricas
