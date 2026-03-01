# Comandos Rápidos - Etapa 1

## 🚀 Deploy Rápido

### 1. Push para GitHub (CI/CD Automático)
```bash
cd afiliado
git add .
git commit -m "feat: VPS Docker setup for GHCR"
git push origin main
```

### 2. Verificar Build no GitHub
```bash
# Abrir no navegador
https://github.com/SxConnect/afiliados/actions
```

### 3. Deploy no Portainer
```bash
# Via interface web:
# 1. Stacks → Add Stack
# 2. Nome: afiliado-license-api
# 3. Colar docker-compose.yml
# 4. Adicionar variáveis de ambiente
# 5. Deploy
```

---

## 🧪 Testes Rápidos

### Local
```bash
# Health check
curl http://localhost:3000/health | jq

# License status
curl http://localhost:3000/api/license/status | jq

# Validate user
curl -X POST http://localhost:3000/api/v1/validate \
  -H "Content-Type: application/json" \
  -d '{"phone":"5511999999999","fingerprint":"test-123"}' | jq
```

### Produção
```bash
# Health check
curl https://api.afiliado.sxconnect.com.br/health | jq

# License status
curl https://api.afiliado.sxconnect.com.br/api/license/status | jq

# Validate user
curl -X POST https://api.afiliado.sxconnect.com.br/api/v1/validate \
  -H "Content-Type: application/json" \
  -d '{"phone":"5511999999999","fingerprint":"test-123"}' | jq
```

### Suite Completa
```bash
cd afiliado/vps
chmod +x test-api.sh
./test-api.sh https://api.afiliado.sxconnect.com.br
```

---

## 🐳 Docker Local

### Build
```bash
cd afiliado/vps
docker build -t afiliado-vps:test .
```

### Run
```bash
docker run -d \
  --name afiliado-vps-test \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=test-secret \
  afiliado-vps:test
```

### Logs
```bash
docker logs afiliado-vps-test -f
```

### Stop & Remove
```bash
docker stop afiliado-vps-test
docker rm afiliado-vps-test
```

---

## 📦 GHCR

### Pull Imagem
```bash
docker pull ghcr.io/sxconnect/afiliados:latest
```

### Run da Imagem GHCR
```bash
docker run -d \
  --name afiliado-vps \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secret \
  ghcr.io/sxconnect/afiliados:latest
```

---

## 🔧 Troubleshooting

### Ver Logs
```bash
# Portainer
# Containers → afiliado_license_api → Logs

# Docker CLI
docker logs afiliado_license_api -f --tail 100
```

### Verificar Health
```bash
docker inspect afiliado_license_api | grep -A 10 Health
```

### Restart Container
```bash
docker restart afiliado_license_api
```

### Verificar Networks
```bash
docker inspect afiliado_license_api | grep -A 10 Networks
```

### Verificar Variáveis
```bash
docker inspect afiliado_license_api | grep -A 20 Env
```

---

## 🌐 Traefik

### Verificar Router
```bash
# Traefik Dashboard
https://traefik.seudominio.com/dashboard/

# Ou via API
curl https://traefik.seudominio.com/api/http/routers | jq
```

### Testar SSL
```bash
openssl s_client -connect api.afiliado.sxconnect.com.br:443
```

### Verificar Certificado
```bash
curl -vI https://api.afiliado.sxconnect.com.br/health 2>&1 | grep -A 10 "SSL certificate"
```

---

## 🔄 Atualização

### Nova Versão
```bash
# Criar tag
git tag v1.0.1
git push origin v1.0.1

# Aguardar build no GitHub Actions
# Verificar em: https://github.com/SxConnect/afiliados/actions
```

### Atualizar no Portainer
```bash
# Via interface:
# Stacks → afiliado-license-api → Pull and redeploy

# Ou via CLI na VPS:
docker pull ghcr.io/sxconnect/afiliados:latest
docker-compose up -d
```

---

## 📊 Monitoramento

### Stats do Container
```bash
docker stats afiliado_license_api
```

### Processos
```bash
docker top afiliado_license_api
```

### Uso de Disco
```bash
docker system df
```

### Limpar Imagens Antigas
```bash
docker image prune -a
```

---

## 🔐 Secrets

### Gerar JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Gerar License Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Gerar Chaves RSA
```bash
cd afiliado/vps
npm run generate-keys
```

---

## 📝 Variáveis de Ambiente

### Mínimas (Produção)
```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=<gerado>
LICENSE_SECRET=<gerado>
```

### Completas (Opcional)
```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=<gerado>
RSA_PRIVATE_KEY=<base64>
RSA_PUBLIC_KEY=<base64>
LICENSE_SECRET=<gerado>
DATABASE_URL=postgresql://...
LOG_LEVEL=info
CORS_ORIGIN=*
```

---

## 🎯 Checklist Rápido

```bash
# 1. Build & Push
git push origin main

# 2. Verificar GHCR
https://github.com/SxConnect/afiliados/pkgs/container/afiliados

# 3. Deploy Portainer
# (via interface web)

# 4. Testar Health
curl https://api.afiliado.sxconnect.com.br/health

# 5. Testar API
curl https://api.afiliado.sxconnect.com.br/api/license/status

# 6. Verificar Logs
docker logs afiliado_license_api

# 7. Verificar Health Status
docker inspect afiliado_license_api | grep Health

# ✅ Etapa 1 Completa!
```

---

## 📚 Links Úteis

- **GitHub Repo**: https://github.com/SxConnect/afiliados
- **GitHub Actions**: https://github.com/SxConnect/afiliados/actions
- **GHCR Package**: https://github.com/SxConnect/afiliados/pkgs/container/afiliados
- **Guia Completo**: [ETAPA1_DEPLOY_GUIDE.md](docs/ETAPA1_DEPLOY_GUIDE.md)
- **Checklist**: [ETAPA1_CHECKLIST.md](ETAPA1_CHECKLIST.md)

---

**Versão**: 1.0.0  
**Última Atualização**: Março 2024
