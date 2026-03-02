# 🏗️ FASE 2 - Arquitetura Completa SaaS

## 📐 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         INFRAESTRUTURA                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │   Traefik    │───▶│  PostgreSQL  │    │    Redis     │     │
│  │  (SSL/LB)    │    │   (Primary)  │    │   (Cache)    │     │
│  └──────┬───────┘    └──────────────┘    └──────────────┘     │
│         │                                                       │
│  ┌──────▼───────────────────────────────────────────────┐     │
│  │              DOCKER NETWORK (afiliados)              │     │
│  │                                                       │     │
│  │  ┌─────────────────┐      ┌─────────────────┐      │     │
│  │  │   API Pública   │      │   API Admin     │      │     │
│  │  │   (Port 4000)   │      │   (Port 4001)   │      │     │
│  │  │                 │      │                 │      │     │
│  │  │ • /auth/*       │      │ • /admin/*      │      │     │
│  │  │ • /license/*    │      │ • Dashboard     │      │     │
│  │  │ • /usage/*      │      │ • CRUD          │      │     │
│  │  │ • /plugin/*     │      │ • Metrics       │      │     │
│  │  └─────────────────┘      └─────────────────┘      │     │
│  │                                                       │     │
│  │  ┌─────────────────┐      ┌─────────────────┐      │     │
│  │  │  Webhook API    │      │  Admin Panel    │      │     │
│  │  │   (Port 4002)   │      │   (Port 3000)   │      │     │
│  │  │                 │      │                 │      │     │
│  │  │ • Mercado Pago  │      │ • Next.js       │      │     │
│  │  │ • Stripe        │      │ • React         │      │     │
│  │  └─────────────────┘      └─────────────────┘      │     │
│  └───────────────────────────────────────────────────┘     │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      CLIENTES EXTERNOS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │ Desktop App  │    │ Mercado Pago │    │    Admin     │     │
│  │   (Core)     │───▶│  (Webhook)   │───▶│   Browser    │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## 🎯 Separação de Responsabilidades

### 1. API Pública (Port 4000)
**Domínio:** `api.afiliados.sxconnect.com.br`

**Responsabilidades:**
- Autenticação de clientes
- Validação de licenças
- Verificação de quotas
- Validação de plugins
- Report de uso

**Segurança:**
- Rate limit: 100 req/15min por IP
- JWT RS256 (15 min expiration)
- Machine fingerprint obrigatório
- HMAC signature validation

**Endpoints:**
```
POST   /auth/validate          - Validar licença e obter token
GET    /auth/refresh           - Renovar token
POST   /license/status         - Status da licença
POST   /usage/report           - Reportar uso
POST   /plugin/check           - Verificar plugin
GET    /health                 - Health check
```

### 2. API Admin (Port 4001)
**Domínio:** `admin-api.afiliados.sxconnect.com.br`

**Responsabilidades:**
- CRUD de usuários
- CRUD de planos
- CRUD de licenças
- CRUD de plugins
- Dashboard e métricas
- Logs de auditoria
- Gestão de bloqueios

**Segurança:**
- JWT separado (admin)
- 2FA obrigatório
- IP whitelist opcional
- Rate limit: 1000 req/hour
- Audit log completo

**Endpoints:**
```
# Auth
POST   /admin/auth/login       - Login admin
POST   /admin/auth/2fa         - Verificar 2FA
POST   /admin/auth/refresh     - Renovar token

# Users
GET    /admin/users            - Listar usuários
GET    /admin/users/:id        - Obter usuário
POST   /admin/users            - Criar usuário
PUT    /admin/users/:id        - Atualizar usuário
DELETE /admin/users/:id        - Deletar usuário (soft)

# Plans
GET    /admin/plans            - Listar planos
POST   /admin/plans            - Criar plano
PUT    /admin/plans/:id        - Atualizar plano
DELETE /admin/plans/:id        - Deletar plano

# Licenses
GET    /admin/licenses         - Listar licenças
GET    /admin/licenses/:id     - Obter licença
POST   /admin/licenses         - Criar licença
PUT    /admin/licenses/:id     - Atualizar licença
DELETE /admin/licenses/:id     - Revogar licença
POST   /admin/licenses/:id/block   - Bloquear licença
POST   /admin/licenses/:id/unblock - Desbloquear licença

# Subscriptions
GET    /admin/subscriptions    - Listar assinaturas
GET    /admin/subscriptions/:id - Obter assinatura
PUT    /admin/subscriptions/:id - Atualizar assinatura
POST   /admin/subscriptions/:id/cancel - Cancelar assinatura

# Dashboard
GET    /admin/dashboard/metrics - Métricas gerais
GET    /admin/dashboard/mrr     - MRR
GET    /admin/dashboard/churn   - Taxa de cancelamento
GET    /admin/dashboard/active  - Usuários ativos

# Audit
GET    /admin/audit/logs       - Logs de auditoria
GET    /admin/audit/suspicious - Atividades suspeitas
```

### 3. Webhook API (Port 4002)
**Domínio:** `webhook.afiliados.sxconnect.com.br`

**Responsabilidades:**
- Receber webhooks de pagamento
- Validar assinaturas HMAC
- Processar eventos de pagamento
- Atualizar status de assinaturas

**Segurança:**
- HMAC signature validation
- IP whitelist (Mercado Pago/Stripe)
- Idempotency keys
- Retry logic

**Endpoints:**
```
POST   /webhook/mercadopago    - Webhook Mercado Pago
POST   /webhook/stripe         - Webhook Stripe
GET    /webhook/health         - Health check
```

### 4. Admin Panel (Port 3000)
**Domínio:** `admin.afiliados.sxconnect.com.br`

**Tecnologia:** Next.js 14 + React + TailwindCSS

**Páginas:**
```
/login                  - Login admin
/dashboard              - Dashboard principal
/users                  - Gerenciar usuários
/users/:id              - Detalhes do usuário
/plans                  - Gerenciar planos
/licenses               - Gerenciar licenças
/subscriptions          - Gerenciar assinaturas
/plugins                - Gerenciar plugins
/audit                  - Logs de auditoria
/settings               - Configurações
/profile                - Perfil admin
```

## 🔐 Modelo de Segurança

### Criptografia

**RSA-2048 para Assinatura:**
```javascript
// Gerar par de chaves
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

**JWT RS256:**
```javascript
{
  "alg": "RS256",
  "typ": "JWT"
}
{
  "sub": "user_uuid",
  "fingerprint": "machine_hash",
  "plan": "pro",
  "exp": 1234567890,
  "iat": 1234567890
}
```

**Machine Fingerprint:**
```javascript
// Componentes do fingerprint
const fingerprint = hash(
  machineId +
  cpuId +
  diskSerial +
  macAddress +
  salt
);
```

### Anti-Pirataria

**Estratégias:**
1. Limite de máquinas por plano
2. Detecção de fingerprint duplicado
3. Bloqueio automático por comportamento suspeito
4. Rate limit por IP + fingerprint
5. Auditoria completa de login
6. Revogação de token imediata
7. Verificação periódica obrigatória (a cada 24h)
8. Expiração offline controlada (24h máximo)

**Detecção de Anomalias:**
```javascript
// Comportamentos suspeitos
- Múltiplos IPs em curto período
- Fingerprint mudando frequentemente
- Uso excessivo de quota
- Tentativas de bypass
- Múltiplas máquinas simultâneas
```

## 💳 Sistema de Pagamentos

### Mercado Pago (Principal)

**Fluxo de Assinatura:**
```
1. Cliente escolhe plano no site/app
2. Frontend chama API Admin: POST /admin/subscriptions/create
3. API cria subscription no Mercado Pago
4. Mercado Pago retorna link de pagamento
5. Cliente paga
6. Mercado Pago envia webhook
7. Webhook API valida e processa
8. Atualiza license.status = 'active'
9. Atualiza expiration_date
10. Envia email de confirmação
```

**Webhook Events:**
```javascript
// Eventos processados
- payment.created
- payment.updated
- subscription.created
- subscription.updated
- subscription.cancelled
- subscription.paused
```

**Tolerância de Atraso:**
- 3 dias de grace period
- Notificações automáticas
- Bloqueio suave (warning)
- Bloqueio definitivo após grace period

### Stripe (Futuro)

Arquitetura preparada para adicionar Stripe:
```javascript
// Adapter pattern
interface PaymentProvider {
  createSubscription()
  cancelSubscription()
  updateSubscription()
  processWebhook()
}

class MercadoPagoProvider implements PaymentProvider {}
class StripeProvider implements PaymentProvider {}
```

## 📊 Escalabilidade para 100K Usuários

### Estratégias

**1. Stateless API**
- Sem sessões em memória
- JWT para autenticação
- Redis para cache compartilhado

**2. Cache Strategy**
```javascript
// Cache layers
L1: Redis (hot data)
  - User sessions
  - License status
  - Plan details
  
L2: PostgreSQL (warm data)
  - Full user data
  - Historical data
```

**3. Database Optimization**
```sql
-- Índices estratégicos
CREATE INDEX idx_licenses_user_id ON licenses(user_id);
CREATE INDEX idx_licenses_status ON licenses(status);
CREATE INDEX idx_machines_fingerprint ON machines(fingerprint_hash);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX idx_payments_status ON payments(status);

-- Particionamento futuro
-- usage_logs por mês
-- audit_logs por mês
```

**4. Separação de Serviços (Futuro)**
```
Auth Service     - Autenticação
Billing Service  - Pagamentos
Usage Service    - Tracking de uso
License Service  - Validação
Admin Service    - Painel admin
```

**5. Read Replicas**
```
Primary (Write)  - Todas as escritas
Replica 1 (Read) - API Pública
Replica 2 (Read) - Admin Panel
```

## 🗂️ Estrutura de Pastas

```
afiliado/
├── vps/
│   ├── api-public/          # API Pública (Port 4000)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── middlewares/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── utils/
│   │   │   └── server.js
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── api-admin/           # API Admin (Port 4001)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── middlewares/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── utils/
│   │   │   └── server.js
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── api-webhook/         # Webhook API (Port 4002)
│   │   ├── src/
│   │   │   ├── providers/
│   │   │   │   ├── mercadopago.js
│   │   │   │   └── stripe.js
│   │   │   ├── handlers/
│   │   │   ├── validators/
│   │   │   └── server.js
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── admin-panel/         # Admin Panel (Port 3000)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   ├── public/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── init.sql
│   │
│   ├── shared/              # Código compartilhado
│   │   ├── crypto/
│   │   ├── validators/
│   │   └── types/
│   │
│   └── docker-compose.production.yml
│
└── docs/
    └── fase2/
```

## 🚀 Próximos Passos

1. ✅ Criar estrutura do banco de dados
2. ✅ Implementar migrations
3. ✅ Criar API Pública
4. ✅ Criar API Admin
5. ✅ Criar Webhook API
6. ✅ Criar Admin Panel
7. ✅ Integrar Mercado Pago
8. ✅ Implementar anti-pirataria
9. ✅ Testes de carga
10. ✅ Deploy

Vou começar pela implementação do banco de dados e migrations.
