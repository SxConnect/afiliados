# 📖 Documentação da API - Sistema Afiliados

## 🔗 Base URL

```
http://localhost:3001/api
```

## 🔐 Autenticação

Todas as rotas (exceto `/license/validate`) requerem autenticação via JWT Bearer Token.

```http
Authorization: Bearer <seu-token-jwt>
```

---

## 📋 Endpoints

### 1. Licença

#### POST `/license/validate`
Valida licença via número de WhatsApp e retorna token JWT.

**Request:**
```json
{
  "phoneNumber": "5511999999999"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "plan": "pro",
  "quota": {
    "total": 999999,
    "used": 0,
    "available": 999999
  },
  "plugins": ["*"],
  "expiresAt": 1735689600000
}
```

**Response (401):**
```json
{
  "success": false,
  "error": "Licença não encontrada"
}
```

#### GET `/license/status`
Verifica status da licença atual.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "plan": "pro",
  "quota": { "total": 999999, "used": 0 },
  "plugins": ["*"],
  "machineId": "abc123..."
}
```

---

### 2. WhatsApp

#### POST `/whatsapp/instance/create`
Cria nova instância do WhatsApp.

**Request:**
```json
{
  "instanceId": "minha-instancia"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "minha-instancia",
    "status": "CONNECTING"
  }
}
```

#### GET `/whatsapp/instance/:id/qr`
Obtém QR Code para conectar.

**Response (200):**
```json
{
  "success": true,
  "qrImage": "data:image/png;base64,..."
}
```

#### GET `/whatsapp/instance/:id/status`
Verifica status da instância.

**Response (200):**
```json
{
  "success": true,
  "status": "CONNECTED",
  "name": "João Silva",
  "phoneNumber": "5511999999999"
}
```

#### POST `/whatsapp/send/text`
Envia mensagem de texto.

**Request:**
```json
{
  "instanceId": "minha-instancia",
  "jid": "5511999999999@s.whatsapp.net",
  "text": "Olá! Esta é uma mensagem de teste."
}
```

**Response (200):**
```json
{
  "success": true,
  "messageId": "3EB0B430F7A4D8C1E2F3",
  "timestamp": 1703847600
}
```

**Response (403 - Quota esgotada):**
```json
{
  "success": false,
  "error": "Quota esgotada",
  "quota": {
    "total": 100,
    "used": 100,
    "available": 0
  }
}
```

#### POST `/whatsapp/send/image`
Envia imagem.

**Request:**
```json
{
  "instanceId": "minha-instancia",
  "jid": "5511999999999@s.whatsapp.net",
  "url": "https://exemplo.com/imagem.jpg",
  "caption": "Veja esta imagem!"
}
```

#### POST `/whatsapp/send/buttons`
Envia mensagem com botões.

**Request:**
```json
{
  "instanceId": "minha-instancia",
  "jid": "5511999999999@s.whatsapp.net",
  "text": "Escolha uma opção:",
  "buttons": [
    { "type": "reply", "displayText": "Sim", "id": "yes" },
    { "type": "reply", "displayText": "Não", "id": "no" }
  ],
  "footer": "Atendimento automático"
}
```

#### POST `/whatsapp/webhook/configure`
Configura webhook para receber mensagens.

**Request:**
```json
{
  "instanceId": "minha-instancia",
  "webhookUrl": "https://seu-servidor.com/webhook",
  "events": ["messages", "status"]
}
```

#### DELETE `/whatsapp/instance/:id`
Deleta instância.

**Response (200):**
```json
{
  "success": true
}
```

---

### 3. Plugins

#### GET `/plugins`
Lista todos os plugins disponíveis.

**Response (200):**
```json
{
  "success": true,
  "plugins": [
    {
      "id": "message-scheduler",
      "name": "Agendador de Mensagens",
      "version": "1.0.0",
      "description": "Agende mensagens para serem enviadas automaticamente",
      "icon": "📅",
      "enabled": true,
      "locked": false
    },
    {
      "id": "auto-responder",
      "name": "Resposta Automática",
      "version": "1.0.0",
      "description": "Configure respostas automáticas baseadas em palavras-chave",
      "icon": "🤖",
      "enabled": true,
      "locked": false
    }
  ]
}
```

#### POST `/plugins/:id/execute`
Executa ação de um plugin.

**Request (Agendador):**
```json
{
  "action": "schedule",
  "params": {
    "instanceId": "minha-instancia",
    "jid": "5511999999999@s.whatsapp.net",
    "text": "Mensagem agendada",
    "scheduledTime": 1703847600000
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "result": {
    "success": true,
    "scheduleId": "schedule_1703847600_abc123",
    "scheduledTime": 1703847600000,
    "message": "Mensagem agendada com sucesso"
  }
}
```

**Request (Auto-Responder):**
```json
{
  "action": "add-rule",
  "params": {
    "trigger": "oi",
    "response": "Olá! Como posso ajudar?",
    "matchType": "contains"
  }
}
```

---

### 4. Métricas

#### GET `/metrics/quota`
Obtém informações de quota.

**Response (200):**
```json
{
  "success": true,
  "quota": {
    "success": true,
    "total": 999999,
    "used": 150,
    "available": 999849
  }
}
```

#### GET `/metrics/system`
Obtém métricas do sistema.

**Response (200):**
```json
{
  "success": true,
  "metrics": {
    "memory": {
      "rss": 150,
      "heapTotal": 64,
      "heapUsed": 45,
      "external": 2
    },
    "uptime": 3600,
    "platform": "win32",
    "nodeVersion": "v20.10.0"
  }
}
```

---

## 🔄 Fluxo Completo de Uso

### 1. Autenticação
```javascript
const response = await fetch('http://localhost:3001/api/license/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phoneNumber: '5511999999999' })
});

