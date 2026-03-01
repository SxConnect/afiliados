# ✅ Checklist - Etapa 1: VPS Deploy

## 📋 Pré-Deploy

### Arquivos Criados
- [x] `vps/Dockerfile` - Multi-stage build otimizado
- [x] `vps/.dockerignore` - Arquivos ignorados no build
- [x] `vps/.env.example` - Exemplo de variáveis
- [x] `vps/docker-compose.yml` - Stack para Portainer
- [x] `vps/README.md` - Documentação da VPS
- [x] `vps/test-api.sh` - Script de testes
- [x] `.github/workflows/docker-publish.yml` - CI/CD
- [x] `docs/ETAPA1_DEPLOY_GUIDE.md` - Guia completo

### Código Atualizado
- [x] `vps/server.js` - Health check melhorado
- [x] `vps/server.js` - Versão da API
- [x] `vps/server.js` - Graceful shutdown
- [x] `vps/server.js` - Error handlers
- [x] `vps/server.js` - Chave privada opcional

---

## 🐳 Docker

### Dockerfile
- [x] Node 20-alpine como base
- [x] Multi-stage build
- [x] Usuário não-root (nodejs:1001)
- [x] Camadas otimizadas
- [x] Porta 3000 exposta
- [x] Healthcheck configurado
- [x] Labels OCI

### Build Local (Opcional)
```bash
cd afiliado/vps
docker build -t afiliado-vps:test .
docker run -p 3000:3000 afiliado-vps:test
curl http://localhost:3000/health
```

- [ ] Build local executado
- [ ] Container iniciou sem erros
- [ ] Health check retornou 200

---

## 🚀 GitHub Actions

### Workflow
- [x] Arquivo em `.github/workflows/docker-publish.yml`
- [x] Trigger em push para main
- [x] Trigger em tags v*.*.*
- [x] Login no GHCR
- [x] Build multi-platform (amd64, arm64)
- [x] Cache habilitado
- [x] Tags automáticas (latest, version)

### Execução
```bash
git add .
git commit -m "feat: add VPS Docker setup"
git push origin main
```

- [ ] Push para main executado
- [ ] Workflow iniciou no GitHub Actions
- [ ] Build completou com sucesso
- [ ] Imagem publicada no GHCR

### Verificação GHCR
- [ ] Acessar: `https://github.com/SxConnect/afiliados/pkgs/container/afiliados`
- [ ] Imagem `latest` disponível
- [ ] Tag com versão disponível
- [ ] Comando de pull funciona

---

## 📦 Portainer Deploy

### Preparação
- [ ] VPS com Docker instalado
- [ ] Portainer rodando
- [ ] Traefik configurado
- [ ] Network `portainer_default` existe
- [ ] DNS apontando para VPS

### Variáveis de Ambiente
```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=<gerado>
LICENSE_SECRET=<gerado>
```

- [ ] Secrets gerados
- [ ] Variáveis configuradas no Portainer

### Deploy
- [ ] Stack criada no Portainer
- [ ] Nome: `afiliado-license-api`
- [ ] docker-compose.yml colado
- [ ] Variáveis adicionadas
- [ ] Deploy executado

### Verificação Container
- [ ] Container `afiliado_license_api` rodando
- [ ] Status: **healthy**
- [ ] Logs sem erros
- [ ] Restart policy: **always**

---

## 🌐 Traefik

### Labels Configuradas
- [x] `traefik.enable=true`
- [x] Router rule com domínio
- [x] EntryPoint: websecure
- [x] TLS habilitado
- [x] Certresolver configurado
- [x] Service port: 3000
- [x] Network: portainer_default
- [x] Rate limiting (opcional)

### Verificação
- [ ] Traefik Dashboard mostra router
- [ ] Router status: **OK** (verde)
- [ ] Certificado SSL válido
- [ ] Domínio resolve corretamente

---

## ✅ Testes de Validação

### 1. Health Check
```bash
curl https://api.afiliado.sxconnect.com.br/health
```

**Esperado:**
- [ ] HTTP 200
- [ ] JSON com status "ok"
- [ ] Versão "1.0.0"
- [ ] Uptime presente
- [ ] Memory info presente

### 2. License Status
```bash
curl https://api.afiliado.sxconnect.com.br/api/license/status
```

