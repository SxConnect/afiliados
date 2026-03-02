# 📘 Guia de Uso do Sistema de Entitlements

**Versão:** 2.5.1  
**Data:** 01/03/2026  
**Status:** Produção

---

## 🎯 Visão Geral

O sistema de entitlements fornece controle granular de permissões, quotas e acesso a plugins. Este guia mostra como usar os services diretamente (sem API HTTP intermediária).

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
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ Plugin           │  │ Cleanup          │            │
│  │ Registry         │  │ Job              │            │
│  │ Service          │  │                  │            │
│  └──────────────────┘  └──────────────────┘            │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  PostgreSQL                             │
└─────────────────────────────────────────────────────────┘
```

**Vantagens desta abordagem:**
- ✅ Sem latência de HTTP call
- ✅ Sem ponto de falha adicional
- ✅ Mais simples de debugar
- ✅ Menos complexidade operacional
- ✅ Transações diretas no banco

---

## 📦 Services Disponíveis

### 1. EntitlementResolverService

Resolve e consolida todas as permissões de um usuário.

**Localização:** `shared/entitlements/EntitlementResolverService.js`

**Métodos principais:**
- `resolve(licenseId)` - Resolve entitlements completos
- `hasFeature(licenseId, featureKey)` - Verifica se tem feature
- `hasPlugin(licenseId, pluginKey)` - Verifica se tem plugin
- `invalidate(licenseId)` - Invalida cache
- `refresh(licenseId)` - Força recálculo

### 2. UsageService

Gerencia contadores de uso e quotas.

**Localização:** `shared/entitlements/UsageService.js`

**Métodos principais:**
- `increment(licenseId, counterKey, amount)` - Incrementa contador
- `canUse(licenseId, counterKey, amount)` - Verifica sem incrementar
- `getUsageStatus(licenseId)` - Status de uso
- `unblock(counterId, adminId)` - Desbloqueia (admin)

### 3. PluginRegistryService

Gerencia registro e acesso a plugins.

**Localização:** `shared/entitlements/PluginRegistryService.js`

**Métodos principais:**
- `checkAccess(licenseId, pluginKey)` - Verifica acesso
- `getAvailablePlugins(licenseId)` - Lista plugins disponíveis
- `startTrial(licenseId, pluginKey, days)` - Inicia trial
- `grantAccess(licenseId, pluginKey, grantedBy)` - Concede acesso

---

## 🚀 Exemplos de Uso

### Exemplo 1: Verificar Permissões Completas

```javascript
const { getInstance: getResolver } = require('./shared/entitlements/EntitlementResolverService');

async function checkUserPermissions(licenseId) {
    const resolver = getResolver();
    
    // Resolve todas as permissões
    const entitlement = await resolver.resolve(licenseId);
    
    console.log('Features:', entitlement.features);
    console.log('Plugins:', entitlement.plugins);
    console.log('Quotas:', entitlement.quotas);
    console.log('Limits:', entitlement.limits);
    
    return entitlement;
}
```

### Exemplo 2: Verificar Feature Específica

```javascript
const { getInstance: getResolver } = require('./shared/entitlements/EntitlementResolverService');

async function canExportData(licenseId) {
    const resolver = getResolver();
    
    const hasFeature = await resolver.hasFeature(licenseId, 'export_enabled');
    
    if (!hasFeature) {
        throw new Error('Export feature not available in your plan');
    }
    
    return true;
}
```

### Exemplo 3: Verificar e Incrementar Quota

```javascript
const { getInstance: getUsageService } = require('./shared/entitlements/UsageService');

async function sendMessage(licenseId, message) {
    const usageService = getUsageService();
    
    // Verificar se pode usar (sem incrementar)
    const canUse = await usageService.canUse(
        licenseId,
        'monthly_messages',
        1,
        'feature',
        'monthly'
    );
    
    if (!canUse.allowed) {
        throw new Error(`Cannot send message: ${canUse.reason}`);
    }
    
    // Enviar mensagem
    await actualSendMessage(message);
    
    // Incrementar contador
    const result = await usageService.increment(
        licenseId,
        'monthly_messages',
        1,
        'feature',
        'monthly'
    );
    
    if (result.blocked) {
        console.warn('Quota limit reached after this message');
    }
    
    return {
        success: true,
        remaining: result.remaining
    };
}
```

### Exemplo 4: Verificar Acesso a Plugin

```javascript
const { getInstance: getPluginRegistry } = require('./shared/entitlements/PluginRegistryService');