const { token } = await response.json();
```

### 2. Criar Instância WhatsApp
```javascript
await fetch('http://localhost:3001/api/whatsapp/instance/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ instanceId: 'minha-instancia' })
});
```

### 3. Obter QR Code
```javascript
const qrResponse = await fetch('http://localhost:3001/api/whatsapp/instance/minha-instancia/qr', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { qrImage } = await qrResponse.json();
// Exibir qrImage no navegador
```

### 4. Enviar Mensagem
```javascript
await fetch('http://localhost:3001/api/whatsapp/send/text', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    instanceId: 'minha-instancia',
    jid: '5511999999999@s.whatsapp.net',
    text: 'Olá!'
  })
});
```

---

## 🛡️ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Sem permissão (quota esgotada ou plugin bloqueado) |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

---

## 📝 Notas Importantes

1. **Quota**: Cada envio de mensagem consome 1 unidade de quota
2. **Plugins**: Apenas plugins do seu plano estão disponíveis
3. **Token**: Tokens JWT expiram em 24 horas
4. **Rate Limiting**: Máximo 100 requisições por 15 minutos
5. **JID Format**: Números devem estar no formato `5511999999999@s.whatsapp.net`

---

## 🔧 Exemplos de Integração

### Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Authorization': `Bearer ${token}` }
});

// Enviar mensagem
await api.post('/whatsapp/send/text', {
  instanceId: 'minha-instancia',
  jid: '5511999999999@s.whatsapp.net',
  text: 'Olá!'
});
```

### Python
```python
import requests

headers = {'Authorization': f'Bearer {token}'}

response = requests.post(
    'http://localhost:3001/api/whatsapp/send/text',
    headers=headers,
    json={
        'instanceId': 'minha-instancia',
        'jid': '5511999999999@s.whatsapp.net',
        'text': 'Olá!'
    }
)
```

### cURL
```bash
curl -X POST http://localhost:3001/api/whatsapp/send/text \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceId": "minha-instancia",
    "jid": "5511999999999@s.whatsapp.net",
    "text": "Olá!"
  }'
```
