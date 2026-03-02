# 🔐 Sistema de Entitlements

Sistema profissional de controle granular de permissões, quotas e acesso a plugins.

---

## 📋 Visão Geral

O sistema de entitlements fornece uma camada centralizada para gerenciar:

- ✅ Permissões por feature
- ✅ Quotas de uso (diária, mensal, anual, lifetime)
- ✅ Acesso a plugins (com trials)
- ✅ Add-ons complementares
- ✅ Overrides administrativos
- ✅ Cache com versionamento

---

## 🏗 Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                  Sua Aplicação                          │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Entitlements Services                      │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ Entitlement      │  │ Usage            │            │
│  │ Resolver         │  │ Service          │            │
│  │ Service          │  │                  │            │
│  └──────────────────┘  └──────────────────┘            │
│  ┌──────────────────┐                                  │
│  │ Plugin           │                                  │
│  │ Registry         │                                  │
│  │ Service          │                                  │
│  └──────────────────┘                                  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  PostgreSQL                             │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ features         │  │ usage_counters   │            │
│  │ plan_features    │  │ entitlements     │            │
│  │ plugin_registry  │  │ plugin_entitlements          │
│  │ subscription_addons │ entitlement_overrides        │
│  └──────────────────┘  └──────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Services

### 1. EntitlementResolverService

**Responsabilidade:** Consolidar todas as permissões de um usuário

**Métodos principais:**
```javascript
const { getInstance } = require('./EntitlementResolverService');
const resolver = getInstance();

// Resolve entitlements completos
const entitlement = await resolver.resolve(licenseId);

// Verifica feature específica
const hasFeature = await resolver.hasFeature(licenseId, 'export_enabled');

// Verifica plugin específico
const hasPlugin = await resolver.hasPlugin(licenseId, 'auto-responder');

// Invalida cache
await resolver.invalidate(licenseId);

// Força recálculo
const fresh = await resolver.refresh(licenseId);
```

**Estrutura do Entitlement:**
```javascript
{
    features: {
        export_enabled: true,
        max_machines: 3,
        monthly_messages: 1000
    },
    plugins: {
        'auto-responder': {
            enabled: true,
            is_trial: false,
            quota: null
        }
    },
    quotas: {
        monthly_messages: {
            limit: 1000,
            used: 250,
            reset_at: '2026-04-01T00:00:00Z'
        }
    },
    limits: {
        max_machines: 3
    }
}
```

### 2. UsageService

**Responsabilidade:** Gerenciar contadores de uso e quotas

**Métodos principais:**
```javascript
const { getInstance } = require('./UsageService');
const usageService = getInstance();

// Incrementar contador (atômico)
const result = await usageService.increment(
    licenseId,
    'monthly_messages',
    1,
    'feature',
    'monthly'
);

// Verificar sem incrementar
const canUse = await usageService.canUse(
    licenseId,
    'monthly_messages',
    1
);

// Status de uso
const status = await usageService.getUsageStatus(licenseId);

// Desbloquear (admin)
await usageService.unblock(counterId, adminId);
```

**Tipos de Contador:**
- `feature` - Quota de feature
- `plugin` - Quota de plugin
- `resource` - Quota de recurso
- `api_call` - Quota de API

**Períodos:**
- `daily` - Diário
- `monthly` - Mensal
- `yearly` - Anual
- `lifetime` - Vitalício

### 3. PluginRegistryService

**Responsabilidade:** Gerenciar registro e acesso a plugins

**Métodos principais:**
```javascript
const { getInstance } = require('./PluginRegistryService');
const pluginRegistry = getInstance();

// Verificar acesso
const access = await pluginRegistry.checkAccess(licenseId, 'auto-responder');

// Listar plugins disponíveis
const plugins = await pluginRegistry.getAvailablePlugins(licenseId);

// Iniciar trial
const trial = await pluginRegistry.startTrial(licenseId, 'auto-responder', 7);

// Conceder acesso
await pluginRegistry.grantAccess(licenseId, 'auto-responder', 'admin_override');

// Revogar acesso
await pluginRegistry.revokeAccess(licenseId, 'auto-responder');
```

---

## 🚀 Uso Rápido

### Exemplo 1: Verificar Permissão

