# 🔍 AUDITORIA TÉCNICA FORMAL - FASE 2.5 ENTITLEMENTS

**Data:** 01/03/2026  
**Auditor:** Sistema de Análise Técnica  
**Versão do Sistema:** 2.5.0  
**Status:** Análise Crítica Completa

---

## 1️⃣ EXPOSIÇÃO DE REDE E SEGURANÇA

### 1.1 Status da API Interna (Porta 4003)

**❌ PROBLEMA CRÍTICO IDENTIFICADO**

**Situação Atual:**
- ✅ API criada na porta 4003
- ✅ Proteção por API Key implementada (`X-Internal-API-Key`)
- ❌ **NÃO está configurada no Docker Compose**
- ❌ **NÃO está isolada em network interna**
- ❌ **NÃO há configuração de Traefik**
- ❌ **NÃO há firewall configurado**

**Evidência Técnica:**
```javascript
// Arquivo: api-internal/src/server.js
// Linha 15: const PORT = process.env.INTERNAL_API_PORT || 4003;
// Linha 21: Middleware de API Key implementado
// PORÉM: Sem configuração de network isolation
```

**Risco Atual:** Se a porta 4003 for exposta no Docker sem network isolation, qualquer um com a API Key pode acessar.

### 1.2 Modelo de Isolamento de Rede

**❌ NÃO IMPLEMENTADO**

**Situação Atual:**
- ❌ Não há Docker network interna separada
- ❌ Não há configuração no docker-compose.yml
- ❌ Não há firewall configurado
- ❌ Serviço não está registrado

**O que DEVERIA existir:**
```yaml
# docker-compose.yml (NÃO EXISTE)
networks:
  internal:
    internal: true  # Bloqueia acesso externo
  public:
    driver: bridge

services:
  api-internal:
    networks:
      - internal  # Apenas rede interna
    ports: []  # SEM exposição de portas
```

### 1.3 Classificação de Risco

**🔴 RISCO: ALTO**

**Justificativa Técnica:**

1. **Sem isolamento de rede:** API pode ser acessada se porta for exposta
2. **Apenas API Key:** Única camada de proteção
3. **Sem rate limiting:** Vulnerável a brute force da API Key
4. **Sem IP whitelist:** Qualquer origem pode tentar
5. **Sem mTLS:** Comunicação não criptografada entre serviços

**Impacto Potencial:**
- Acesso não autorizado a entitlements
- Manipulação de quotas
- Concessão indevida de plugins premium
- Bypass de limites de uso

---

## 2️⃣ ATOMICIDADE DOS USAGE COUNTERS

### 2.1 Transacionalidade do Incremento

**⚠️ PROBLEMA MODERADO IDENTIFICADO**

**Situação Atual:**
```javascript
// Arquivo: shared/entitlements/UsageService.js
// Método: increment()

// ❌ NÃO usa transação SQL
// ❌ NÃO usa UPDATE condicional com WHERE
// ❌ NÃO usa Redis atomic increment
// ✅ USA: UPDATE simples com SET

const query = `
    UPDATE usage_counters
    SET 
        current_value = $1,  // ❌ Valor calculado no código
        is_blocked = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
`;
```

**Problema:** O valor é calculado no código (`newValue = counter.current_value + amount`) e depois atualizado. Isso NÃO é atômico.

### 2.2 Cenário de Teste: Race Condition

**❌ FALHA CONFIRMADA**

**Cenário:**
- Quota limite: 100
- Quota atual: 99
- Request A e B chegam simultaneamente
- Ambos querem consumir 1 quota

**O que acontece:**

```
T0: Request A lê counter.current_value = 99
T1: Request B lê counter.current_value = 99
T2: Request A calcula newValue = 99 + 1 = 100
T3: Request B calcula newValue = 99 + 1 = 100
T4: Request A executa UPDATE SET current_value = 100
T5: Request B executa UPDATE SET current_value = 100
```

**Resultado:** Ambos conseguem, quota vai para 100, mas deveria ter bloqueado um deles.

**🔴 RACE CONDITION CONFIRMADA**

### 2.3 Proteção contra Double-Spend

**❌ NÃO EXISTE**

**O que DEVERIA ser implementado:**