async function usePlugin(licenseId, pluginKey) {
    const pluginRegistry = getPluginRegistry();
    
    // Verificar acesso
    const access = await pluginRegistry.checkAccess(licenseId, pluginKey);
    
    if (!access.has_access) {
        throw new Error(`No access to plugin: ${access.reason}`);
    }
    
    if (access.is_trial && access.trial_ends_at) {
        console.warn(`Trial ends at: ${access.trial_ends_at}`);
    }
    
    // Usar plugin
    return executePlugin(pluginKey);
}
```

### Exemplo 5: Iniciar Trial de Plugin

```javascript
const { getInstance: getPluginRegistry } = require('./shared/entitlements/PluginRegistryService');

async function startPluginTrial(licenseId, pluginKey) {
    const pluginRegistry = getPluginRegistry();
    
    // Iniciar trial de 7 dias
    const trial = await pluginRegistry.startTrial(licenseId, pluginKey, 7);
    
    return {
        plugin: trial.plugin_key,
        trial_ends_at: trial.trial_ends_at,
        message: 'Trial started successfully'
    };
}
```

### Exemplo 6: Middleware de Verificação

```javascript
const { getInstance: getResolver } = require('./shared/entitlements/EntitlementResolverService');

// Middleware Express para verificar feature
function requireFeature(featureKey) {
    return async (req, res, next) => {
        try {
            const licenseId = req.user.licenseId; // Do seu sistema de auth
            const resolver = getResolver();
            
            const hasFeature = await resolver.hasFeature(licenseId, featureKey);
            
            if (!hasFeature) {
                return res.status(403).json({
                    error: 'Feature not available',
                    feature: featureKey,
                    upgrade_url: '/plans'
                });
            }
            
            next();
        } catch (error) {
            next(error);
        }
    };
}

// Uso
app.post('/api/export', requireFeature('export_enabled'), async (req, res) => {
    // Lógica de export
});
```

### Exemplo 7: Verificar Múltiplas Permissões

```javascript
const { getInstance: getResolver } = require('./shared/entitlements/EntitlementResolverService');

async function checkMultiplePermissions(licenseId, requiredFeatures) {
    const resolver = getResolver();
    
    // Resolve uma vez
    const entitlement = await resolver.resolve(licenseId);
    
    // Verifica múltiplas features
    const permissions = {};
    for (const feature of requiredFeatures) {
        permissions[feature] = entitlement.features[feature] || false;
    }
    
    return permissions;
}

// Uso
const permissions = await checkMultiplePermissions(licenseId, [
    'export_enabled',
    'api_access',
    'advanced_analytics'
]);

console.log(permissions);
// { export_enabled: true, api_access: true, advanced_analytics: false }
```

---

## ⚡ Performance e Cache

### Cache Automático

O `EntitlementResolverService` implementa cache automático:

- **TTL padrão:** 5 minutos
- **Storage:** PostgreSQL (tabela `entitlements`)
- **Versionamento:** Automático
- **Invalidação:** Manual via `invalidate()`

### Quando Invalidar Cache

```javascript
const { getInstance: getResolver } = require('./shared/entitlements/EntitlementResolverService');

// Invalidar quando:
// 1. Plano do usuário mudar
// 2. Add-on for adicionado/removido
// 3. Override administrativo for aplicado
// 4. Trial expirar

async function changePlan(userId, newPlanId) {
    // Mudar plano
    await updateUserPlan(userId, newPlanId);
    
    // Invalidar cache
    const resolver = getResolver();
    const licenses = await getUserLicenses(userId);
    
    for (const license of licenses) {
        await resolver.invalidate(license.id);
    }
}
```

### Refresh vs Invalidate

```javascript
// invalidate() - marca como inválido, próxima chamada recalcula
await resolver.invalidate(licenseId);

// refresh() - força recálculo imediato
const fresh = await resolver.refresh(licenseId);
```

---

## 🔧 Integração com APIs Existentes

### API Pública (Port 4000)

```javascript
// routes/validate.js
const { getInstance: getResolver } = require('../../shared/entitlements/EntitlementResolverService');

