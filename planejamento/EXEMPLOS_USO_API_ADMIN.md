# 📚 EXEMPLOS DE USO - API ADMIN

## 🔐 Autenticação

### 1. Login
```bash
curl -X POST http://localhost:4001/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "senha123"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "super_admin",
    "two_factor_enabled": false
  }
}
```

### 2. Verificar 2FA (se habilitado)
```bash
curl -X POST http://localhost:4001/admin/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "code": "123456"
  }'
```

---

## 👥 USERS - Gerenciar Usuários

### 1. Listar Usuários
```bash
curl -X GET "http://localhost:4001/admin/users?limit=10&offset=0&status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "users": [
    {
      "id": "uuid",
      "phone": "+5511999999999",
      "email": "user@example.com",
      "name": "João Silva",
      "status": "active",
      "license_count": 2,
      "active_licenses": 1,
      "created_at": "2026-03-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "pages": 10
  }
}
```

### 2. Buscar Usuário
```bash
curl -X GET "http://localhost:4001/admin/users?search=joao" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Criar Usuário
```bash
curl -X POST http://localhost:4001/admin/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+5511999999999",
    "email": "novo@example.com",
    "name": "Novo Usuário",
    "company": "Empresa XYZ",
    "document": "12345678900"
  }'
```

### 4. Atualizar Usuário
```bash
curl -X PUT http://localhost:4001/admin/users/uuid-do-usuario \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nome Atualizado",
    "status": "suspended"
  }'
```

### 5. Deletar Usuário (soft delete)
```bash
curl -X DELETE http://localhost:4001/admin/users/uuid-do-usuario \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 💎 PLANS - Gerenciar Planos

### 1. Listar Planos
```bash
curl -X GET "http://localhost:4001/admin/plans?includeInactive=false" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "plans": [
    {
      "id": "uuid",
      "name": "Plano Premium",
      "slug": "premium",
      "price_monthly": 99.90,
      "price_yearly": 999.00,
      "quota_monthly": 10000,
      "max_machines": 3,
      "features": ["Feature 1", "Feature 2"],
      "is_active": true,
      "license_count": 50,
      "subscription_count": 45
    }
  ]
}
```

### 2. Criar Plano
```bash
curl -X POST http://localhost:4001/admin/plans \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Plano Enterprise",
    "slug": "enterprise",
    "description": "Plano para grandes empresas",
    "price_monthly": 299.90,
    "price_yearly": 2999.00,
    "quota_monthly": 50000,
    "max_machines": 10,
    "features": [
      "Suporte prioritário",
      "API ilimitada",
      "Webhooks customizados"
    ],
    "is_active": true,
    "sort_order": 3
  }'
```

### 3. Atualizar Plano
```bash
curl -X PUT http://localhost:4001/admin/plans/uuid-do-plano \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price_monthly": 349.90,
    "quota_monthly": 100000
  }'
```

### 4. Adicionar Plugin ao Plano
```bash
curl -X POST http://localhost:4001/admin/plans/uuid-do-plano/plugins \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plugin_id": "auto-responder",
    "plugin_name": "Auto Responder",
    "is_enabled": true
  }'
```

### 5. Remover Plugin do Plano
```bash
curl -X DELETE http://localhost:4001/admin/plans/uuid-do-plano/plugins/uuid-do-plugin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔑 LICENSES - Gerenciar Licenças

### 1. Listar Licenças
```bash
curl -X GET "http://localhost:4001/admin/licenses?limit=10&status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "licenses": [
    {
      "id": "uuid",
      "license_key": "ABCD1234-EFGH5678-IJKL9012-MNOP3456",
      "user_phone": "+5511999999999",
      "user_name": "João Silva",
      "plan_name": "Plano Premium",
      "status": "active",
      "expiration_date": "2026-04-01T00:00:00Z",
      "quota_used": 1500,
      "machine_count": 2,
      "created_at": "2026-03-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 200,
    "limit": 10,
    "offset": 0,
    "pages": 20
  }
}
```

### 2. Buscar Licença
```bash
curl -X GET "http://localhost:4001/admin/licenses?search=ABCD1234" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Criar Licença
```bash
curl -X POST http://localhost:4001/admin/licenses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid-do-usuario",
    "plan_id": "uuid-do-plano"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "license": {
    "id": "uuid",
    "license_key": "ABCD1234-EFGH5678-IJKL9012-MNOP3456",
    "status": "active",
    "activation_date": "2026-03-01T10:00:00Z",
    "expiration_date": "2026-04-01T10:00:00Z"
  }
}
```

