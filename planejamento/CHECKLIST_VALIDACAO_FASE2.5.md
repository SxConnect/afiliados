# ✅ Checklist de Validação - FASE 2.5

**Data:** 01/03/2026  
**Versão:** 2.5.1  
**Objetivo:** Validar que todas as correções foram aplicadas corretamente

---

## 🔍 Validação de Correções Críticas

### 1. Race Condition em Usage Counters

**Status:** ✅ CORRIGIDO

**Arquivo:** `afiliado/vps/shared/entitlements/UsageService.js`

**Validação:**
- [ ] Abrir arquivo `UsageService.js`
- [ ] Localizar método `increment()`
- [ ] Verificar que usa UPDATE atômico:
  ```javascript
  UPDATE usage_counters
  SET current_value = current_value + $1
  WHERE id = $2
  AND (limit_value IS NULL OR current_value + $1 <= limit_value)
  ```
- [ ] Verificar que retorna NULL se limite seria ultrapassado
- [ ] Verificar que trata NULL como bloqueio

**Teste Manual:**
```javascript
// Criar contador com limite 100 e valor 99
// Tentar incrementar 2 simultaneamente
// Resultado esperado: Um sucesso, outro bloqueado
```

---

### 2. API Interna Removida

**Status:** ✅ CORRIGIDO

**Validação:**
- [ ] Verificar que arquivo `afiliado/vps/api-internal/src/server.js` NÃO existe
- [ ] Verificar que pasta `afiliado/vps/api-internal/src/controllers/` está vazia ou não existe
- [ ] Verificar que `docker-compose.yml` NÃO tem serviço `api-internal`
- [ ] Verificar que documentação recomenda usar services diretamente

**Arquivo de Referência:**
- `afiliado/vps/docs/ENTITLEMENTS_USAGE_GUIDE.md` - Deve mostrar imports diretos

---

### 3. Índices Otimizados Criados

**Status:** ✅ CORRIGIDO

**Arquivo:** `afiliado/vps/database/migrations/003_performance_indexes.sql`

**Validação:**
- [ ] Verificar que arquivo existe
- [ ] Verificar que contém 8 índices:
  - [ ] `idx_usage_counters_check`
  - [ ] `idx_usage_counters_expired`
  - [ ] `idx_entitlements_cleanup`
  - [ ] `idx_entitlements_user_valid`
  - [ ] `idx_plugin_registry_category_active`
  - [ ] `idx_plugin_entitlements_access_check`
  - [ ] `idx_plugin_entitlements_active_trials`
  - [ ] `idx_plan_features_resolution`

**Teste no Banco (após migration):**
```sql
-- Verificar índices criados
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

---

### 4. Job de Limpeza Implementado

**Status:** ✅ CORRIGIDO

**Arquivos:**
- `afiliado/vps/shared/jobs/CleanupJob.js`
- `afiliado/vps/scripts/run-cleanup-job.js`

**Validação:**
- [ ] Verificar que `CleanupJob.js` existe
- [ ] Verificar que tem métodos:
  - [ ] `cleanupOldSnapshots()`
  - [ ] `resetExpiredCounters()`
  - [ ] `cleanupExpiredTrials()`
  - [ ] `cleanupExpiredOverrides()`
- [ ] Verificar que `run-cleanup-job.js` existe
- [ ] Verificar que é executável

**Teste Manual:**
```bash
cd afiliado/vps
node scripts/run-cleanup-job.js --stats
```

**Resultado Esperado:**
```
========================================
CLEANUP JOB STARTED
========================================
CLEANUP RESULTS:
  Snapshots cleaned: X
  Counters reset: X
  Trials cleaned: X
  Overrides cleaned: X
========================================
CLEANUP JOB COMPLETED SUCCESSFULLY
========================================
```

---

## 📚 Validação de Documentação

### Documentos Criados

- [ ] `planejamento/RELATORIO_AUDITORIA_FASE2.5.md` - Auditoria completa
- [ ] `planejamento/FASE2.5_CORRECOES_APLICADAS.md` - Detalhamento das correções
- [ ] `planejamento/RESUMO_EXECUTIVO_FASE2.5.md` - Resumo executivo
- [ ] `planejamento/CHECKLIST_VALIDACAO_FASE2.5.md` - Este documento
- [ ] `afiliado/vps/docs/ENTITLEMENTS_USAGE_GUIDE.md` - Guia de uso
- [ ] `afiliado/vps/shared/entitlements/README.md` - README do módulo

### Documentos Atualizados

- [ ] `planejamento/FASE2_PROGRESSO_E_PROPOSTA.md` - Seção FASE 2.5 adicionada
- [ ] `planejamento/RELATORIO_AUDITORIA_FASE2.5.md` - Checklist marcado como completo

---

## 🗄 Validação de Banco de Dados

### Migrations

**Validação:**
- [ ] Verificar que existem 3 migrations:
  - [ ] `001_initial_schema.sql`
  - [ ] `002_entitlements_system.sql`
  - [ ] `003_performance_indexes.sql`

**Executar Migrations:**
```bash
cd afiliado/vps
node scripts/run-migrations.js --status
```

**Resultado Esperado:**
```
Total migrations: 3
Executed: X
Pending: X
```

### Tabelas

**Validação no Banco:**
```sql
-- Verificar tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'features',
    'plan_features',
    'plugin_registry',
    'plugin_entitlements',
    'subscription_addons',
    'entitlements',
    'usage_counters',
    'entitlement_overrides'
)
ORDER BY table_name;
```

**Resultado Esperado:** 8 tabelas

### Views

**Validação no Banco:**
```sql
-- Verificar views criadas
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN (
    'v_user_entitlements',
    'v_active_plugin_entitlements',
    'v_active_usage_counters'
)
ORDER BY table_name;
```

**Resultado Esperado:** 3 views

---

## 🧪 Testes Funcionais

### Teste 1: Resolver Entitlements

```javascript
const { getInstance } = require('./shared/entitlements/EntitlementResolverService');

