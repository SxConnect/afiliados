# API Documentation

## Core Engine API

Base URL: `http://localhost:<dynamic-port>/api/v1`

### Authentication

Todas as rotas (exceto `/login`) requerem header de autenticação:

```
Authorization: Bearer <token>
```

---

## Endpoints

### POST /login

Autenticar usuário e obter token de sessão.

**Request:**
```json
{
  "phone": "+5511999999999"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "phone": "+5511999999999",
    "plan": "base",
    "quotaUsed": 10,
    "quotaLimit": 100,
    "activePlugins": ["plugin-id"],
    "fingerprint": "sha256-hash"
  },
  "plugins": [
    {
      "id": "plugin-id",
      "name": "Plugin Name",
      "version": "1.0.0",
      "enabled": true,
      "requiresPlan": "base"
    }
  ],
  "token": "hex-token"
}
```

**Status Codes:**
- `200` - Sucesso
- `400` - Dados inválidos
- `401` - Não autorizado

---

### GET /status

Verificar status do Core Engine.

**Response:**
```json
{
  "status": "active",
  "core": "running"
}
```

---

### GET /quota

Verificar quota disponível do usuário.

**Response:**
```json
{
  "used": 10,
  "limit": 100,
  "remaining": 90
}
```

**Status Codes:**
- `200` - Sucesso
- `401` - Não autorizado
- `500` - Erro interno

---

### GET /plugins

Listar plugins disponíveis.

**Response:**
```json
{
  "plugins": [
    {
      "id": "plugin-id",
      "name": "Plugin Name",
      "version": "1.0.0",
      "enabled": true,
      "requiresPlan": "base"
    }
  ]
}
```

---

### POST /validate-action

Validar se uma ação pode ser executada.

**Request:**
```json
{
  "action": "generate_video"
}
```

**Response:**
```json
{
  "authorized": true,
  "actionID": "uuid"
}
```

**Status Codes:**
- `200` - Autorizado
- `403` - Quota excedida ou não autorizado

---

## VPS API

Base URL: `https://api.afiliado.com/api/v1`

### POST /validate

Validar usuário e obter token assinado.

**Request:**
```json
{
  "phone": "+5511999999999",
  "fingerprint": "sha256-hash"
}
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "uuid",
    "phone": "+5511999999999",
    "plan": "base",
    "quotaUsed": 10,
    "quotaLimit": 100,
    "activePlugins": ["plugin-id"],
    "fingerprint": "sha256-hash"
  },
  "token": {
    "token": "hex-token",
    "expiresAt": 1234567890,
    "signature": "base64-signature"
  },
  "plugins": []
}
```

---

### GET /quota/:userId

Verificar quota de um usuário.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "used": 10,
  "limit": 100,
  "remaining": 90
}
```

---

### POST /usage/:userId

Incrementar uso de quota.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "used": 11,
  "remaining": 89
}
```

**Status Codes:**
- `200` - Sucesso
- `403` - Quota excedida

---

## Error Responses

Todas as APIs retornam erros no formato:

```json
{
  "error": "Mensagem de erro descritiva"
}
```

### Status Codes Comuns

- `200` - OK
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

### VPS
- 100 requisições por 15 minutos por IP
- Header de resposta: `X-RateLimit-Remaining`

### Core
- Sem rate limit (local)

---

## Webhooks (Futuro)

### Payment Success
```json
{
  "event": "payment.success",
  "userId": "uuid",
  "plan": "growth",
  "amount": 297.00,
  "timestamp": 1234567890
}
```

### Quota Exceeded
```json
{
  "event": "quota.exceeded",
  "userId": "uuid",
  "used": 100,
  "limit": 100,
  "timestamp": 1234567890
}
```

---

## SDK (Futuro)

### JavaScript/TypeScript
```typescript
import { AfiliadoClient } from '@afiliado/sdk';

const client = new AfiliadoClient({
  apiKey: 'your-api-key'
});

const user = await client.auth.login('+5511999999999');
const quota = await client.quota.get();
```

### Go
```go
import "github.com/afiliado/sdk-go"

client := afiliado.NewClient("your-api-key")
user, err := client.Auth.Login("+5511999999999")
quota, err := client.Quota.Get()
```
