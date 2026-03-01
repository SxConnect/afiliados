# Afiliado License API - VPS

API de validação de licenças para o Sistema Profissional de Escala para Afiliados.

## Funcionalidades

- ✅ Validação de licença por WhatsApp
- ✅ Controle de quota de uso
- ✅ Validação de plugins
- ✅ Emissão de tokens JWT
- ✅ Assinaturas criptográficas HMAC
- ✅ Rate limiting
- ✅ Healthcheck
- ✅ Graceful shutdown

## Endpoints

### GET /health
Healthcheck do serviço

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "uptime": 123.45
}
```

### POST /api/validate-license
Valida licença e retorna informações do plano

**Request:**
```json
{
  "whatsapp": "5511999999999",
  "fingerprint": "abc123...",
  "signature": "optional-hmac-signature"
}
```

**Response:**
```json
{
  "plan": "free",
  "quota": 10,
  "quotaUsed": 0,
  "plugins": [],
  "token": "jwt-token...",
  "signature": "hmac-signature"
}
```

### POST /api/check-quota
Verifica quota disponível

**Request:**
```json
{
  "whatsapp": "5511999999999",
  "token": "jwt-token..."
}
```

**Response:**
```json
{
  "quota": 10,
  "used": 5,
  "available": 5,
  "canGenerate": true,
  "signature": "hmac-signature"
}
```

### POST /api/consume-quota
Consome quota de uso

**Request:**
```json
{
  "whatsapp": "5511999999999",
  "token": "jwt-token...",
  "amount": 1
}
```

**Response:**
```json
{
  "success": true,
  "quotaUsed": 6,
  "quotaRemaining": 4,
  "signature": "hmac-signature"
}
```

### POST /api/validate-plugin
Valida se plugin está autorizado

**Request:**
```json
{
  "whatsapp": "5511999999999",
  "token": "jwt-token...",
  "pluginId": "plugin-advanced-metrics"
}
```

**Response:**
```json
{
  "pluginId": "plugin-advanced-metrics",
  "authorized": false,
  "signature": "hmac-signature"
}
```

## Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=your-jwt-secret
LICENSE_SECRET=your-license-secret
PASTORINI_API_KEY=your-api-key
PASTORINI_INSTANCE_ID=your-instance-id
```

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Rodar em produção
npm start
```

## Deploy com Docker

```bash
# Build da imagem
docker build -t afiliado-license-api .

# Rodar container
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name license-api \
  afiliado-license-api
```

## Deploy com Portainer

1. Acesse Portainer
2. Vá em Stacks > Add Stack
3. Cole o conteúdo de `docker-compose.yml`
4. Configure as variáveis de ambiente
5. Deploy

## Testes

```bash
# Testar healthcheck
curl http://localhost:3000/health

# Testar validação de licença
curl -X POST http://localhost:3000/api/validate-license \
  -H "Content-Type: application/json" \
  -d '{"whatsapp":"5511999999999","fingerprint":"test123"}'
```

## Segurança

- ✅ Rate limiting (100 req/15min por IP)
- ✅ JWT com expiração de 24h
- ✅ Assinaturas HMAC em todas as respostas
- ✅ Validação de fingerprint
- ✅ Variáveis sensíveis via environment
- ✅ Logs estruturados
- ✅ Graceful shutdown

## Arquitetura

```
┌─────────────┐
│   Client    │
│  (Desktop)  │
└──────┬──────┘
       │
       │ HTTPS
       ▼
┌─────────────┐
│   Traefik   │
│   (Proxy)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ License API │
│  (Node.js)  │
└─────────────┘
```

## Monitoramento

- Healthcheck: `/health`
- Logs: JSON format com max 10MB/3 arquivos
- Métricas: Via Traefik dashboard

## Suporte

Para dúvidas ou problemas, consulte a documentação completa em `/docs`.