```sql
-- Opção 1: UPDATE atômico com WHERE condicional
UPDATE usage_counters
SET current_value = current_value + $1
WHERE id = $2
AND (limit_value IS NULL OR current_value + $1 <= limit_value)
RETURNING *;

-- Se retornar 0 rows = limite excedido
```

```sql
-- Opção 2: SELECT FOR UPDATE (transação)
BEGIN;
SELECT * FROM usage_counters WHERE id = $1 FOR UPDATE;
-- Verificar limite
UPDATE usage_counters SET current_value = current_value + $2 WHERE id = $1;
COMMIT;
```

**Recomendação:** Implementar UPDATE atômico com verificação condicional.

---

## 3️⃣ CONSISTÊNCIA DO SNAPSHOT DE ENTITLEMENTS

### 3.1 Armazenamento do Snapshot

**✅ IMPLEMENTADO CORRETAMENTE**

**Situação Atual:**
- ✅ Persistido no banco (tabela `entitlements`)
- ✅ Versionamento implementado (`snapshot_version`)
- ✅ TTL configurável (`expires_at`)
- ✅ Flag de validade (`is_valid`)

**Evidência:**
```javascript
// Arquivo: EntitlementResolverService.js
// Método: saveSnapshot()
// Linha ~380: INSERT INTO entitlements com todos os campos
```

### 3.2 Consistência entre Instâncias

**⚠️ PROBLEMA MODERADO**

**Situação Atual:**
- ✅ Snapshot no banco = consistente entre instâncias
- ❌ NÃO há Redis compartilhado
- ⚠️ Cada instância faz query no banco

**Comportamento com múltiplas instâncias:**

```
Instância 1: Lê snapshot do banco (versão 5)
Instância 2: Lê snapshot do banco (versão 5)
Instância 3: Lê snapshot do banco (versão 5)
```

**Problema:** Se plano mudar:
- Instância 1 invalida e recalcula (versão 6)
- Instância 2 e 3 ainda têm versão 5 em memória (se houver cache local)

**Mitigação Atual:** Não há cache em memória, sempre consulta banco. Isso é consistente mas LENTO.

### 3.3 Invalidação Global

**⚠️ IMPLEMENTAÇÃO PARCIAL**

**Situação Atual:**
```javascript
// Método: invalidate()
await this.pool.query(
    `UPDATE entitlements SET is_valid = false WHERE license_id = $1`,
    [licenseId]
);
```

**Problema:**
- ✅ Invalida no banco
- ❌ NÃO notifica outras instâncias
- ❌ Depende de cada instância consultar banco novamente
- ❌ Sem pub/sub para invalidação imediata

**Cenário Problemático:**
```
T0: Admin muda plano do usuário
T1: Instância 1 invalida snapshot
T2: Instância 2 ainda tem snapshot antigo em cache (se houver)
T3: Usuário faz request na Instância 2
T4: Usa permissões antigas até TTL expirar
```

**Solução Necessária:** Redis Pub/Sub para invalidação global.

---

## 4️⃣ CACHE E ESCALABILIDADE

### 4.1 Tipo de Cache Atual

**📊 ANÁLISE**

**Situação Atual:**
- ❌ NÃO é in-memory
- ❌ NÃO é Redis
- ✅ É banco de dados (tabela `entitlements`)

**Evidência:**
```javascript
// Método: getCachedEntitlement()
const query = `SELECT * FROM entitlements WHERE license_id = $1 ...`;
```

**Implicação:** Cada consulta de entitlement = 1 query no PostgreSQL.

### 4.2 Suporte a Múltiplas Instâncias

**⚠️ FUNCIONA MAS COM LIMITAÇÕES**

**Comportamento por número de instâncias:**

**1 Instância:**
- ✅ Funciona perfeitamente
- ✅ Sem problemas de consistência
- ⚠️ Gargalo: Todas queries no mesmo processo

**3 Instâncias:**
- ✅ Load balancing funciona
- ✅ Snapshots consistentes (banco)
- ⚠️ 3x mais queries no PostgreSQL
- ⚠️ Invalidação não é instantânea entre instâncias

**10 Instâncias:**
- ⚠️ Funciona mas com problemas
- 🔴 10x mais queries no PostgreSQL
- 🔴 Connection pool pode esgotar
- 🔴 Latência aumenta significativamente
- 🔴 Invalidação ainda mais lenta