### 4. Suspender Licença
```bash
curl -X POST http://localhost:4001/admin/licenses/uuid-da-licenca/suspend \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Pagamento atrasado"
  }'
```

### 5. Reativar Licença
```bash
curl -X POST http://localhost:4001/admin/licenses/uuid-da-licenca/reactivate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Resetar Quota
```bash
curl -X POST http://localhost:4001/admin/licenses/uuid-da-licenca/reset-quota \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Detalhes da Licença (com máquinas)
```bash
curl -X GET http://localhost:4001/admin/licenses/uuid-da-licenca \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "license": {
    "id": "uuid",
    "license_key": "ABCD1234-EFGH5678-IJKL9012-MNOP3456",
    "user_phone": "+5511999999999",
    "user_name": "João Silva",
    "plan_name": "Plano Premium",
    "quota_monthly": 10000,
    "quota_used": 1500,
    "max_machines": 3,
    "machines": [
      {
        "id": "uuid",
        "machine_name": "Desktop-João",
        "os_info": "Windows 11",
        "first_seen_at": "2026-03-01T10:00:00Z",
        "last_seen_at": "2026-03-01T15:30:00Z",
        "is_active": true
      }
    ],
    "subscription": {
      "id": "uuid",
      "status": "active",
      "next_billing_date": "2026-04-01T00:00:00Z"
    }
  }
}
```

---

## 💳 SUBSCRIPTIONS - Gerenciar Assinaturas

### 1. Listar Assinaturas
```bash
curl -X GET "http://localhost:4001/admin/subscriptions?status=active&provider=mercadopago" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "subscriptions": [
    {
      "id": "uuid",
      "user_phone": "+5511999999999",
      "user_name": "João Silva",
      "plan_name": "Plano Premium",
      "license_key": "ABCD1234-EFGH5678-IJKL9012-MNOP3456",
      "provider": "mercadopago",
      "external_id": "mp-sub-123456",
      "status": "active",
      "billing_cycle": "monthly",
      "amount": 99.90,
      "currency": "BRL",
      "next_billing_date": "2026-04-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "pages": 3
  }
}
```

### 2. Criar Assinatura Manual
```bash
curl -X POST http://localhost:4001/admin/subscriptions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid-do-usuario",
    "license_id": "uuid-da-licenca",
    "plan_id": "uuid-do-plano",
    "billing_cycle": "monthly",
    "amount": 99.90,
    "currency": "BRL",
    "status": "active"
  }'
```

### 3. Cancelar Assinatura
```bash
curl -X POST http://localhost:4001/admin/subscriptions/uuid-da-assinatura/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Cliente solicitou cancelamento"
  }'
```

### 4. Pausar Assinatura
```bash
curl -X POST http://localhost:4001/admin/subscriptions/uuid-da-assinatura/pause \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Retomar Assinatura
```bash
curl -X POST http://localhost:4001/admin/subscriptions/uuid-da-assinatura/resume \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Estatísticas de Assinaturas
```bash
curl -X GET http://localhost:4001/admin/subscriptions/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "stats": {
    "total_subscriptions": 150,
    "active_subscriptions": 120,
    "cancelled_subscriptions": 20,
    "paused_subscriptions": 10,
    "mercadopago_count": 100,
    "stripe_count": 30,
    "manual_count": 20,
    "monthly_recurring_revenue": 11988.00
  }
}
```

---

## 📊 DASHBOARD - Métricas

