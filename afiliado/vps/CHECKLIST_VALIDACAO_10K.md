# ✅ CHECKLIST DE VALIDAÇÃO - ARQUITETURA 10K USUÁRIOS

## 📋 Infraestrutura

### PostgreSQL
- [ ] PostgreSQL instalado e rodando
- [ ] Banco de dados `afiliados_vps_licenses` criado
- [ ] Usuário `afiliados_vps_user` criado com permissões
- [ ] `max_connections` configurado >= 100
- [ ] `shared_buffers` configurado (recomendado: 256MB)
- [ ] `effective_cache_size` configurado (recomendado: 1GB)
- [ ] Migrações executadas (`npm run migrate`)
- [ ] Índices criados e validados
- [ ] Slow query log habilitado (> 200ms)

**Validação:**
```bash
psql -U afiliados_vps_user -d afiliados_vps_licenses -c "SELECT version();"
psql -U afiliados_vps_user -d afiliados_vps_licenses -c "SHOW max_connections;"
psql -U afiliados_vps_user -d afiliados_vps_licenses -c "\dt"
psql -U afiliados_vps_user -d afiliados_vps_licenses -c "\di"
```

### Redis
- [ ] Redis instalado e rodando
- [ ] Porta 6379 acessível
- [ ] Senha configurada (se aplicável)
- [ ] `maxmemory-policy` configurado como `allkeys-lru`
- [ ] `maxmemory` configurado (recomendado: 512MB)
- [ ] Persistência configurada (RDB ou AOF)

**Validação:**
```bash
redis-cli ping
redis-cli INFO stats
redis-cli CONFIG GET maxmemory-policy
```

### Node.js Cluster
- [ ] Node.js >= 18.0.0 instalado
- [ ] Variável `WORKERS=2` configurada
- [ ] Variável `NODE_ENV=production` configurada
- [ ] PM2 instalado (opcional, mas recomendado)
- [ ] Cluster mode ativo (2 workers)
- [ ] Graceful shutdown implementado

**Validação:**
```bash
node --version
NODE_ENV=production WORKERS=2 node server-production.js
# Verificar logs: "Starting 2 workers..."
```

### Traefik (Edge)
- [ ] Traefik instalado e rodando
- [ ] TLS/SSL configurado
- [ ] Certificados válidos
- [ ] Roteamento para aplicação configurado
- [ ] Headers de segurança configurados
- [ ] Rate limiting no Traefik (opcional)

**Validação:**
```bash
curl -I https://seu-dominio.com/health
# Verificar: HTTP/2, TLS 1.3, headers de segurança
```

---

## 🔧 Configurações

### Variáveis de Ambiente
- [ ] `.env.production` criado
- [ ] `JWT_SECRET` gerado (32+ caracteres)
- [ ] `LICENSE_SECRET` gerado (32+ caracteres)
- [ ] `DB_PASSWORD` forte configurado
- [ ] `REDIS_PASSWORD` forte configurado
- [ ] `DB_POOL_MAX=20` configurado
- [ ] `CACHE_TTL=300` configurado

**Validação:**
```bash
grep -E "JWT_SECRET|LICENSE_SECRET|DB_PASSWORD" .env.production
# Verificar se não são valores default
```

### Pool de Conexões
- [ ] `DB_POOL_MAX=20` por instância
- [ ] `DB_POOL_MIN=5` por instância
- [ ] Total de conexões: 2 instâncias x 20 = 40
- [ ] PostgreSQL `max_connections >= 100`
- [ ] Margem de segurança: 60 conexões livres

**Validação:**
```sql
SELECT count(*) FROM pg_stat_activity;
-- Deve ser < 70 em carga normal
```

### Rate Limiting
- [ ] Rate limit ajustado: 1000 req/min por IP
- [ ] Skip configurado para `/health`
- [ ] Headers `X-RateLimit-*` habilitados
- [ ] Mensagem de erro customizada

**Validação:**
```bash
# Fazer 1001 requisições em 1 minuto
# A 1001ª deve retornar 429 Too Many Requests
```

---

## 🧪 Testes de Performance

