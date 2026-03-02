# 🚀 VPS License Server

Servidor de validação de licenças para o sistema Afiliados. Este módulo roda na VPS e gerencia autenticação, planos e quotas.

## 📦 O que está incluído

### APIs e Serviços
- **API Pública (Port 4000)** - Validação de licenças, quotas e plugins
- **API Admin (Port 4001)** - Painel administrativo completo
- **Webhook API (Port 4002)** - Integração com Mercado Pago/Stripe
- **Admin Panel (Port 3001)** - Interface web Next.js

### Infraestrutura
- **PostgreSQL** - Banco de dados de licenças e entitlements
- **Redis** - Cache e filas (opcional)
- **Docker** - Containerização completa
- **Traefik** - Proxy reverso e SSL automático

### Sistema de Entitlements (FASE 2.5) ⭐ NOVO
- **Controle Granular de Permissões** - Features, quotas, plugins
- **Usage Counters** - Contadores atômicos de uso
- **Plugin Registry** - Registro dinâmico de plugins
- **Trials Automáticos** - Sistema de trials por plugin
- **Add-ons** - Complementos ao plano base
- **Overrides Administrativos** - Permissões customizadas

## 🏗️ Arquitetura

```
┌─────────────┐
│   Cliente   │ (Core .exe na máquina do usuário)
│  (Desktop)  │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐
│   Traefik   │ (Proxy + SSL)
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐     ┌─────────┐
│  VPS Server │────▶│  PostgreSQL  │     │  Redis  │
│   (Node.js) │     │  (Licenças)  │     │ (Cache) │
└─────────────┘     └──────────────┘     └─────────┘
```

## 🚀 Deploy Rápido

### 1. Build da Imagem

```bash
# Windows
build-and-push.bat

# Linux/Mac
./build-and-push.sh
```

### 2. Push para GHCR

```bash
# Windows
# O script build-and-push.bat já faz o push

# Linux/Mac
./push-to-ghcr.sh
```

### 3. Deploy no Portainer

1. Acesse o Portainer
2. Vá em **Stacks** > **Add Stack**
3. Cole o conteúdo de `docker-compose.production.yml`
4. Configure as variáveis de ambiente (veja `.env.production`)
5. Clique em **Deploy**

## 🔧 Configuração

### Variáveis de Ambiente Obrigatórias

```env
# JWT Secret (gere com: openssl rand -base64 32)
JWT_SECRET=seu-secret-super-seguro

# License Secret (gere com: openssl rand -base64 32)
LICENSE_SECRET=seu-license-secret

# Database
DB_PASSWORD=senha-postgres-segura

# Redis
REDIS_PASSWORD=senha-redis-segura

# Domínio
VPS_DOMAIN=vps.afiliados.seudominio.com.br
```

### Gerar Secrets

```bash
# JWT Secret
openssl rand -base64 32

# License Secret
openssl rand -base64 32

# Passwords
openssl rand -base64 24
```

## 📝 Endpoints da API

### Health Check
```bash
GET /health
```

### Listar Planos
```bash
GET /api/plans
```

### Validar Licença
```bash
POST /api/validate-license
{
  "whatsapp": "5511999999999",
  "fingerprint": "machine-id-123"
}
```

### Verificar Quota
```bash
POST /api/check-quota
{
  "whatsapp": "5511999999999",
  "token": "jwt-token"
}
```

### Consumir Quota
```bash
POST /api/consume-quota
{
  "whatsapp": "5511999999999",
  "token": "jwt-token",
  "amount": 1
}
```

### Validar Plugin
```bash
POST /api/validate-plugin
{
  "whatsapp": "5511999999999",
  "token": "jwt-token",
  "pluginId": "auto-responder"
}
```

## 🧪 Testes

Veja o guia completo em [TEST_LOCAL.md](./TEST_LOCAL.md)

```bash
# Teste rápido
docker run --rm -d \
  --name vps-test \
  -p 4000:4000 \
  -e JWT_SECRET=test \
  -e LICENSE_SECRET=test \
  ghcr.io/sxconnect/afiliados-vps:latest

curl http://localhost:4000/health
docker stop vps-test
```

## 📊 Banco de Dados

### Schema

- **licenses** - Licenças ativas
- **plans** - Planos disponíveis
- **quota_usage** - Histórico de uso
- **audit_logs** - Logs de auditoria

### Seed Data

O arquivo `seed.sql` cria:
- 3 planos (Free, Pro, Enterprise)
- 3 licenças de teste
- Dados de exemplo

## 🔒 Segurança

- ✅ JWT para autenticação
- ✅ HMAC para assinatura de dados
- ✅ Rate limiting (100 req/15min)
- ✅ HTTPS obrigatório (Traefik)
- ✅ Secrets em variáveis de ambiente
- ✅ Container não-root
- ✅ Health checks

## 📦 Volumes

```yaml
afiliados_vps_postgres_data  # Dados do PostgreSQL
afiliados_vps_redis_data     # Dados do Redis
```

## 🌐 Networks

```yaml
afiliados_vps_network   # Rede interna
portainer_default       # Rede do Traefik
```

## 📚 Documentação Adicional

### Guias de Deploy e Build
- [BUILD_NOW.md](./BUILD_NOW.md) - Guia de build
- [DEPLOY.md](./DEPLOY.md) - Guia de deploy
- [PORTAINER_DEPLOY.md](./PORTAINER_DEPLOY.md) - Deploy no Portainer
- [TEST_LOCAL.md](./TEST_LOCAL.md) - Testes locais

### Sistema de Entitlements (FASE 2.5) ⭐
- [ENTITLEMENTS_USAGE_GUIDE.md](./docs/ENTITLEMENTS_USAGE_GUIDE.md) - Guia completo de uso
- [COMANDOS_UTEIS.md](./COMANDOS_UTEIS.md) - Comandos úteis
- [README.md](./shared/entitlements/README.md) - README do módulo

### Documentação Técnica (Planejamento)
- [RELATORIO_AUDITORIA_FASE2.5.md](../planejamento/RELATORIO_AUDITORIA_FASE2.5.md) - Auditoria técnica
- [RESUMO_EXECUTIVO_FASE2.5.md](../planejamento/RESUMO_EXECUTIVO_FASE2.5.md) - Resumo executivo
- [INDICE_DOCUMENTACAO_FASE2.5.md](../planejamento/INDICE_DOCUMENTACAO_FASE2.5.md) - Índice completo

## 🆘 Troubleshooting

### Container não inicia

```bash
# Ver logs
docker logs afiliados_vps_server

# Verificar variáveis de ambiente
docker exec afiliados_vps_server env | grep -E "JWT|LICENSE|DB|REDIS"
```

### Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Testar conexão
docker exec afiliados_vps_postgres pg_isready -U afiliados_vps_user
```

### Erro de conexão com Redis

```bash
# Verificar se Redis está rodando
docker ps | grep redis

# Testar conexão
docker exec afiliados_vps_redis redis-cli -a $REDIS_PASSWORD ping
```

## 📞 Suporte

Para problemas ou dúvidas, consulte a documentação completa em `/docs`.
