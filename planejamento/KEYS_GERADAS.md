# 🔐 Keys Geradas para VPS

## ⚠️ IMPORTANTE
**NUNCA compartilhe estas keys publicamente!**
Este arquivo é apenas para referência local.

## 📋 Variáveis de Ambiente para Portainer

Copie e cole estas variáveis no Portainer ao criar a stack:

```env
JWT_SECRET=MJmgSbbpt9O96INaUVLaHLOTIBuUSop2JMAw2XZlZcE=
LICENSE_SECRET=J4okJUcSTyI1f79wreUqby2zsG3PivyiRr80a57wYuk=
DB_PASSWORD=Yga7zRrKs6etrNanBCrkgSYkpg2t21t7
REDIS_PASSWORD=f1eXoVnvkyUF11QPKBnN5mqo/wdqY/NF
VPS_DOMAIN=vps.afiliados.sxconnect.com.br
REDIS_COMMANDER_PASSWORD=admin123
```

## 🔑 Detalhes das Keys

### JWT Secret
```
MJmgSbbpt9O96INaUVLaHLOTIBuUSop2JMAw2XZlZcE=
```
- **Uso**: Assinar tokens JWT de sessão
- **Algoritmo**: Base64 (32 bytes)
- **Comando**: `openssl rand -base64 32`

### License Secret
```
J4okJUcSTyI1f79wreUqby2zsG3PivyiRr80a57wYuk=
```
- **Uso**: Assinar dados de licença (HMAC)
- **Algoritmo**: Base64 (32 bytes)
- **Comando**: `openssl rand -base64 32`

### Database Password
```
Yga7zRrKs6etrNanBCrkgSYkpg2t21t7
```
- **Uso**: Senha do PostgreSQL
- **Algoritmo**: Base64 (24 bytes)
- **Comando**: `openssl rand -base64 24`

### Redis Password
```
f1eXoVnvkyUF11QPKBnN5mqo/wdqY/NF
```
- **Uso**: Senha do Redis
- **Algoritmo**: Base64 (24 bytes)
- **Comando**: `openssl rand -base64 24`

