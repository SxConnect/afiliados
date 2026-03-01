# 🚀 Deploy no Portainer - VPS Afiliados

Guia completo para deploy do sistema VPS no Portainer.

## 📋 Pré-requisitos

- Portainer instalado e configurado
- Traefik configurado na rede `portainer_default`
- Acesso ao GitHub Container Registry (GHCR)

## 🔑 Passo 1: Configurar Acesso ao GHCR

### 1.1. Criar Personal Access Token no GitHub

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Selecione: `read:packages`
4. Copie o token gerado

### 1.2. Adicionar Registry no Portainer

1. Portainer > Registries > Add registry
2. Selecione: "Custom registry"
3. Preencha:
   - Name: `GitHub Container Registry`
   - Registry URL: `ghcr.io`
   - Username: `seu-username-github`
   - Password: `seu-token-github`
4. Clique em "Add registry"

## 📝 Passo 2: Criar Stack no Portainer

### 2.1. Acessar Stacks

1. Portainer > Stacks > Add stack
2. Name: `afiliados-vps`
3. Build method: "Web editor"

### 2.2. Colar o docker-compose.yml

Cole o conteúdo do arquivo `docker-compose.production.yml`

### 2.3. Configurar Variáveis de Ambiente

Clique em "Add an environment variable" e adicione:

```
JWT_SECRET=seu-secret-super-seguro
DB_PASSWORD=senha-postgres-segura
REDIS_PASSWORD=senha-redis-segura
PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----...-----END RSA PRIVATE KEY-----
VPS_DOMAIN=vps.afiliados.seudominio.com
```

## 🚀 Passo 3: Deploy

1. Clique em "Deploy the stack"
2. Aguarde o download das imagens
3. Verifique os logs de cada container

## ✅ Passo 4: Verificar Funcionamento

### 4.1. Health Checks

```bash
curl https://vps.afiliados.seudominio.com/api/plans
```

### 4.2. Logs

No Portainer:
1. Stacks > afiliados-vps
2. Clique em cada container
3. Verifique os logs

## 📊 Monitoramento

- VPS: https://vps.afiliados.seudominio.com
- Redis Commander: https://redis.afiliados.seudominio.com

## 🔄 Atualização

1. Portainer > Stacks > afiliados-vps
2. Clique em "Pull and redeploy"
3. Aguarde a atualização

## 📚 Mais Informações

- [README da VPS](./README.md)
- [Deploy Guide](./DEPLOY.md)