**Gargalo Identificado:** PostgreSQL como cache não escala horizontalmente.

### 4.3 Risco de Inconsistência

**⚠️ RISCO MÉDIO**

**Cenários de Inconsistência:**

1. **TTL não sincronizado:**
   - Instância A: snapshot expira em 10s
   - Instância B: snapshot expira em 50s
   - Resultado: Permissões diferentes por 40s

2. **Invalidação assíncrona:**
   - Admin muda plano
   - Instância A recalcula imediatamente
   - Instância B só descobre na próxima query
   - Janela de inconsistência: variável

3. **Race condition no recálculo:**
   - Duas instâncias detectam snapshot inválido
   - Ambas recalculam simultaneamente
   - Duas versões diferentes podem ser criadas

**Probabilidade:** Baixa em produção normal, Alta em picos de tráfego.

---

## 5️⃣ SEPARAÇÃO ARQUITETURAL

### 5.1 Tipo de Separação

**📋 ANÁLISE**

**Situação Atual:**
- ✅ Processo separado (api-internal)
- ✅ Porta separada (4003)
- ✅ Código isolado em `/api-internal`
- ❌ NÃO é microserviço (sem deploy independente)
- ❌ NÃO tem Docker container próprio
- ❌ NÃO está no docker-compose

**Classificação:** Módulo isolado com servidor próprio, mas não é microserviço real.

### 5.2 Benefício Real Neste Estágio

**⚠️ ANÁLISE CRÍTICA**

**Benefícios Teóricos:**
- ✅ Separação de responsabilidades
- ✅ API não exposta publicamente (se configurado)
- ✅ Controle de acesso granular

**Problemas Práticos:**
- 🔴 Adiciona latência (HTTP call extra)
- 🔴 Adiciona ponto de falha
- 🔴 Adiciona complexidade operacional
- 🔴 Não está deployado (então não funciona)

**Veredicto:** **Overengineering neste estágio.**

### 5.3 Complexidade Operacional

**🔴 ANÁLISE CRÍTICA OBRIGATÓRIA**

**Complexidade Adicionada:**

1. **Deploy:**
   - Mais um serviço para deployar
   - Mais um healthcheck para monitorar
   - Mais um log para agregar

2. **Desenvolvimento:**
   - Mais um servidor para rodar localmente
   - Mais uma porta para gerenciar
   - Mais um .env para configurar

3. **Debugging:**
   - Mais um hop para rastrear
   - Mais um ponto de falha
   - Mais complexidade em traces

4. **Segurança:**
   - Mais uma API Key para gerenciar
   - Mais um endpoint para proteger
   - Mais uma surface de ataque

**Alternativa Mais Simples:**

```javascript
// Usar os services diretamente
const { getInstance } = require('./shared/entitlements/EntitlementResolverService');
const resolver = getInstance();
const entitlement = await resolver.resolve(licenseId);

// Sem HTTP call, sem latência, sem complexidade
```

**Recomendação:** **Remover API interna e usar services diretamente** até ter necessidade real de separação (ex: 50K+ usuários).

---

## 6️⃣ PREPARAÇÃO REAL PARA 100K USUÁRIOS

### 6.1 Banco de Dados - Alto Volume

**⚠️ PREPARADO PARCIALMENTE**

**Análise de Tabelas Críticas:**

**✅ BOM:**
- Particionamento de `usage_logs` por mês
- Índices em foreign keys
- UUID como PK

**❌ PROBLEMAS:**

1. **Tabela `usage_counters`:**
   ```sql
   -- Sem particionamento
   -- Com 100K usuários e 10 counters cada = 1M rows
   -- Queries vão degradar
   ```

2. **Tabela `entitlements`:**
   ```sql
   -- Sem limpeza de snapshots antigos
   -- Acumula versões infinitamente
   -- Precisa de job de limpeza
   ```

3. **Tabela `plugin_entitlements`:**
   ```sql
   -- Sem índice composto otimizado
   -- Queries por user_id + plugin_id podem ser lentas
   ```

### 6.2 Índices Adequados

**⚠️ ANÁLISE DETALHADA**

