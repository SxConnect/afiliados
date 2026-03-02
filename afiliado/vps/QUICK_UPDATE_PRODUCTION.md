# 🚀 GUIA RÁPIDO DE ATUALIZAÇÃO - PRODUÇÃO

## ✅ Deploy Concluído com Sucesso!

**Versão:** 2.0.0  
**Data:** 2026-03-01  
**Imagem:** `ghcr.io/sxconnect/afiliados-vps:2.0.0`

---

## 📦 Imagem Disponível no GHCR

A imagem Docker foi construída e enviada com sucesso para o GitHub Container Registry:

- **Latest:** `ghcr.io/sxconnect/afiliados-vps:latest`
- **Versão:** `ghcr.io/sxconnect/afiliados-vps:2.0.0`

🔗 **Verificar no GHCR:**  
https://github.com/orgs/SxConnect/packages/container/package/afiliados-vps

---

## 🔄 Como Atualizar no Servidor VPS

### Passo 1: Conectar ao Servidor

```bash
ssh usuario@seu-servidor-vps.com
```

### Passo 2: Navegar até o Diretório do Docker Compose

```bash
cd /path/to/docker-compose
# Exemplo: cd /opt/afiliados-vps
```

### Passo 3: Fazer Backup (Recomendado)

```bash
# Backup do banco de dados
docker-compose exec postgres pg_dump -U afiliados_vps_user afiliados_vps_licenses > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup das variáveis de ambiente
cp .env .env.backup_$(date +%Y%m%d_%H%M%S)
```

### Passo 4: Atualizar a Imagem

```bash
# Pull da nova imagem
docker-compose pull vps

# Verificar se a imagem foi baixada
docker images | grep afiliados-vps
```

### Passo 5: Atualizar o Container

```bash
# Parar e remover o container antigo
docker-compose stop vps
docker-compose rm -f vps

# Iniciar o novo container
docker-compose up -d vps

# Verificar logs
docker-compose logs -f vps
```

### Passo 6: Validar a Atualização

```bash
# 1. Verificar se o container está rodando
docker-compose ps

# 2. Verificar health check
curl http://localhost:3000/health

# 3. Verificar versão
curl http://localhost:3000/health | jq '.version'
# Deve retornar: "2.0.0"

# 4. Verificar workers
docker-compose logs vps | grep "Worker"
# Deve mostrar 2 workers ativos

# 5. Verificar conexões
docker-compose logs vps | grep "PostgreSQL"
docker-compose logs vps | grep "Redis"
```

---

## 🔍 Verificações Pós-Deploy

### 1. Health Check Completo

```bash
curl -s http://localhost:3000/health | jq '.'
```

**Resposta Esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-01T...",
  "version": "2.0.0",
  "uptime": 123.45,
  "worker": 1,
  "database": {
    "connected": true,
    "pool": {
      "total": 20,
      "idle": 18,
      "waiting": 0
    }
  },
  "cache": {
    "connected": true,
    "memory": {
      "used": "10MB",
      "max": "512MB"
    }
  }
}
```

### 2. Verificar Cluster Mode

```bash
docker-compose logs vps | grep "Starting"
```

**Saída Esperada:**
```
Starting 2 workers...
Worker 1 (PID: 123) listening on port 3000
Worker 2 (PID: 124) listening on port 3000
```

### 3. Verificar Rate Limiting

```bash
docker-compose logs vps | grep "Rate Limit"
```

**Saída Esperada:**
```
⚡ Rate Limit: 1000 req/min per IP
```

### 4. Testar Endpoint de Validação

```bash
curl -X POST http://localhost:3000/api/validate-license \
  -H "Content-Type: application/json" \
  -d '{
    "whatsapp": "5511999999999",
    "fingerprint": "test-fingerprint-123"
  }'
```

---

## 🐛 Troubleshooting

### Container não inicia

```bash
# Verificar logs detalhados
docker-compose logs --tail=100 vps

# Verificar se as portas estão disponíveis
netstat -tulpn | grep 3000

# Verificar variáveis de ambiente
docker-compose exec vps env | grep -E "NODE_ENV|WORKERS|DB_|REDIS_"
```

### Banco de dados não conecta

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Testar conexão manualmente
docker-compose exec postgres psql -U afiliados_vps_user -d afiliados_vps_licenses -c "SELECT 1;"

# Verificar logs do PostgreSQL
docker-compose logs postgres
```

### Redis não conecta

```bash
# Verificar se Redis está rodando
docker-compose ps redis

# Testar conexão manualmente
docker-compose exec redis redis-cli ping

# Verificar logs do Redis
docker-compose logs redis
```

### Performance baixa

```bash
# Verificar uso de CPU e memória
docker stats

# Verificar conexões do banco
docker-compose exec postgres psql -U afiliados_vps_user -d afiliados_vps_licenses -c "SELECT count(*) FROM pg_stat_activity;"

# Verificar cache hit rate
docker-compose exec redis redis-cli INFO stats | grep keyspace
```

---

## 🔙 Rollback (Se Necessário)

Se algo der errado, você pode fazer rollback para a versão anterior:

```bash
# 1. Parar o container atual
docker-compose stop vps

# 2. Editar docker-compose.yml e mudar a tag da imagem
# De: ghcr.io/sxconnect/afiliados-vps:2.0.0
# Para: ghcr.io/sxconnect/afiliados-vps:1.0.0 (ou versão anterior)

# 3. Restaurar backup do .env (se necessário)
cp .env.backup_YYYYMMDD_HHMMSS .env

# 4. Iniciar com a versão anterior
docker-compose up -d vps

# 5. Verificar
curl http://localhost:3000/health
```

---

## 📊 Monitoramento Contínuo

### Logs em Tempo Real

```bash
# Todos os logs
docker-compose logs -f

# Apenas VPS
docker-compose logs -f vps

# Últimas 100 linhas
docker-compose logs --tail=100 vps
```

### Métricas de Performance

```bash
# CPU e Memória
docker stats vps

# Conexões do banco
watch -n 5 'docker-compose exec postgres psql -U afiliados_vps_user -d afiliados_vps_licenses -c "SELECT count(*) FROM pg_stat_activity;"'

# Cache stats
watch -n 5 'docker-compose exec redis redis-cli INFO stats'
```

---

## ✅ Checklist Pós-Deploy

- [ ] Container VPS rodando
- [ ] Health check retornando 200 OK
- [ ] Versão 2.0.0 confirmada
- [ ] 2 workers ativos
- [ ] PostgreSQL conectado
- [ ] Redis conectado
- [ ] Rate limiting ativo (1000 req/min)
- [ ] Endpoints funcionando
- [ ] Logs sem erros
- [ ] Performance dentro do esperado

---

## 🎯 Próximos Passos

1. **Executar Testes de Carga**
   - Seguir: `CHECKLIST_VALIDACAO_10K.md`
   - Validar performance real

2. **Configurar Monitoramento**
   - Logs centralizados
   - Alertas de erro
   - Métricas de performance

3. **Documentar Resultados**
   - Preencher checklist de validação
   - Registrar métricas reais
   - Atualizar documentação

---

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs: `docker-compose logs vps`
2. Verificar health: `curl http://localhost:3000/health`
3. Consultar troubleshooting acima
4. Fazer rollback se necessário

---

**Sem marketing. Sem suposição. Baseado em engenharia.**

**Status:** ✅ IMAGEM PUBLICADA - PRONTA PARA DEPLOY
