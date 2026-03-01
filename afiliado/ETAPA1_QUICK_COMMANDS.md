# 🚀 Comandos Rápidos - Etapa 1

## Git

```bash
# Remover lock (se necessário)
rm .git/index.lock

# Adicionar arquivos
git add .

# Commit
git commit -m "feat: add VPS license API with Docker and GitHub Actions"

# Push
git push origin main
```

## Docker Local (Opcional)

```bash
# Build local
cd afiliado/vps
docker build -t afiliado-license-api:local .

# Rodar local
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name license-api-test \
  afiliado-license-api:local

# Ver logs
docker logs -f license-api-test

# Parar e remover
docker stop license-api-test
docker rm license-api-test
```

## Testes Local

```bash
# Healthcheck
curl http://localhost:3000/health

# Validar licença
curl -X POST http://localhost:3000/api/validate-license \
  -H "Content-Type: application/json" \
  -d '{"whatsapp":"5511999999999","fingerprint":"test123"}'

# Rodar script de testes completo
cd afiliado/vps
chmod +x test-api.sh
./test-api.sh
```

## Testes Produção (VPS)

```bash
# Healthcheck
curl https://api.afiliado.sxconnect.com.br/health

# Validar licença
curl -X POST https://api.afiliado.sxconnect.com.br/api/validate-license \
  -H "Content-Type: application/json" \
  -d '{"whatsapp":"5511999999999","fingerprint":"prod-test-123"}'

# Rodar script de testes completo
export API_URL=https://api.afiliado.sxconnect.com.br
./test-api.sh
```

## GitHub Actions

```bash
# Ver status do workflow
# Acesse: https://github.com/SxConnect/afiliados/actions

# Verificar imagem no GHCR
# Acesse: https://github.com/SxConnect/afiliados/pkgs/container/afiliados
```

## Portainer

```bash
# Acessar Portainer
# URL: https://portainer.seudominio.com.br

# Deploy via CLI (alternativa)
docker stack deploy -c docker-compose.yml afiliado-license-api
```

## Logs e Debug

```bash
# Ver logs do container (via Docker)
docker logs -f afiliado_license_api

# Ver logs últimas 100 linhas
docker logs --tail 100 afiliado_license_api

# Ver logs com timestamp
docker logs -t afiliado_license_api

# Entrar no container
docker exec -it afiliado_license_api sh

# Ver status do container
docker ps | grep afiliado

# Ver healthcheck status
docker inspect afiliado_license_api | grep -A 10 Health
```

## Traefik

```bash
# Ver routers configurados
# Acesse: https://traefik.seudominio.com.br/dashboard

# Verificar certificado SSL
openssl s_client -connect api.afiliado.sxconnect.com.br:443 -servername api.afiliado.sxconnect.com.br

# Testar resolução DNS
nslookup api.afiliado.sxconnect.com.br
```

## Troubleshooting

```bash
# Container não inicia
docker logs afiliado_license_api
docker inspect afiliado_license_api

# Traefik não resolve
docker logs traefik
# Verificar labels no container
docker inspect afiliado_license_api | grep -A 20 Labels

# Healthcheck falhando
curl http://localhost:3000/health
docker exec afiliado_license_api wget -O- http://localhost:3000/health

# Rebuild forçado
docker pull ghcr.io/sxconnect/afiliados:latest
docker-compose up -d --force-recreate
```

## Variáveis de Ambiente

```bash
# Gerar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Gerar LICENSE_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Testar variáveis
docker exec afiliado_license_api env | grep -E "JWT_SECRET|LICENSE_SECRET"
```

## Limpeza

```bash
# Parar stack
docker-compose down

# Remover imagens antigas
docker image prune -a

# Remover volumes não usados
docker volume prune
```