```javascript
const { getInstance: getResolver } = require('./shared/entitlements/EntitlementResolverService');

async function canExportData(licenseId) {
    const resolver = getResolver();
    const hasFeature = await resolver.hasFeature(licenseId, 'export_enabled');
    
    if (!hasFeature) {
        throw new Error('Export feature not available');
    }
    
    return true;
}
```

### Exemplo 2: Consumir Quota

```javascript
const { getInstance: getUsageService } = require('./shared/entitlements/UsageService');

async function sendMessage(licenseId, message) {
    const usageService = getUsageService();
    
    // Verificar se pode usar
    const canUse = await usageService.canUse(licenseId, 'monthly_messages', 1);
    
    if (!canUse.allowed) {
        throw new Error(`Cannot send message: ${canUse.reason}`);
    }
    
    // Enviar mensagem
    await actualSendMessage(message);
    
    // Incrementar contador
    await usageService.increment(licenseId, 'monthly_messages', 1);
}
```

### Exemplo 3: Verificar Plugin

```javascript
const { getInstance: getPluginRegistry } = require('./shared/entitlements/PluginRegistryService');

async function usePlugin(licenseId, pluginKey) {
    const pluginRegistry = getPluginRegistry();
    
    const access = await pluginRegistry.checkAccess(licenseId, pluginKey);
    
    if (!access.has_access) {
        throw new Error(`No access to plugin: ${access.reason}`);
    }
    
    return executePlugin(pluginKey);
}
```

---

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Cache TTL (segundos)
ENTITLEMENT_CACHE_TTL=300

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saas_licenses
DB_USER=postgres
DB_PASSWORD=postgres
```

---

## 📊 Performance

### Cache

- **Storage:** PostgreSQL (tabela `entitlements`)
- **TTL:** 5 minutos (configurável)
- **Versionamento:** Automático
- **Invalidação:** Manual via `invalidate()`

### Operações Atômicas

- **Incremento de contador:** UPDATE atômico com verificação condicional
- **Sem race condition:** Garantido pelo PostgreSQL
- **Transacional:** Todas operações críticas em transação

### Índices Otimizados

8 índices criados para queries críticas:
- Verificação de quotas
- Busca de plugins
- Trials ativos
- Limpeza de dados

---

## 🛠 Manutenção

### Job de Limpeza

Execute diariamente via cron:

```bash
# Executar manualmente
node scripts/run-cleanup-job.js

# Com estatísticas
node scripts/run-cleanup-job.js --stats

# Configurar cron (Linux)
0 3 * * * cd /path/to/vps && node scripts/run-cleanup-job.js
```

**O que limpa:**
- Snapshots antigos (>30 dias inválidos)
- Contadores expirados
- Trials expirados
- Overrides expirados

---

## 📚 Documentação Completa

- **Guia de Uso:** `../../docs/ENTITLEMENTS_USAGE_GUIDE.md`
- **Auditoria Técnica:** `../../../planejamento/RELATORIO_AUDITORIA_FASE2.5.md`
- **Correções Aplicadas:** `../../../planejamento/FASE2.5_CORRECOES_APLICADAS.md`

---

## 🔍 Troubleshooting

### Problema: Quota não está sendo bloqueada

**Solução:** Verificar se o limite está configurado no plano

```sql
SELECT pf.value
FROM plan_features pf
JOIN features f ON pf.feature_id = f.id
WHERE pf.plan_id = 'plan-uuid'
AND f.feature_key = 'monthly_messages';
```

### Problema: Cache não está invalidando

**Solução:** Forçar refresh

```javascript
await resolver.refresh(licenseId);
```

### Problema: Plugin não está disponível

**Solução:** Verificar se plugin está registrado e ativo

```sql
SELECT * FROM plugin_registry
WHERE plugin_key = 'auto-responder'
AND is_active = true
AND deleted_at IS NULL;
```

---

## ✅ Checklist de Integração

- [ ] Importar services necessários
- [ ] Verificar permissões antes de ações críticas
- [ ] Incrementar contadores após uso
- [ ] Invalidar cache quando plano mudar
- [ ] Tratar erros de quota excedida
- [ ] Configurar job de limpeza diário
- [ ] Monitorar uso de quotas
- [ ] Implementar alertas de limite

---

**Versão:** 2.5.1  
**Última atualização:** 01/03/2026

