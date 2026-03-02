# ✅ Push para GHCR - Sucesso!

## 🎉 Imagens Publicadas

As imagens Docker da VPS foram enviadas com sucesso para o GitHub Container Registry!

### 📦 Imagens Disponíveis

```
ghcr.io/sxconnect/afiliados-vps:latest
ghcr.io/sxconnect/afiliados-vps:1.2.0
```

### 🔗 Links

- **Registry**: https://github.com/SxConnect/afiliados/pkgs/container/afiliados-vps
- **Digest**: `sha256:653bb043ad1fdff9cd5f682e43dac174aaa8e5741cd7709b729c5207e81e4244`
- **Size**: 198MB (compressed: 48.7MB)

## 📥 Como Usar

### Pull da Imagem

```bash
# Última versão
docker pull ghcr.io/sxconnect/afiliados-vps:latest

# Versão específica
docker pull ghcr.io/sxconnect/afiliados-vps:1.2.0
```

### Executar Localmente

```bash
docker run -d \
  --name afiliados-vps \
  -p 4000:4000 \
  -e JWT_SECRET=seu-secret \
  -e LICENSE_SECRET=seu-secret \
  ghcr.io/sxconnect/afiliados-vps:latest
```

### Docker Compose

```yaml
services:
  vps:
    image: ghcr.io/sxconnect/afiliados-vps:latest
    # ou
    image: ghcr.io/sxconnect/afiliados-vps:1.2.0
```

## 🚀 Deploy no Portainer

Agora você pode fazer o deploy no Portainer:

1. Acesse o Portainer
2. Vá em **Stacks** > **Add Stack**
3. Cole o conteúdo de `afiliado/vps/docker-compose.production.yml`
4. Configure as variáveis de ambiente:
   ```env
   JWT_SECRET=gere-com-openssl
   LICENSE_SECRET=gere-com-openssl
   DB_PASSWORD=senha-segura
   REDIS_PASSWORD=senha-segura
   VPS_DOMAIN=vps.afiliados.seudominio.com.br
   ```
5. Clique em **Deploy**

## 📋 Checklist de Deploy

- [x] Build da imagem local
- [x] Teste local da imagem
- [x] Login no GHCR
- [x] Push da imagem :latest
- [x] Push da imagem :1.2.0
- [ ] Deploy no Portainer
- [ ] Configurar domínio no Traefik
- [ ] Testar em produção
- [ ] Integrar com Core

## 🔧 Configuração do Portainer

### Stack Name
```
afiliados-vps
```

### Environment Variables
```env
JWT_SECRET=
LICENSE_SECRET=
DB_PASSWORD=
REDIS_PASSWORD=
VPS_DOMAIN=vps.afiliados.seudominio.com.br
REDIS_COMMANDER_PASSWORD=
REDIS_COMMANDER_HTPASSWD=
```

### Networks
- `afiliados_vps_network` (criada automaticamente)
- `portainer_default` (deve existir - rede do Traefik)

### Volumes
- `afiliados_vps_postgres_data`
- `afiliados_vps_redis_data`

## 🧪 Testes Pós-Deploy

```bash
# Health check
curl https://vps.afiliados.seudominio.com.br/health

# Listar planos
curl https://vps.afiliados.seudominio.com.br/api/plans

# Validar licença
curl -X POST https://vps.afiliados.seudominio.com.br/api/validate-license \
  -H "Content-Type: application/json" \
  -d '{
    "whatsapp": "5511999999999",
    "fingerprint": "test-machine-123"
  }'
```

## 📊 Informações Técnicas

### Imagem Base
- Node.js 20 Alpine
- Multi-stage build
- Container não-root
- Dumb-init para gerenciamento de processos

### Portas
- 4000 (API)

### Dependências
- PostgreSQL 15 Alpine
- Redis 7 Alpine
- Redis Commander (opcional)

### Segurança
- JWT para autenticação
- HMAC para assinatura
- Rate limiting (100 req/15min)
- HTTPS obrigatório
- Secrets em variáveis de ambiente

## 📚 Documentação

- [README.md](../afiliado/vps/README.md) - Visão geral
- [DEPLOY.md](../afiliado/vps/DEPLOY.md) - Guia de deploy
- [PORTAINER_DEPLOY.md](../afiliado/vps/PORTAINER_DEPLOY.md) - Deploy no Portainer
- [TEST_LOCAL.md](../afiliado/vps/TEST_LOCAL.md) - Testes locais

## ✨ Próximos Passos

1. **Deploy no Portainer**
   - Usar o docker-compose.production.yml
   - Configurar variáveis de ambiente
   - Deploy

2. **Configurar Traefik**
   - Adicionar domínio
   - Configurar SSL
   - Testar acesso HTTPS

3. **Testar em Produção**
   - Health check
   - Validação de licença
   - Consumo de quota
   - Validação de plugin

4. **Integrar com Core**
   - Atualizar URL da VPS no Core
   - Testar fluxo completo
   - Monitorar logs

## 🎯 Status

**IMAGENS PUBLICADAS COM SUCESSO** ✅

As imagens estão disponíveis no GHCR e prontas para deploy em produção!