async function test() {
    const resolver = getInstance();
    
    // Usar licenseId real do banco
    const licenseId = 'uuid-da-licenca';
    
    const entitlement = await resolver.resolve(licenseId);
    
    console.log('Features:', entitlement.features);
    console.log('Plugins:', entitlement.plugins);
    console.log('Quotas:', entitlement.quotas);
    
    // Verificar que retornou dados
    assert(entitlement.features !== null);
    assert(entitlement.plugins !== null);
}
```

### Teste 2: Incrementar Contador (Atômico)

```javascript
const { getInstance } = require('./shared/entitlements/UsageService');

async function test() {
    const usageService = getInstance();
    
    const licenseId = 'uuid-da-licenca';
    
    // Incrementar
    const result = await usageService.increment(
        licenseId,
        'monthly_messages',
        1,
        'feature',
        'monthly'
    );
    
    console.log('Success:', result.success);
    console.log('Blocked:', result.blocked);
    console.log('Remaining:', result.remaining);
    
    // Verificar que incrementou
    assert(result.success === true || result.blocked === true);
}
```

### Teste 3: Verificar Plugin

```javascript
const { getInstance } = require('./shared/entitlements/PluginRegistryService');

async function test() {
    const pluginRegistry = getInstance();
    
    const licenseId = 'uuid-da-licenca';
    
    // Verificar acesso
    const access = await pluginRegistry.checkAccess(licenseId, 'auto-responder');
    
    console.log('Has Access:', access.has_access);
    console.log('Reason:', access.reason);
    
    // Verificar que retornou resposta
    assert(access.has_access !== undefined);
}
```

### Teste 4: Job de Limpeza

```bash
# Executar job
node scripts/run-cleanup-job.js

# Verificar que não deu erro
echo $?  # Deve retornar 0
```

---

## 🔐 Validação de Segurança

### API Interna Removida

- [ ] Verificar que porta 4003 NÃO está em uso
- [ ] Verificar que NÃO há processo escutando na porta 4003
- [ ] Verificar que docker-compose NÃO expõe porta 4003

**Comando:**
```bash
# Linux/Mac
lsof -i :4003

# Windows
netstat -ano | findstr :4003
```

**Resultado Esperado:** Nenhum processo

---

## 📊 Validação de Performance

### Índices Criados

**Validação no Banco:**
```sql
-- Verificar que índices estão sendo usados
EXPLAIN ANALYZE
SELECT *
FROM usage_counters
WHERE license_id = 'uuid'
AND counter_key = 'monthly_messages'
AND is_blocked = false
AND period_end > CURRENT_TIMESTAMP;
```

**Resultado Esperado:** Deve usar `idx_usage_counters_check`

### Cache Funcionando

```javascript
const { getInstance } = require('./shared/entitlements/EntitlementResolverService');

async function test() {
    const resolver = getInstance();
    const licenseId = 'uuid-da-licenca';
    
    // Primeira chamada (sem cache)
    console.time('First call');
    await resolver.resolve(licenseId);
    console.timeEnd('First call');
    
    // Segunda chamada (com cache)
    console.time('Second call');
    await resolver.resolve(licenseId);
    console.timeEnd('Second call');
    
    // Segunda deve ser mais rápida
}
```

---

## ✅ Checklist Final

### Correções Críticas
- [x] Race condition corrigida
- [x] API interna removida
- [x] Índices otimizados criados
- [x] Job de limpeza implementado

### Documentação
- [x] Auditoria técnica completa
- [x] Guia de uso criado
- [x] README do módulo criado
- [x] Documento de correções criado
- [x] Resumo executivo criado
- [x] Checklist de validação criado

### Banco de Dados
- [ ] Migrations executadas
- [ ] Tabelas criadas
- [ ] Views criadas
- [ ] Índices criados
- [ ] Seeds executados (opcional)

### Testes
- [ ] Teste de resolver entitlements
- [ ] Teste de incremento atômico
- [ ] Teste de verificação de plugin
- [ ] Teste de job de limpeza

### Performance
- [ ] Índices sendo usados
- [ ] Cache funcionando
- [ ] Queries otimizadas

---

## 🚀 Próximos Passos

Após validar todos os itens acima:

1. **Executar migrations:**
   ```bash
   cd afiliado/vps
   node scripts/run-migrations.js
   ```

2. **Executar seeds (opcional):**
   ```bash
   node scripts/run-migrations.js --seed
   ```

3. **Configurar cron para cleanup:**
   ```bash
   # Linux
   crontab -e
   # Adicionar: 0 3 * * * cd /path/to/vps && node scripts/run-cleanup-job.js
   ```

4. **Testar integração:**
   - Criar testes unitários
   - Criar testes de integração
   - Executar teste de carga (opcional)

5. **Deploy em staging:**
   - Validar em ambiente de staging
   - Monitorar logs
   - Validar performance

6. **Prosseguir para FASE 3:**
   - Monetização de plugins
   - Marketplace
   - Sistema de comissões

---

## 📝 Notas

- Este checklist deve ser executado antes de prosseguir para FASE 3
- Todos os itens marcados com [x] foram implementados
- Itens marcados com [ ] precisam ser validados manualmente
- Testes de carga são opcionais mas recomendados

---

**Responsável:** Equipe de Desenvolvimento  
**Data de Criação:** 01/03/2026  
**Última Atualização:** 01/03/2026