### 1. Métricas Gerais
```bash
curl -X GET http://localhost:4001/admin/dashboard/metrics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "metrics": {
    "total_users": 500,
    "active_licenses": 450,
    "active_subscriptions": 420,
    "revenue_30d": 41958.00,
    "unresolved_suspicious": 5,
    "new_users_today": 12,
    "new_licenses_today": 8,
    "revenue_today": 799.20
  }
}
```

### 2. Gráfico de Receita (30 dias)
```bash
curl -X GET http://localhost:4001/admin/dashboard/revenue-chart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Crescimento de Usuários
```bash
curl -X GET http://localhost:4001/admin/dashboard/users-growth \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Distribuição de Planos
```bash
curl -X GET http://localhost:4001/admin/dashboard/plans-distribution \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📝 AUDIT LOGS - Auditoria

### 1. Listar Logs
```bash
curl -X GET "http://localhost:4001/admin/audit-logs?limit=50&actorType=admin&action=create" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "uuid",
      "actor_type": "admin",
      "actor_id": "uuid-do-admin",
      "actor_name": "Admin User",
      "action": "create",
      "resource_type": "licenses",
      "resource_id": "uuid-da-licenca",
      "changes": {
        "created": {
          "license_key": "ABCD1234-EFGH5678-IJKL9012-MNOP3456",
          "status": "active"
        }
      },
      "ip_address": "192.168.1.100",
      "created_at": "2026-03-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 1000,
    "limit": 50,
    "offset": 0,
    "pages": 20
  }
}
```

### 2. Filtrar por Recurso
```bash
curl -X GET "http://localhost:4001/admin/audit-logs?resourceType=users&resourceId=uuid-do-usuario" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Filtrar por Data
```bash
curl -X GET "http://localhost:4001/admin/audit-logs?startDate=2026-03-01&endDate=2026-03-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Estatísticas de Auditoria
```bash
curl -X GET http://localhost:4001/admin/audit-logs/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "stats": {
    "total_logs": 5000,
    "admin_actions": 3000,
    "user_actions": 1500,
    "system_actions": 500,
    "creates": 1000,
    "updates": 2500,
    "deletes": 200,
    "today_logs": 150,
    "week_logs": 800
  }
}
```

---

## 🔐 PERMISSÕES POR ROLE

### super_admin
- ✅ Todas as operações
- ✅ Criar/editar/deletar planos
- ✅ Deletar usuários
- ✅ Gerenciar plugins

### admin
- ✅ Visualizar tudo
- ✅ Criar/editar usuários
- ✅ Criar/editar licenças
- ✅ Gerenciar assinaturas
- ❌ Deletar usuários
- ❌ Criar/editar planos

### support
- ✅ Visualizar tudo
- ✅ Suspender/reativar licenças
- ✅ Resetar quotas
- ❌ Criar/editar/deletar

---

## 🚀 DICAS DE USO

### 1. Sempre use HTTPS em produção
```bash
export API_URL="https://admin-api.seudominio.com"
```

### 2. Armazene o token de forma segura
```javascript
localStorage.setItem('admin_token', token);
```

### 3. Trate erros adequadamente
```javascript
try {
  const response = await fetch('/admin/users', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Erro na requisição');
  }
  
  const data = await response.json();
} catch (error) {
  console.error('Erro:', error);
}
```

### 4. Use paginação para grandes listas
```bash
# Primeira página
curl "http://localhost:4001/admin/users?limit=50&offset=0"

# Segunda página
curl "http://localhost:4001/admin/users?limit=50&offset=50"
```

### 5. Combine filtros para buscas específicas
```bash
curl "http://localhost:4001/admin/licenses?status=active&planId=uuid&search=ABCD"
```

---

## 📚 RECURSOS ADICIONAIS

- [Documentação Completa](./API_ADMIN_COMPLETA.md)
- [Arquitetura](./FASE2_ARQUITETURA.md)
- [Resumo da Implementação](./RESUMO_IMPLEMENTACAO_FASE2.md)