**Esperado:**
- [ ] HTTP 200
- [ ] Status "active"
- [ ] Features array presente

### 3. Validate User
```bash
curl -X POST https://api.afiliado.sxconnect.com.br/api/v1/validate \
  -H "Content-Type: application/json" \
  -d '{"phone":"5511999999999","fingerprint":"test-123"}'
```

**Esperado:**
- [ ] HTTP 200
- [ ] valid: true
- [ ] user object presente
- [ ] token object presente
- [ ] signature presente

### 4. Check Quota
```bash
curl https://api.afiliado.sxconnect.com.br/api/v1/quota/{userId} \
  -H "Authorization: Bearer {token}"
```

**Esperado:**
- [ ] HTTP 200
- [ ] used, limit, remaining presentes

### 5. SSL/TLS
```bash
curl -I https://api.afiliado.sxconnect.com.br/health
```

**Esperado:**
- [ ] HTTP/2 200
- [ ] Certificado válido
- [ ] Sem warnings SSL

### 6. 404 Handler
```bash
curl https://api.afiliado.sxconnect.com.br/invalid
```

**Esperado:**
- [ ] HTTP 404
- [ ] JSON com error "Not found"

### 7. 401 Unauthorized
```bash
curl https://api.afiliado.sxconnect.com.br/api/v1/quota/test \
  -H "Authorization: Bearer invalid"
```

**Esperado:**
- [ ] HTTP 401
- [ ] JSON com error "Sessão inválida"

---

## 📊 Monitoramento

### Container Health
- [ ] Healthcheck passando (30s interval)
- [ ] Container não reiniciando
- [ ] Logs sem erros críticos

### Performance
- [ ] Response time < 100ms
- [ ] Memory usage < 200MB
- [ ] CPU usage < 10%

### Logs
```bash
docker logs afiliado_license_api --tail 100
```

**Verificar:**
- [ ] Sem erros
- [ ] Startup messages corretos
- [ ] Requests sendo logados

---

## 🔄 Atualização

### Nova Versão
```bash
git tag v1.0.1
git push origin v1.0.1
```

- [ ] Tag criada
- [ ] Workflow executou
- [ ] Nova imagem no GHCR

### Redeploy
- [ ] Pull and redeploy no Portainer
- [ ] Container atualizado
- [ ] Testes passando

---

## 📈 Métricas de Sucesso

| Métrica | Alvo | Status |
|---------|------|--------|
| Build Time | < 5 min | [ ] |
| Image Size | < 100MB | [ ] |
| Startup Time | < 5s | [ ] |
| Response Time | < 100ms | [ ] |
| Uptime | 99.9% | [ ] |
| SSL Grade | A+ | [ ] |

---

## 🎯 Critérios de Aceitação

### Obrigatórios
- [ ] Imagem no GHCR
- [ ] Deploy via Portainer funcional
- [ ] Traefik resolvendo com HTTPS
- [ ] Healthcheck ativo
- [ ] Restart automático
- [ ] Todos os endpoints funcionando
- [ ] Logs sem erros
- [ ] Documentação completa

### Opcionais
- [ ] Rate limiting configurado
- [ ] Métricas coletadas
- [ ] Alertas configurados
- [ ] Backup configurado

---

## ✅ Validação Final

### Checklist Executivo
- [ ] **Build**: Imagem criada e publicada
- [ ] **Deploy**: Container rodando no Portainer
- [ ] **Network**: Traefik + SSL funcionando
- [ ] **Health**: Healthcheck passando
- [ ] **API**: Todos endpoints testados
- [ ] **Docs**: Guia de deploy completo
- [ ] **Tests**: Suite de testes executada

### Aprovação
- [ ] Todos os testes passaram
- [ ] Performance aceitável
- [ ] Sem erros críticos
- [ ] Documentação revisada

---

## 🎉 Etapa 1 Completa!

Se todos os itens acima estão marcados, a **Etapa 1** foi concluída com sucesso!

**Próximos passos:**
- Etapa 2: Core Engine (Go)
- Etapa 3: UI (Electron)
- Etapa 4: Integração completa

---

**Data de Conclusão**: ___/___/______  
**Responsável**: _________________  
**Aprovado por**: _________________

---

**Versão**: 1.0.0  
**Última Atualização**: Março 2024
