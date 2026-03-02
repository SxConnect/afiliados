# 🧪 Teste Local da VPS

Guia rápido para testar o módulo VPS localmente antes do deploy.

## 1️⃣ Build da Imagem

```bash
# Windows
cd afiliado/vps
docker build -t ghcr.io/sxconnect/afiliados-vps:latest .

# Linux/Mac
cd afiliado/vps
./build-and-push.sh
```

## 2️⃣ Teste Rápido

```bash
# Iniciar container de teste
docker run --rm -d \
  --name vps-test \
  -p 4000:4000 \
  -e JWT_SECRET=test-secret-123 \
  -e LICENSE_SECRET=license-secret-456 \
  -e PORT=4000 \
  ghcr.io/sxconnect/afiliados-vps:latest

# Aguardar 5 segundos
sleep 5

# Testar health check
curl http://localhost:4000/health

# Parar container
docker stop vps-test
```

## 3️⃣ Teste Completo com Docker Compose

```bash
# Iniciar todos os serviços
docker-compose -f docker-compose.yml up -d

# Ver logs
docker-compose -f docker-compose.yml logs -f vps

# Testar API
curl http://localhost:4000/health
curl http://localhost:4000/api/plans

# Parar serviços
docker-compose -f docker-compose.yml down
```

## 4️⃣ Teste de Validação de Licença

```bash
# Validar licença (deve retornar plano free)
curl -X POST http://localhost:4000/api/validate-license \
  -H "Content-Type: application/json" \
  -d '{
    "whatsapp": "5511999999999",
    "fingerprint": "test-machine-123"
  }'

# Verificar quota
curl -X POST http://localhost:4000/api/check-quota \
  -H "Content-Type: application/json" \
  -d '{
    "whatsapp": "5511999999999",
    "token": "TOKEN_RECEBIDO_NA_VALIDACAO"
  }'
```

## 5️⃣ Verificar Logs

```bash
# Logs do VPS
docker logs afiliados_vps_server

# Logs do PostgreSQL
docker logs afiliados_vps_postgres

# Logs do Redis
docker logs afiliados_vps_redis
```

## ✅ Checklist de Testes

- [ ] Build da imagem sem erros
- [ ] Container inicia corretamente
- [ ] Health check retorna status OK
- [ ] Endpoint /api/plans retorna lista de planos
- [ ] Validação de licença funciona
- [ ] PostgreSQL conecta e cria tabelas
- [ ] Redis conecta e armazena cache
- [ ] Logs não mostram erros

## 🚀 Próximo Passo

Se todos os testes passarem, você pode fazer o push para o GHCR:

```bash
# Windows
build-and-push.bat

# Linux/Mac
./push-to-ghcr.sh
```
