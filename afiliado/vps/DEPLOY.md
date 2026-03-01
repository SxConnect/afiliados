# 🚀 Guia de Deploy - VPS License Server

Este guia mostra como fazer deploy do servidor VPS usando Docker e GHCR.

## 📋 Pré-requisitos

- Docker instalado
- Conta no GitHub
- Acesso ao repositório
- Token do GitHub (para GHCR)

## 🔑 Configurar Acesso ao GHCR

### 1. Criar Personal Access Token

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Selecione os escopos:
   - `write:packages`
   - `read:packages`
   - `delete:packages`
4. Copie o token gerado

### 2. Fazer Login no GHCR

```bash
# Linux/Mac
echo $GITHUB_TOKEN | docker login ghcr.io -u SEU_USERNAME --password-stdin

# Windows (PowerShell)
$env:GITHUB_TOKEN | docker login ghcr.io -u SEU_USERNAME --password-stdin

# Windows (CMD)
echo %GITHUB_TOKEN% | docker login ghcr.io -u SEU_USERNAME --password-stdin
```

## 🏗️ Build e Push Manual

### Opção 1: Script Automatizado

```bash
# Linux/Mac
chmod +x build-and-push.sh
./build-and-push.sh latest

# Windows
build-and-push.bat latest
```

### Opção 2: Comandos Manuais

```bash
# 1. Build da imagem
docker build -t ghcr.io/sxconnect/afiliados/vps:latest .

# 2. Testar localmente
docker run -d -p 4001:4000 --name test-vps ghcr.io/sxconnect/afiliados/vps:latest
curl http://localhost:4001/api/plans
docker stop test-vps && docker rm test-vps

# 3. Push para GHCR
docker push ghcr.io/sxconnect/afiliados/vps:latest
```

## 🤖 Build Automático (GitHub Actions)

O workflow está configurado em `.github/workflows/vps-docker.yml`.

### Trigger Automático

O build é disparado automaticamente quando:
- Há push na branch `main`
- Há mudanças na pasta `vps/`
- Há mudanças no workflow

### Trigger Manual

```bash
# Via GitHub CLI
gh workflow run vps-docker.yml

# Ou pela interface do GitHub:
# Actions > Build and Push VPS Docker Image > Run workflow
```

### Verificar Status

```bash
# Via GitHub CLI
gh run list --workflow=vps-docker.yml

# Ou acesse:
# https://github.com/SxConnect/afiliados/actions
```

## 🚀 Deploy em Servidor

### 1. Preparar Servidor

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
cat > .env << EOF
VPS_PORT=4000
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
$(openssl genrsa 2048 | grep -v "BEGIN\|END")
-----END RSA PRIVATE KEY-----"
EOF
```

### 3. Baixar docker-compose.yml

```bash
# Opção 1: Clonar repositório
git clone https://github.com/SxConnect/afiliados.git
cd afiliados/vps

# Opção 2: Baixar apenas o arquivo
curl -O https://raw.githubusercontent.com/SxConnect/afiliados/main/vps/docker-compose.yml
```

### 4. Iniciar Serviço

```bash
# Fazer login no GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u SEU_USERNAME --password-stdin

# Baixar imagem
docker pull ghcr.io/sxconnect/afiliados/vps:latest

# Iniciar serviço
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

### 5. Verificar Funcionamento

```bash
# Health check
curl http://localhost:4000/api/plans

# Deve retornar:
# {"success":true,"plans":[...]}
```

## 🔄 Atualização

```bash
# 1. Baixar nova versão
docker-compose pull

# 2. Reiniciar serviço
docker-compose up -d

# 3. Remover imagens antigas
docker image prune -f
```

## 🌐 Configurar Domínio e SSL

### Com Traefik

```yaml
# docker-compose.yml
version: '3.8'

services:
  vps:
    image: ghcr.io/sxconnect/afiliados/vps:latest
    networks:
      - traefik-public
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.vps.rule=Host(`vps.seudominio.com`)"
      - "traefik.http.routers.vps.entrypoints=websecure"
      - "traefik.http.routers.vps.tls.certresolver=letsencrypt"
      - "traefik.http.services.vps.loadbalancer.server.port=4000"

networks:
  traefik-public:
    external: true
```

### Com Nginx

```nginx
# /etc/nginx/sites-available/vps
server {
    listen 80;
    server_name vps.seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name vps.seudominio.com;

    ssl_certificate /etc/letsencrypt/live/vps.seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vps.seudominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoramento

### Logs

```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver últimas 100 linhas
docker-compose logs --tail 100

# Ver logs de um período
docker-compose logs --since 1h
```

### Métricas

```bash
# Uso de recursos
docker stats afiliados-vps

# Health check
docker inspect --format='{{.State.Health.Status}}' afiliados-vps
```

### Alertas

Configure alertas para:
- Container parado
- Health check falhando
- Uso de CPU > 80%
- Uso de memória > 80%
- Disco cheio

## 🔒 Segurança

### Firewall

```bash
# Permitir apenas porta 4000
sudo ufw allow 4000/tcp
sudo ufw enable
```

### Limitar Acesso

```bash
# Permitir apenas IPs específicos
sudo ufw allow from 192.168.1.0/24 to any port 4000
```

### Backup

```bash
# Backup do .env
cp .env .env.backup

# Backup do banco de dados (quando implementar)
docker exec afiliados-vps pg_dump -U postgres > backup.sql
```

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs de erro
docker-compose logs

# Verificar configuração
docker-compose config

# Verificar variáveis de ambiente
docker exec afiliados-vps env
```

### Porta já em uso

```bash
# Verificar o que está usando a porta
sudo lsof -i :4000

# Matar processo
sudo kill -9 $(sudo lsof -t -i:4000)
```

### Imagem não encontrada

```bash
# Verificar se está logado
docker login ghcr.io

# Verificar se a imagem existe
docker pull ghcr.io/sxconnect/afiliados/vps:latest

# Tornar imagem pública (se necessário)
# GitHub > Packages > afiliados/vps > Package settings > Change visibility
```

### Health check falhando

```bash
# Testar manualmente
docker exec afiliados-vps curl http://localhost:4000/api/plans

# Ver logs
docker logs afiliados-vps

# Reiniciar container
docker-compose restart
```

## 📚 Recursos Adicionais

- [README da VPS](./README.md)
- [Documentação da API](../docs/API_DOCUMENTATION.md)
- [Fluxo de Validação](../docs/FLUXO_VALIDACAO.md)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

## 🆘 Suporte

Para problemas:
1. Verifique os logs: `docker-compose logs`
2. Teste a API: `curl http://localhost:4000/api/plans`
3. Abra uma issue: https://github.com/SxConnect/afiliados/issues
