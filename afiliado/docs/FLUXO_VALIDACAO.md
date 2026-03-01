# Fluxo de Validação de Licença

## Visão Geral

O sistema implementa um fluxo de validação em múltiplas camadas para garantir segurança e controle de acesso. Este documento descreve o processo completo de validação de licença.

## Arquitetura de Validação

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│   UI/Login  │ ───> │  Core Engine │ ───> │  PAPI API   │ ───> │  WhatsApp    │
│  (Electron) │      │   (Node.js)  │      │  (Node.js)  │      │   Servers    │
└─────────────┘      └──────────────┘      └─────────────┘      └──────────────┘
                              │
                              │
                              ▼
                     ┌──────────────┐
                     │  VPS Server  │
                     │  (Node.js)   │
                     │   Database   │
                     └──────────────┘
```

## Fluxo Passo a Passo

### 1. Entrada do Usuário (UI)
**Arquivo**: `afiliado/ui/src/pages/LoginPage.tsx`

O usuário fornece:
- `phoneNumber`: Número do WhatsApp (ex: 5511999999999)
- `instanceId`: ID da instância PAPI (padrão: 'default-instance')

```typescript
const response = await licenseService.validate(phoneNumber, instanceId);
```

### 2. Requisição ao Core Engine
**Arquivo**: `afiliado/core/routes/license.js`

O Core Engine recebe a requisição e inicia o processo de validação:

```javascript
POST /api/license/validate
Body: {
  phoneNumber: "5511999999999",
  instanceId: "default-instance"
}
```

### 3. Validação no WhatsApp (PAPI API)
**Arquivo**: `afiliado/core/services/PAPIService.js`

**PASSO 1**: Verifica se o número está registrado no WhatsApp

```javascript
const whatsappCheck = await PAPIService.checkNumber(instanceId, phoneNumber);
```

**Endpoint PAPI**:
```
GET /api/instances/{instanceId}/check-number/{phoneNumber}
```

**Resposta**:
```json
{
  "success": true,
  "exists": true,
  "jid": "5511999999999@s.whatsapp.net"
}
```

**Validações**:
- ✅ Número existe no WhatsApp?
- ✅ Número está ativo?
- ✅ JID válido retornado?

**Erros Possíveis**:
- ❌ "Número não está registrado no WhatsApp"
- ❌ "Verifique se o número está correto e possui WhatsApp ativo"

### 4. Validação no Banco de Dados (VPS)
**Arquivo**: `afiliado/core/services/VPSService.js`

**PASSO 2**: Valida licença no banco de dados

```javascript
const validation = await VPSService.validateLicense(phoneNumber);
```

**Endpoint VPS**:
```
POST /api/validate
Body: {
  phoneNumber: "5511999999999",
  machineId: "abc123...",
  timestamp: 1234567890
}
```

**Validações no VPS** (`afiliado/vps/server.js`):

#### 4.1. Licença Existe?
```javascript
const license = licenses.get(phoneNumber);
if (!license) {
  return { error: 'Número não cadastrado no sistema' };
}
```

#### 4.2. Licença Está Ativa?
```javascript
if (!license.active) {
  return { error: 'Licença inativa' };
}
```

#### 4.3. Licença Não Expirou?
```javascript
if (Date.now() > license.expiresAt) {
  return { error: 'Licença expirada' };
}
```

#### 4.4. Machine Fingerprint Válido?
```javascript
if (license.machineId && license.machineId !== machineId) {
  return { error: 'Dispositivo não autorizado' };
}
```

**Machine Learning / Fingerprint**:
- Usa `node-machine-id` para gerar ID único da máquina
- ID baseado em: CPU, placa-mãe, disco rígido
- Impede uso simultâneo em múltiplos dispositivos
- Primeiro login registra o machine ID
- Logins subsequentes validam contra o ID registrado

### 5. Resposta da VPS
**Arquivo**: `afiliado/vps/server.js`

Se todas as validações passarem:

```json
{
  "success": true,
  "data": {
    "plan": "pro",
    "quota": {
      "total": 999999,
      "used": 0,
      "available": 999999
    },
    "plugins": ["*"],
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresAt": 1234567890
  },
  "signature": "base64_signature..."
}
```

**Assinatura Criptográfica**:
- Algoritmo: RSA-2048 + SHA-256
- Garante integridade da resposta
- Previne adulteração de dados
- Verificada pelo Core Engine

### 6. Geração de Token JWT (Core Engine)
**Arquivo**: `afiliado/core/routes/license.js`

O Core Engine gera um token JWT local:

```javascript
const localToken = jwt.sign({
  phoneNumber,
  plan: validation.plan,
  quota: validation.quota,
  plugins: validation.plugins,
  machineId,
  vpsToken: validation.token,
  validatedAt: Date.now()
}, process.env.JWT_SECRET, { expiresIn: '24h' });
```

### 7. Resposta ao Cliente
**Arquivo**: `afiliado/core/routes/license.js`

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "plan": "pro",
  "quota": {
    "total": 999999,
    "used": 0,
    "available": 999999
  },
  "plugins": ["*"],
  "expiresAt": 1234567890,
  "machineId": "abc123...",
  "message": "Login realizado com sucesso"
}
```

### 8. Armazenamento no Cliente (UI)
**Arquivo**: `afiliado/ui/src/store/authStore.ts`

O token e dados do usuário são armazenados no Zustand:

```typescript
login(response.token, {
  phoneNumber,
  plan: response.plan,
  quota: response.quota,
  plugins: response.plugins,
});
```

## Planos e Permissões

### Planos Disponíveis

