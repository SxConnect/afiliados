# 🚀 Quick Start - Produção 10K Usuários

## ⚡ Início Rápido

### 1. Instalar Dependências

```bash
cd afiliado/vps
npm install
```

### 2. Configurar PostgreSQL

```bash
# Criar banco de dados
createdb afiliados_vps_licenses

# Criar usuário
createuser -P afiliados_vps_user
# Senha: [DEFINIR SENHA FORTE]

# Dar permissões
psql -c "GRANT ALL PRIVILEGES ON DATABASE afiliados_vps_licenses TO afiliados_vps_user;"
```

### 3. Configurar Redis

```bash
# Instalar Redis (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install redis-server

# Configurar
sudo nano /etc/redis/redis.conf

# Adicionar/Modificar:
maxmemory 512mb
maxmemory-policy allkeys-lru

# Reiniciar
sudo systemctl restart redis
sudo systemctl enable redis
```

### 4. Configurar Variáveis de Ambiente

```bash
# Copiar template
cp .env.production.template .env.production

# Editar
nano .env.production

# Gerar secrets
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # LICENSE_SECRET
```

### 5. Executar Migrações

```bash
npm run migrate
```

### 6. Iniciar Aplicação

```bash
# Modo produção com cluster
npm run start:cluster

# Ou com PM2 (recomendado)
npm install -g pm2
pm2 start server-production.js --name "afiliado-api" -i 2
pm2 save
pm2 startup
```

### 7. Validar

```bash
# Health check
curl http://localhost:3000/health

# Deve retornar:
# {
#   "status": "ok",
#   "database": { "connected": true },
#   "cache": { "connected": true }
# }
```

---

## 🧪 Executar Testes de Carga

```bash
cd load-tests
node simple-load-test.js
```

---

## 📋 Checklist Completo

Veja: `CHECKLIST_VALIDACAO_10K.md`

---

## 📚 Documentação Completa

Veja: `../planejamento/ARQUITETURA_10K_IMPLEMENTADA.md`

---

## 🆘 Troubleshooting

### PostgreSQL não conecta
```bash
# Verificar se está rodando
sudo systemctl status postgresql

# Verificar conexão
psql -U afiliados_vps_user -d afiliados_vps_licenses -c "SELECT 1;"
```

### Redis não conecta
```bash
# Verificar se está rodando
sudo systemctl status redis

# Testar conexão
redis-cli ping
```

### Migrações falham
```bash
# Verificar permissões
psql -U afiliados_vps_user -d afiliados_vps_licenses -c "\du"

# Re-executar
npm run migrate
```

---

**Pronto para produção! 🚀**