### Cenário A - Base (100 req/s por 2 min)
- [ ] Executado com sucesso
- [ ] Latência P95 < 150ms: _____ ms
- [ ] Latência P99 < 300ms: _____ ms
- [ ] Taxa de erro < 1%: _____ %
- [ ] CPU < 75%: _____ %
- [ ] DB conexões < 70%: _____ conexões

### Cenário B - Moderado (250 req/s por 3 min)
- [ ] Executado com sucesso
- [ ] Latência P95 < 150ms: _____ ms
- [ ] Latência P99 < 300ms: _____ ms
- [ ] Taxa de erro < 1%: _____ %
- [ ] CPU < 75%: _____ %
- [ ] DB conexões < 70%: _____ conexões

### Cenário C - Alto (400 req/s por 3 min)
- [ ] Executado com sucesso
- [ ] Latência P95 < 150ms: _____ ms
- [ ] Latência P99 < 300ms: _____ ms
- [ ] Taxa de erro < 1%: _____ %
- [ ] CPU < 75%: _____ %
- [ ] DB conexões < 70%: _____ conexões

**Comando para executar:**
```bash
cd load-tests
node simple-load-test.js
```

---

## 📊 Estimativa de Capacidade

### Cálculos Baseados em Dados Reais

**Throughput Sustentável:**
- Cenário A: _____ req/s
- Cenário B: _____ req/s
- Cenário C: _____ req/s
- **Máximo sustentável:** _____ req/s

**Usuários Simultâneos:**
- Fórmula: `throughput * 5` (1 req a cada 5s)
- **Estimativa:** _____ usuários

**Margem de Segurança:**
- CPU headroom: _____ %
- DB headroom: _____ %
- **Margem total:** _____ %

---

## ✅ Validação Final

### Infraestrutura
- [ ] PostgreSQL conectado e funcionando
- [ ] Redis conectado e funcionando
- [ ] Cluster ativo com 2 workers
- [ ] Traefik roteando corretamente
- [ ] TLS/SSL ativo

### Performance
- [ ] P95 < 150ms em todos os cenários
- [ ] P99 < 300ms em todos os cenários
- [ ] Taxa de erro < 1% em todos os cenários
- [ ] CPU < 75% em carga máxima
- [ ] DB conexões < 70% do limite

### Funcionalidade
- [ ] `/health` retorna 200 OK
- [ ] `/api/validate-license` funcionando
- [ ] `/api/check-quota` funcionando
- [ ] `/api/consume-quota` funcionando
- [ ] `/api/validate-plugin` funcionando
- [ ] Cache funcionando (verificar logs "Cache HIT")
- [ ] Invalidação de cache funcionando

### Segurança
- [ ] JWT funcionando
- [ ] HMAC signatures funcionando
- [ ] Rate limiting ativo
- [ ] TLS/SSL ativo
- [ ] Secrets não expostos

### Monitoramento
- [ ] Logs estruturados
- [ ] Slow queries sendo logadas
- [ ] Métricas de pool disponíveis
- [ ] Health check respondendo

---

## 🎯 Classificação Final

Com base nos testes e validações:

### [ ] ✅ PRONTO PARA 10K USUÁRIOS ATIVOS
- Todos os testes passaram
- Performance dentro dos limites
- Infraestrutura validada
- Margem de segurança adequada

### [ ] ⚠️ PRÓXIMO DO LIMITE
- Testes passaram mas com pouca margem
- Requer monitoramento constante
- Considerar otimizações

### [ ] ❌ PRECISA AJUSTES
- Alguns testes falharam
- Performance abaixo do esperado
- Requer correções antes de produção

---

## 📝 Observações

**Data da Validação:** _______________

**Responsável:** _______________

**Notas Adicionais:**
```
[Escrever observações aqui]
```

**Próximos Passos:**
1. [ ] _____________________
2. [ ] _____________________
3. [ ] _____________________

---

## 🚀 Deploy para Produção

Após validação completa:

```bash
# 1. Instalar dependências
npm install --production

# 2. Executar migrações
npm run migrate

# 3. Iniciar em modo produção
npm run start:cluster

# 4. Verificar health
curl http://localhost:3000/health

# 5. Monitorar logs
tail -f logs/production.log
```

---

**Sem marketing. Sem suposição. Baseado em números.**