**Índices Existentes:**
```sql
✅ idx_usage_counters_unique (license_id, counter_type, counter_key, period_start)
✅ idx_usage_counters_user (user_id)
✅ idx_usage_counters_license (license_id)
✅ idx_entitlements_license_version (license_id, snapshot_version)
```

**Índices FALTANDO:**

```sql
-- 1. Para queries de verificação rápida
CREATE INDEX idx_usage_counters_check 
ON usage_counters(license_id, counter_key, is_blocked) 
WHERE period_end > CURRENT_TIMESTAMP;

-- 2. Para limpeza de snapshots antigos
CREATE INDEX idx_entitlements_cleanup 
ON entitlements(computed_at) 
WHERE is_valid = false;

-- 3. Para queries de plugins por categoria
CREATE INDEX idx_plugin_registry_category_active 
ON plugin_registry(category, is_premium) 
WHERE is_active = true AND deleted_at IS NULL;
```

### 6.3 Capacidade de Requisições

**🔴 ANÁLISE DE GARGALOS**

**Teste de Carga Estimado:**

**100 req/s:**
- ✅ Provavelmente suporta
- ⚠️ Cada req = 2-3 queries no PostgreSQL
- ⚠️ 200-300 queries/s no banco
- ⚠️ Connection pool pode começar a enfileirar

**500 req/s:**
- 🔴 Provavelmente NÃO suporta
- 🔴 1000-1500 queries/s no PostgreSQL
- 🔴 Connection pool vai esgotar
- 🔴 Latência vai explodir (>1s)

**Gargalos Identificados:**

1. **PostgreSQL como cache:**
   - Cada entitlement = 1 query
   - Sem cache em memória/Redis
   - Não escala horizontalmente

2. **Usage counters sem otimização:**
   - Cada incremento = 2 queries (SELECT + UPDATE)
   - Race conditions possíveis
   - Sem batch processing

3. **Sem cache distribuído:**
   - Sem Redis
   - Sem Memcached
   - Cada instância bate no banco

**Capacidade Real Estimada:** **~150-200 req/s** antes de degradação significativa.

---

## 7️⃣ ANÁLISE DE RISCOS

### Risco 1: Race Condition em Usage Counters
**Impacto:** 🔴 ALTO  
**Prioridade:** 🔴 ALTA  
**Descrição:** Incrementos simultâneos podem ultrapassar limites de quota.  
**Solução:**
```sql
-- Implementar UPDATE atômico
UPDATE usage_counters
SET current_value = current_value + $1
WHERE id = $2
AND (limit_value IS NULL OR current_value + $1 <= limit_value)
RETURNING *;
```

### Risco 2: API Interna Sem Isolamento de Rede
**Impacto:** 🔴 ALTO  
**Prioridade:** 🔴 ALTA  
**Descrição:** Porta 4003 pode ser exposta sem proteção adequada.  
**Solução:**
```yaml
# Opção 1: Remover API interna (recomendado)
# Usar services diretamente

# Opção 2: Isolar em Docker network interna
networks:
  internal:
    internal: true
```

### Risco 3: PostgreSQL como Cache Não Escala
**Impacto:** 🟡 MÉDIO  
**Prioridade:** 🟡 MÉDIA  
**Descrição:** Cada consulta de entitlement = query no banco.  
**Solução:**
```javascript
// Implementar Redis como cache L1
const redis = require('redis');
const cached = await redis.get(`entitlement:${licenseId}`);
if (cached) return JSON.parse(cached);
// ... buscar do banco e cachear
```

### Risco 4: Invalidação Não Sincronizada entre Instâncias
**Impacto:** 🟡 MÉDIO  
**Prioridade:** 🟡 MÉDIA  
**Descrição:** Mudanças de plano não propagam instantaneamente.  
**Solução:**
```javascript
// Redis Pub/Sub para invalidação global
redis.publish('entitlement:invalidate', licenseId);
// Todas instâncias recebem e invalidam cache local
```

### Risco 5: Acúmulo Infinito de Snapshots Antigos
**Impacto:** 🟢 BAIXO  
**Prioridade:** 🟢 BAIXA  
**Descrição:** Tabela `entitlements` cresce indefinidamente.  
**Solução:**
```sql
-- Job diário de limpeza
DELETE FROM entitlements
WHERE is_valid = false
AND computed_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
```

