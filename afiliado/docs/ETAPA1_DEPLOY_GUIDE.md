# 🚀 Guia de Deploy - Etapa 1: VPS License API

## Visão Geral

Este guia detalha o processo completo de deploy da API de validação de licenças na VPS usando Docker, GHCR e Traefik.

## Pré-requisitos

- VPS com Docker instalado
- Portainer instalado e rodando
- Traefik configurado como reverse proxy
- Domínio configurado (ex: api.afiliado.sxconnect.com.br)
- Repositório GitHub: https://github.com/SxConnect/afiliados

## Passo 1: Preparar Código Local

### 1.1 Verificar Estrutura
```bash
cd H:/dev-afiliado/afiliado
ls -la vps/
```

Arquivos necessários:
- `vps/Dockerfile`
- `vps/server.js`
- `vps/package.json`
- `vps/docker-compose.yml`
- `vps/.env.example`
- `.github/workflows/docker-publish.yml`

### 1.2 Remover Lock do Git (se necessário)
```bash
rm .git/index.lock
```

### 1.3 Commit e Push
```bash
git add .
git commit -m "feat: add VPS license API with Docker and GitHub Actions"
git push origin main
```

## Passo 2: Verificar Build no GitHub Actions

### 2.1 Acessar Actions

1. Acesse: https://github.com/SxConnect/afiliados/actions
2. Verifique se o workflow "Docker Build and Push" foi executado
3. Aguarde conclusão (geralmente 2-5 minutos)

### 2.2 Verificar Imagem no GHCR

1. Acesse: https://github.com/SxConnect/afiliados/pkgs/container/afiliados
2. Confirme que a imagem `latest` está disponível
3. Anote a URL: `ghcr.io/sxconnect/afiliados:latest`

## Passo 3: Deploy no Portainer

### 3.1 Acessar Portainer

1. Acesse sua instância do Portainer
2. Selecione o environment (local ou remoto)
3. Vá em "Stacks" > "Add Stack"

### 3.2 Configurar Stack

**Nome da Stack:** `afiliado-license-api`

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  license-api:
    image: ghcr.io/sxconnect/afiliados:latest
    container_name: afiliado_license_api
    restart: always
    networks:
      - portainer_default
    environment:
      - NODE_ENV=production
      - PORT=3000
      - JWT_SECRET=${JWT_SECRET}
      - LICENSE_SECRET=${LICENSE_SECRET}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.afiliado-api.rule=Host(`api.afiliado.sxconnect.com.br`)"
      - "traefik.http.routers.afiliado-api.entrypoints=websecure"
      - "traefik.http.routers.afiliado-api.tls=true"
      - "traefik.http.routers.afiliado-api.tls.certresolver=leresolver"
      - "traefik.http.services.afiliado-api.loadbalancer.server.port=3000"
      - "traefik.docker.network=portainer_default"
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  portainer_default:
    external: true
```

### 3.3 Configurar Variáveis de Ambiente

Adicione as seguintes variáveis:

```
JWT_SECRET=<gerar-secret-64-chars>
LICENSE_SECRET=<gerar-secret-64-chars>
```

Para gerar secrets seguros:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3.4 Deploy

1. Clique em "Deploy the stack"
2. Aguarde o pull da imagem
3. Verifique se o container iniciou com sucesso

## Passo 4: Validar Deploy

### 4.1 Verificar Container

No Portainer:
1. Vá em "Containers"
2. Localize `afiliado_license_api`
3. Status deve estar "running"
4. Health deve estar "healthy"

### 4.2 Verificar Logs

```bash
docker logs afiliado_license_api
```

Deve mostrar:
```
✅ License API Server running on port 3000
📊 Environment: production
🔒 Security: JWT + HMAC signatures enabled
```

### 4.3 Testar Healthcheck

```bash
curl https://api.afiliado.sxconnect.com.br/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "uptime": 123.45
}
```

### 4.4 Testar API

```bash
curl -X POST https://api.afiliado.sxconnect.com.br/api/validate-license \
  -H "Content-Type: application/json" \
  -d '{"whatsapp":"5511999999999","fingerprint":"test123"}'
```

## Passo 5: Verificar Traefik

### 5.1 Dashboard Traefik

1. Acesse o dashboard do Traefik
2. Verifique se o router `afiliado-api` está ativo
3. Confirme que o certificado SSL foi emitido

### 5.2 Testar HTTPS

```bash
curl -I https://api.afiliado.sxconnect.com.br/health
```

Deve retornar HTTP 200 com certificado válido.

## Troubleshooting

### Container não inicia

```bash
# Ver logs
docker logs afiliado_license_api

# Verificar variáveis
docker exec afiliado_license_api env | grep SECRET
```

### Traefik não resolve

```bash
# Verificar labels
docker inspect afiliado_license_api | grep -A 20 Labels

# Ver logs do Traefik
docker logs traefik
```

### Healthcheck falhando

```bash
# Testar internamente
docker exec afiliado_license_api wget -O- http://localhost:3000/health

# Verificar porta
docker port afiliado_license_api
```

### Certificado SSL não emitido

1. Verificar DNS do domínio
2. Verificar configuração do certresolver no Traefik
3. Aguardar alguns minutos para emissão

## Comandos Úteis

```bash
# Restart container
docker restart afiliado_license_api

# Ver logs em tempo real
docker logs -f afiliado_license_api

# Entrar no container
docker exec -it afiliado_license_api sh

# Rebuild e redeploy
docker pull ghcr.io/sxconnect/afiliados:latest
docker-compose up -d --force-recreate
```

## Próximos Passos

1. ✅ Configurar monitoramento
2. ✅ Configurar backup
3. ✅ Documentar API para o Core
4. ✅ Implementar integração no Desktop App

## Suporte

Consulte também:
- `ETAPA1_CHECKLIST.md` - Checklist completo
- `ETAPA1_QUICK_COMMANDS.md` - Comandos rápidos
- `vps/README.md` - Documentação da API