### RSA Private Key
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQClznFSRC/UBWg7
ZgtzDtaxiiPJlQx+1/aGoPRBqVm161Xi40FgacZoXq0LHY/QGJGapeLhkaQ1NFcQ
nnFrFezaEUHZ50ZQ2YESIU9uQlud/cIpx5eKZJncS21PIUiiXb6dLiwPExJK0Ebm
yoO+M0i6HtGIVf6s0Codf0SCWCUUH28qzikiRzwGiK4be8wDClbj8uIAnImIu/t5
ZmVqM1K9whk22PCFtDvL/FafbTwKTlIXjF3mqIGSND4fag+hsOeykbyWcqpJyLvb
2dYXxTrgfN/gLcrI3nGtOBdlUgU7GAh2DYHxePnoAEc+s3sAtCjieD81/iSdxyTO
2JX83qLRAgMBAAECggEAIoyZ4GKE9NELnxTsXdVBt0zpmB+Osv+dRwBS5Tu8jcOz
6csg3E4uIaFYvXAzf1EfRfI7DHWkmdGGMthRGdc/u1DNP/KJHF+2HWkDfB4nqQwv
YTVNxnCf/t9Yr5xn3i1agrYUSC/ZJ+2uWHjqar+U7/NsBdSldK0LmYnjZKWpVD/C
XjFbHPBQG2LUjvI05UTrTVFFWEWccmvHGbDp7AIMx9aa7rEUBe5w0lyFwDBOdTkS
/DrbTj5RqsgXXoba0A+HOKYd32gu4jlBsn2LXcMWGGKoAQkW2rQX2p0GJV9Ov024
1iQDBa6zAo6FTadRrjtqqB7YKy9QGh1dOp3KiDCmgQKBgQDhR+T7WsRupXbdfjbb
agZ/TjriT5wx3PdA4AC8QWomr9urCcCXtI7hBikKVDHctpfbS0DX0Sn68QI5Gc7R
Hol5J8F5l9Z2DU99N04xXf9HxX+aNXWiImSNKPbpMmOixvkjXmUMz+W818e544PO
HbP5b9oaQo4DAA3wUSNnak8V/QKBgQC8amohEFUd2BddZ02Q7R1TkZV0o7+d204S
1FXYm5bEY56xQ4P5mqkNX3H3Ba6TQ1/tU08hu6Ge53+qA/1zLCCL7uTV3MDUNbjo
o6jtjKk7oEyZbmkgVK/VizY35vGbUYsrzmGmSi9YVaDvNXT5au2455EXal/fc8d2
7a3jBm2uZQKBgQDRTpTnHCwJiV5o6A1byqSCv1JiVgkPIvfupLDKOBTCIP39abAw
wydE1w5mdFdnc5afvsleOw3AAxBHsTzAepjLoi5WJMazJCbIdgwGPgkiy9KEmkrS
+xVlObw+afy8jhWH0Pod70LKM8lzYnlhlaNTi6KeZ1u+WdyZfSlhuhoEmQKBgQCi
4V+T67mZTiiMr3QnmEPk7ZMFPVW2ElMBBhycX4zLg885MMOTcPc5v0wXHwtW9USl
NoLPB5RleX0srbxZ50jPj5q1otvz1+lc+7ZafWIDUMVHUmKA95T2Bx283+H3wluM
aCKUjcc2FvhEMrNHtv+A/Ha6hlQRKNbDYh8Thogk3QKBgEngKfGUJVyLQMptbR6j
ITW1uzSqr9x1XQpIZM+SoS5mZw8rLDXAE+UpDI5NVrYZv0eGnKGhBttKaLRzNOlP
4VUuWr6KG1uYinx+9SdMUpavjjZMla5Yo+dGXsrUs5qi12P6YepcvF7+jH2oy9to
otxq3/W8tvrIVttwfWMEtH8h
-----END PRIVATE KEY-----
```
- **Uso**: Criptografia assimétrica (futuro)
- **Algoritmo**: RSA 2048 bits
- **Comando**: `openssl genrsa 2048`

## 📝 Como Usar no Portainer

### Passo 1: Acessar Portainer
```
https://seu-portainer.com
```

### Passo 2: Criar Stack
1. Vá em **Stacks** > **Add Stack**
2. Nome: `afiliados-vps`
3. Build method: **Web editor**

### Passo 3: Cole o Docker Compose
Cole o conteúdo de `afiliado/vps/docker-compose.production.yml`

### Passo 4: Adicionar Variáveis de Ambiente
Clique em **Add an environment variable** e adicione:

| Name | Value |
|------|-------|
| JWT_SECRET | MJmgSbbpt9O96INaUVLaHLOTIBuUSop2JMAw2XZlZcE= |
| LICENSE_SECRET | J4okJUcSTyI1f79wreUqby2zsG3PivyiRr80a57wYuk= |
| DB_PASSWORD | Yga7zRrKs6etrNanBCrkgSYkpg2t21t7 |
| REDIS_PASSWORD | f1eXoVnvkyUF11QPKBnN5mqo/wdqY/NF |
| VPS_DOMAIN | vps.afiliados.sxconnect.com.br |
| REDIS_COMMANDER_PASSWORD | admin123 |

### Passo 5: Deploy
Clique em **Deploy the stack**

## 🔄 Regenerar Keys

Se precisar gerar novas keys:

```bash
# JWT Secret
openssl rand -base64 32

# License Secret
openssl rand -base64 32

# Database Password
openssl rand -base64 24

# Redis Password
openssl rand -base64 24

# RSA Private Key
openssl genrsa 2048
```

## 📁 Arquivos com as Keys

- `afiliado/vps/.env` - Desenvolvimento local
- `afiliado/vps/.env.production` - Produção (Portainer)

## ⚠️ Segurança

1. **NUNCA** commite arquivos .env no Git
2. Mantenha as keys em local seguro (1Password, Vault, etc)
3. Use keys diferentes para desenvolvimento e produção
4. Rotacione as keys periodicamente
5. Em produção, use secrets do Docker/Kubernetes

## 🔗 Links Úteis

- [OpenSSL Documentation](https://www.openssl.org/docs/)
- [JWT.io](https://jwt.io/)
- [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)