---

## 8️⃣ VEREDICTO FINAL

### Classificação: **⚠️ PRECISA AJUSTES MODERADOS**

### Análise Objetiva

**✅ PONTOS FORTES:**
1. Arquitetura conceitual bem pensada
2. Separação clara de responsabilidades
3. Modelagem de banco adequada
4. Versionamento de snapshots implementado
5. Sistema de features flexível

**🔴 PROBLEMAS CRÍTICOS:**
1. Race condition em usage counters (DEVE SER CORRIGIDO)
2. API interna sem isolamento de rede (DEVE SER CORRIGIDO)
3. Sem cache distribuído (LIMITA ESCALABILIDADE)

**🟡 PROBLEMAS MODERADOS:**
1. PostgreSQL como cache não escala
2. Invalidação não sincronizada
3. Overengineering com API interna separada
4. Faltam índices otimizados

**🟢 MELHORIAS DESEJÁVEIS:**
1. Implementar Redis para cache
2. Adicionar Redis Pub/Sub para invalidação
3. Otimizar queries com índices compostos
4. Adicionar job de limpeza de snapshots

### Pronto para Fase 3?

**❌ NÃO ESTÁ PRONTO** sem correções.

**Correções OBRIGATÓRIAS antes da Fase 3:**

1. **Corrigir race condition** (2-4 horas)
   ```sql
   UPDATE usage_counters
   SET current_value = current_value + $1
   WHERE id = $2 AND current_value + $1 <= limit_value
   ```

2. **Remover API interna OU isolar corretamente** (1-2 horas)
   - Opção A: Usar services diretamente (recomendado)
   - Opção B: Docker network interna + sem exposição de porta

3. **Adicionar índices faltantes** (30 minutos)
   ```sql
   CREATE INDEX idx_usage_counters_check ...
   CREATE INDEX idx_entitlements_cleanup ...
   ```

**Correções RECOMENDADAS para produção:**

4. **Implementar Redis cache** (4-6 horas)
5. **Implementar Redis Pub/Sub** (2-3 horas)
6. **Adicionar job de limpeza** (1-2 horas)

### Timeline Estimado

- **Mínimo viável:** 4-6 horas (correções obrigatórias)
- **Produção-ready:** 12-16 horas (todas correções)

### Recomendação Final

**IMPLEMENTAR CORREÇÕES OBRIGATÓRIAS** antes de prosseguir para Fase 3.

O sistema tem boa base arquitetural, mas os problemas de race condition e isolamento de rede são **blockers críticos** para monetização.

---

## 📋 CHECKLIST DE VALIDAÇÃO

Antes de aprovar para Fase 3:

- [x] Race condition em usage counters corrigida ✅
- [x] API interna removida ✅
- [x] Índices otimizados criados ✅
- [x] Job de limpeza configurado ✅
- [x] Documentação atualizada ✅
- [ ] Teste de carga realizado (100 req/s) - RECOMENDADO
- [ ] Redis implementado - RECOMENDADO

---

## ✅ CORREÇÕES APLICADAS

**Data das Correções:** 01/03/2026  
**Status:** ✅ CORREÇÕES OBRIGATÓRIAS IMPLEMENTADAS

**Arquivos Modificados:**
- `afiliado/vps/shared/entitlements/UsageService.js` - Race condition corrigida

**Arquivos Criados:**
- `afiliado/vps/database/migrations/003_performance_indexes.sql` - Índices otimizados
- `afiliado/vps/shared/jobs/CleanupJob.js` - Job de limpeza
- `afiliado/vps/scripts/run-cleanup-job.js` - Script de execução
- `afiliado/vps/docs/ENTITLEMENTS_USAGE_GUIDE.md` - Guia de uso

**Arquivos Removidos:**
- `afiliado/vps/api-internal/src/server.js` - API interna removida (usar services diretamente)

**Documentação:**
- `planejamento/FASE2.5_CORRECOES_APLICADAS.md` - Detalhamento das correções

**Veredicto Final:** ✅ PRONTO PARA FASE 3

---

**Documento gerado em:** 01/03/2026  
**Correções aplicadas em:** 01/03/2026  
**Próxima revisão:** Após testes de carga (opcional)  
**Responsável:** Equipe de Desenvolvimento
