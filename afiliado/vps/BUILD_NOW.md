# 🚀 Build e Push da Imagem VPS - AGORA

## Passo 1: Login no GHCR

```powershell
# Substitua SEU_USERNAME e SEU_TOKEN
$env:GITHUB_TOKEN = "seu_token_aqui"
echo $env:GITHUB_TOKEN | docker login ghcr.io -u SEU_USERNAME --password-stdin
```

## Passo 2: Build da Imagem

```powershell
cd vps
docker build -t ghcr.io/sxconnect/afiliados/vps:latest .
```

## Passo 3: Testar Localmente

```powershell
# Criar .env temporário
@"
JWT_SECRET=test-secret
DB_PASSWORD=test-password
REDIS_PASSWORD=test-redis
PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----
"@ | Out-File -FilePath .env.test

# Rodar container de teste
docker run -d -p 4001:4000 --name test-vps --env-file .env.test ghcr.io/sxconnect/afiliados/vps:latest

# Aguardar 5 segundos
Start-Sleep -Seconds 5

# Testar
curl http://localhost:4001/api/plans

# Ver logs
docker logs test-vps

# Parar e remover
docker stop test-vps
docker rm test-vps
```

## Passo 4: Push para GHCR

```powershell
docker push ghcr.io/sxconnect/afiliados/vps:latest
```

## Passo 5: Verificar no GitHub

Acesse: https://github.com/SxConnect/afiliados/pkgs/container/afiliados%2Fvps

## Passo 6: Deploy no Portainer

1. Portainer > Stacks > Add stack
2. Name: `afiliados-vps`
3. Cole o `docker-compose.production.yml`
4. Adicione as variáveis de ambiente
5. Deploy!

## ⚡ Atalho (Script Automatizado)

```powershell
# Windows
.\build-and-push.bat latest

# Ou manualmente
docker build -t ghcr.io/sxconnect/afiliados/vps:latest .
docker push ghcr.io/sxconnect/afiliados/vps:latest
```