router.post('/validate', async (req, res) => {
    const { license_key } = req.body;
    
    // Buscar licença
    const license = await findLicenseByKey(license_key);
    
    // Resolver entitlements
    const resolver = getResolver();
    const entitlement = await resolver.resolve(license.id);
    
    res.json({
        valid: true,
        license: license,
        entitlements: entitlement
    });
});
```

### API Admin (Port 4001)

```javascript
// routes/admin/entitlements.js
const { getInstance: getResolver } = require('../../shared/entitlements/EntitlementResolverService');
const { getInstance: getUsageService } = require('../../shared/entitlements/UsageService');

// Buscar entitlements de um usuário
router.get('/users/:userId/entitlements', async (req, res) => {
    const resolver = getResolver();
    const licenses = await getUserLicenses(req.params.userId);
    
    const entitlements = await Promise.all(
        licenses.map(l => resolver.resolve(l.id))
    );
    
    res.json(entitlements);
});

// Desbloquear quota
router.post('/usage/:counterId/unblock', async (req, res) => {
    const usageService = getUsageService();
    const adminId = req.admin.id;
    
    const result = await usageService.unblock(req.params.counterId, adminId);
    
    res.json(result);
});
```

---

## 🛠 Jobs e Manutenção

### Job de Limpeza Diário

```bash
# Executar manualmente
node scripts/run-cleanup-job.js

# Com estatísticas
node scripts/run-cleanup-job.js --stats

# Configurar cron (Linux)
0 3 * * * cd /path/to/vps && node scripts/run-cleanup-job.js
```

### O que o Cleanup Job faz:

1. **Limpa snapshots antigos** (>30 dias inválidos)
2. **Reseta contadores expirados**
3. **Desativa trials expirados**
4. **Desativa overrides expirados**

---

## 📊 Monitoramento

### Verificar Status de Uso

```javascript
const { getInstance: getUsageService } = require('./shared/entitlements/UsageService');

async function getUserUsageReport(licenseId) {
    const usageService = getUsageService();
    
    const status = await usageService.getUsageStatus(licenseId);
    
    return status.map(counter => ({
        feature: counter.counter_key,
        used: counter.used,
        limit: counter.limit,
        remaining: counter.remaining,
        percentage: counter.percentage,
        blocked: counter.is_blocked
    }));
}
```

### Alertas de Quota

```javascript
async function checkQuotaAlerts(licenseId) {
    const usageService = getUsageService();
    const status = await usageService.getUsageStatus(licenseId);
    
    const alerts = status
        .filter(c => c.percentage >= 80)
        .map(c => ({
            feature: c.counter_key,
            percentage: c.percentage,
            remaining: c.remaining
        }));
    
    if (alerts.length > 0) {
        await sendQuotaWarningEmail(licenseId, alerts);
    }
    
    return alerts;
}
```

---

## 🚨 Tratamento de Erros

### Erros Comuns

```javascript
try {
    await usageService.increment(licenseId, 'monthly_messages', 1);
} catch (error) {
    if (error.message.includes('License not found')) {
        // Licença inválida
        return res.status(404).json({ error: 'License not found' });
    }
    
    if (error.message.includes('limit exceeded')) {
        // Quota excedida
        return res.status(429).json({ 
            error: 'Quota exceeded',
            upgrade_url: '/plans'
        });
    }
    
    // Erro genérico
    throw error;
}
```

---

## 📝 Checklist de Implementação

Ao integrar entitlements na sua aplicação:

- [ ] Importar services necessários
- [ ] Verificar permissões antes de ações críticas
- [ ] Incrementar contadores após uso
- [ ] Invalidar cache quando plano mudar
- [ ] Tratar erros de quota excedida
- [ ] Configurar job de limpeza diário
- [ ] Monitorar uso de quotas
- [ ] Implementar alertas de limite
- [ ] Testar com diferentes planos
- [ ] Documentar features específicas

---

## 🔗 Referências

- **Migrations:** `database/migrations/002_entitlements_system.sql`
- **Seeds:** `database/seeds/002_entitlements_initial_data.sql`
- **Services:** `shared/entitlements/`
- **Jobs:** `shared/jobs/CleanupJob.js`
- **Auditoria:** `planejamento/RELATORIO_AUDITORIA_FASE2.5.md`

---

**Última atualização:** 01/03/2026  
**Versão do documento:** 1.0