| Plano   | Quota Mensal | Plugins                          | Preço    |
|---------|--------------|----------------------------------|----------|
| Free    | 10           | Nenhum                           | R$ 0     |
| Basic   | 100          | auto-responder                   | R$ 29,90 |
| Growth  | 500          | auto-responder, message-scheduler| R$ 79,90 |
| Pro     | Ilimitado    | Todos (*)                        | R$ 199,90|

### Licenças de Teste

```javascript
// Pro - Ilimitado
phoneNumber: '5511999999999'
plan: 'pro'
quota: 999999
plugins: ['*']

// Growth - 500 mensagens
phoneNumber: '5511888888888'
plan: 'growth'
quota: 500
plugins: ['message-scheduler', 'auto-responder']

// Basic - 100 mensagens
phoneNumber: '5511777777777'
plan: 'basic'
quota: 100
plugins: ['auto-responder']
```

## Segurança Implementada

### 1. Validação em Múltiplas Camadas
- ✅ WhatsApp (número existe e está ativo)
- ✅ Banco de dados (licença cadastrada)
- ✅ Status (licença ativa)
- ✅ Expiração (dentro do prazo)
- ✅ Machine fingerprint (dispositivo autorizado)

### 2. Criptografia
- ✅ RSA-2048 para assinatura de respostas
- ✅ SHA-256 para hash de dados
- ✅ JWT para tokens de sessão
- ✅ HTTPS em produção (recomendado)

### 3. Rate Limiting
- ✅ 100 requisições por 15 minutos
- ✅ Proteção contra brute force
- ✅ Implementado no Core Engine

### 4. Machine Fingerprint
- ✅ ID único por dispositivo
- ✅ Impede uso simultâneo
- ✅ Baseado em hardware
- ✅ Persistente entre reinicializações

## Tratamento de Erros

### Erros de WhatsApp
```json
{
  "success": false,
  "error": "Número não está registrado no WhatsApp",
  "details": "Verifique se o número está correto e possui WhatsApp ativo"
}
```

### Erros de Licença
```json
{
  "success": false,
  "error": "Número não cadastrado no sistema",
  "details": "Este número não possui uma licença ativa. Entre em contato com o suporte."
}
```

### Erros de Status
```json
{
  "success": false,
  "error": "Licença inativa",
  "details": "Sua licença foi desativada. Entre em contato com o suporte para reativar."
}
```

### Erros de Expiração
```json
{
  "success": false,
  "error": "Licença expirada",
  "details": "Sua licença expirou em 01/03/2026. Renove sua assinatura para continuar usando."
}
```

### Erros de Dispositivo
```json
{
  "success": false,
  "error": "Dispositivo não autorizado",
  "details": "Esta licença está vinculada a outro dispositivo. Contate o suporte para transferir."
}
```

### Modo Offline
```json
{
  "success": false,
  "offline": true,
  "error": "Servidor offline - modo limitado ativado"
}
```

## Logs de Validação

O sistema gera logs detalhados em cada etapa:

```
[License] Iniciando validação para: 5511999999999
[License] Verificando número no WhatsApp...
[License] ✓ Número verificado no WhatsApp: 5511999999999@s.whatsapp.net
[License] Validando licença no banco de dados...

[VPS] ========================================
[VPS] Nova requisição de validação
[VPS] Número: 5511999999999
[VPS] Machine ID: abc123...
[VPS] ========================================

[VPS] ✓ Licença encontrada no banco de dados
[VPS] ✓ Licença está ativa
[VPS] ✓ Licença válida (30 dias restantes)
[VPS] ✓ Machine ID registrado pela primeira vez: abc123...
[VPS] ✓ Validação completa
[VPS] Plano: PRO
[VPS] Quota disponível: 999999/999999
[VPS] Plugins: *

[License] ✓ Licença válida - Plano: pro
[License] Machine ID: abc123...
[License] ✓ Token JWT gerado com sucesso
[License] Validação completa para 5511999999999
```

## Configuração

### Variáveis de Ambiente

**Core Engine** (`afiliado/.env`):
```env
PORT=3001
NODE_ENV=development
VPS_URL=http://localhost:4000/api
PAPI_URL=http://localhost:3000/api
PAPI_API_KEY=sua-chave-papi-aqui
JWT_SECRET=desenvolvimento-secret-key
```

**VPS Server** (`afiliado/vps/.env`):
```env
VPS_PORT=4000
NODE_ENV=development
JWT_SECRET=desenvolvimento-secret-key
```

## Testando o Sistema

### 1. Iniciar Servidores

```bash
# Terminal 1 - VPS
cd afiliado/vps
npm install
npm start

# Terminal 2 - Core Engine
cd afiliado
npm install
npm start

# Terminal 3 - UI
cd afiliado/ui
npm install
npm run dev
```

### 2. Testar Validação

Acesse `http://localhost:3000` e use uma das licenças de teste:
- 5511999999999 (Pro)
- 5511888888888 (Growth)
- 5511777777777 (Basic)

### 3. Verificar Logs

Observe os logs nos terminais para acompanhar o fluxo de validação.

## Próximos Passos

1. ✅ Implementar validação de WhatsApp via PAPI
2. ✅ Implementar validação de banco de dados
3. ✅ Implementar machine fingerprint
4. ✅ Implementar geração de tokens JWT
5. ⏳ Conectar com PAPI API real
6. ⏳ Implementar banco de dados PostgreSQL
7. ⏳ Deploy em produção
8. ⏳ Implementar renovação automática de licenças
9. ⏳ Implementar painel administrativo

## Suporte

Para dúvidas ou problemas, consulte:
- [API Documentation](./API_DOCUMENTATION.md)
- [Architecture](./ARCHITECTURE.md)
- [Quick Start](./INICIO_RAPIDO.md)
