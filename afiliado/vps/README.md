# VPS License API

API de validação de licenças, controle de quota e gerenciamento de plugins para o sistema Afiliado Pro.

## 🚀 Quick Start

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Gerar chaves RSA
npm run generate-keys

# Iniciar servidor
npm start
```

### Docker Local

```bash
# Build da imagem
docker build -t afiliado-vps:local .

# Executar container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secret \
  afiliado-vps:local
```

### Docker Compose

```bash
# Iniciar stack
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar stack
docker-compose down
```

## 📋 Endpoints

### Health Check
```bash
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-03-01T12:00:00.000Z",
  "version": "1.0.0",
  "uptime": 123.45,
  "memory": {
    "used": 45,
    "total": 128
  }
}
```

### License Status
```bash
GET /api/license/status
```

**Response:**
```json
{
  "status": "active",
  "version": "1.0.0",
  "features": ["validation", "quota", "plugins"]
}
```

### Validate User
```bash
POST /api/v1/validate
Content-Type: application/json

{
  "phone": "5511999999999",
  "fingerprint": "device-fingerprint"
}
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "uuid",
    "phone": "5511999999999",
    "plan": "free",
    "quotaUsed": 0,
    "quotaLimit": 10,
    "activePlugins": [],
    "fingerprint": "device-fingerprint"
  },
  "token": {
    "token": "session-token",
    "expiresAt": 1234567890,
    "signature": "base64-signature"
  },
  "plugins": []
}
```

### Check Quota
```bash
GET /api/v1/quota/:userId
Authorization: Bearer {token}
```

**Response:**
```json
{
  "used": 5,
  "limit": 10,
  "remaining": 5
}
```

### Increment Usage
```bash
POST /api/v1/usage/:userId
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "used": 6,
  "remaining": 4
}
```

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# Obrigatórias
NODE_ENV=production
PORT=3000
JWT_SECRET=your-jwt-secret

# Opcionais
RSA_PRIVATE_KEY=base64-encoded-key
RSA_PUBLIC_KEY=base64-encoded-key
LICENSE_SECRET=your-license-secret
DATABASE_URL=postgresql://...
```

### Gerar Secrets

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# License Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Gerar Chaves RSA

```bash
npm run generate-keys
```

Isso criará:
- `keys/private.pem` - Chave privada (manter segura!)
- `keys/public.pem` - Chave pública (distribuir com Core)

## 🐳 Docker

### Build

```bash
docker build -t afiliado-vps:v1.0.0 .
```

### Run

```bash
docker run -d \
  --name afiliado-vps \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secret \
  --restart unless-stopped \
  afiliado-vps:v1.0.0
```

### Healthcheck

```bash
docker inspect afiliado-vps | grep -A 10 Health
```

## 📦 Deploy para GHCR

### Automático (GitHub Actions)

Push para `main` ou crie uma tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

### Manual

```bash
# Login no GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Build
docker build -t ghcr.io/sxconnect/afiliados:v1.0.0 .

# Push
docker push ghcr.io/sxconnect/afiliados:v1.0.0
```

## 🧪 Testes

### Teste Local

```bash
# Health check
curl http://localhost:3000/health

# License status
curl http://localhost:3000/api/license/status

# Validate user
curl -X POST http://localhost:3000/api/v1/validate \
  -H "Content-Type: application/json" \
  -d '{"phone":"5511999999999","fingerprint":"test-123"}'
```

### Teste em Produção

```bash
# Health check
curl https://api.afiliado.sxconnect.com.br/health

# License status
curl https://api.afiliado.sxconnect.com.br/api/license/status
```

## 📊 Monitoramento

### Logs

```bash
# Docker
docker logs afiliado-vps -f

# Docker Compose
docker-compose logs -f
```

### Métricas

```bash
# Container stats
docker stats afiliado-vps

# Health status
curl http://localhost:3000/health | jq '.memory'
```

## 🔒 Segurança

### Boas Práticas

- ✅ Usar usuário não-root no container
- ✅ Variáveis sensíveis em `.env`
- ✅ Chaves RSA fora do repositório
- ✅ HTTPS obrigatório em produção
- ✅ Rate limiting configurado
- ✅ CORS restrito

### Secrets Management

```bash
# Nunca commitar
.env
keys/*.pem

# Usar Docker secrets ou variáveis de ambiente
docker secret create jwt_secret jwt_secret.txt
```

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs
docker logs afiliado-vps

# Verificar variáveis
docker inspect afiliado-vps | grep -A 20 Env
```

### Healthcheck falhando

```bash
# Testar endpoint
docker exec afiliado-vps wget -O- http://localhost:3000/health

# Ver logs de erro
docker logs afiliado-vps --tail 50
```

### Porta em uso

```bash
# Verificar porta
netstat -tulpn | grep 3000

# Usar porta diferente
docker run -p 3001:3000 ...
```

## 📚 Documentação

- [Guia de Deploy](../docs/ETAPA1_DEPLOY_GUIDE.md)
- [Arquitetura](../docs/ARCHITECTURE.md)
- [API Documentation](../docs/API.md)
- [Security](../docs/SECURITY.md)

## 🤝 Contribuindo

Veja [CONTRIBUTING.md](../CONTRIBUTING.md)

## 📄 Licença

MIT License - veja [LICENSE](../LICENSE)

---

**Versão**: 1.0.0  
**Node.js**: 20+  
**Docker**: 20.10+
