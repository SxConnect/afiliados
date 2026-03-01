# VPS License Validation Server

Servidor de validação de licenças para o Sistema de Afiliados.

## 🚀 Funcionalidades

- ✅ Validação de licenças no banco de dados
- ✅ Verificação de status (ativa/inativa)
- ✅ Verificação de expiração
- ✅ Machine fingerprint (controle de dispositivos)
- ✅ Sistema de planos (Free, Basic, Growth, Pro)
- ✅ Controle de quota por plano
- ✅ Assinatura criptográfica RSA-2048
- ✅ API REST completa

## 📦 Imagem Docker

A imagem Docker está disponível no GitHub Container Registry:

```bash
docker pull ghcr.io/sxconnect/afiliados/vps:latest
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` com as seguintes variáveis:

```env
# Porta do servidor
VPS_PORT=4000

# Ambiente
NODE_ENV=production

# JWT Secret (deve ser o mesmo do Core Engine)
JWT_SECRET=seu-secret-super-seguro-aqui

# Chave Privada RSA para assinatura
PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----
```

## 🚀 Deploy com Docker

### Opção 1: Docker Run

```bash
docker run -d \
  --name afiliados-vps \
  -p 4000:4000 \
  -e VPS_PORT=4000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=seu-secret-aqui \
  --restart unless-stopped \
  ghcr.io/sxconnect/afiliados/vps:latest
```

### Opção 2: Docker Compose

```bash
# 1. Criar arquivo .env
cp .env.example .env
nano .env

# 2. Iniciar serviço
docker-compose up -d

# 3. Ver logs
docker-compose logs -f

# 4. Parar serviço
docker-compose down
```

## 🧪 Testar a API

### Health Check

```bash
curl http://localhost:4000/api/plans
```

### Validar Licença

```bash
curl -X POST http://localhost:4000/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "5511999999999",
    "machineId": "abc123...",
    "timestamp": 1234567890
  }'
```

### Verificar Quota

```bash
curl http://localhost:4000/api/quota \
  -H "Authorization: Bearer SEU_TOKEN"
```

## 📊 Endpoints Disponíveis

### Públicos

- `GET /api/plans` - Lista planos disponíveis

### Protegidos

- `POST /api/validate` - Valida licença
- `GET /api/quota` - Verifica quota disponível
- `POST /api/quota/consume` - Consome quota

## 🔒 Segurança

### Assinatura Criptográfica

Todas as respostas de validação são assinadas com RSA-2048:

```javascript
const signature = crypto
  .createSign('SHA256')
  .update(JSON.stringify(data))
  .sign(PRIVATE_KEY, 'base64');
```

### Machine Fingerprint

Controla o uso da licença por dispositivo:

- Primeiro login: Registra o machine ID
- Logins subsequentes: Valida contra o ID registrado
- Bloqueia uso em múltiplos dispositivos

## 📈 Monitoramento

### Health Check

O container possui health check automático:

```bash
docker ps
# Verifica a coluna STATUS: healthy/unhealthy
```

### Logs

```bash
# Ver logs em tempo real
docker logs -f afiliados-vps

# Ver últimas 100 linhas
docker logs --tail 100 afiliados-vps
```

### Métricas

```bash
# Uso de recursos
docker stats afiliados-vps
```

## 🔄 Atualização

```bash
# 1. Baixar nova versão
docker pull ghcr.io/sxconnect/afiliados/vps:latest

# 2. Parar container atual
docker stop afiliados-vps
docker rm afiliados-vps

# 3. Iniciar nova versão
docker-compose up -d

# Ou com docker run
docker run -d \
  --name afiliados-vps \
  -p 4000:4000 \
  --env-file .env \
  --restart unless-stopped \
  ghcr.io/sxconnect/afiliados/vps:latest
```

## 🗄️ Banco de Dados

Atualmente usa Map em memória. Para produção, migre para PostgreSQL:

### Estrutura da Tabela

```sql
CREATE TABLE licenses (
  phone_number VARCHAR(20) PRIMARY KEY,
  plan VARCHAR(20) NOT NULL,
  quota_total INTEGER NOT NULL,
  quota_used INTEGER DEFAULT 0,
  plugins TEXT[],
  active BOOLEAN DEFAULT true,
  machine_id VARCHAR(255),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

## 🔐 Licenças de Teste

```javascript
// Pro - Ilimitado
phoneNumber: '5511999999999'
plan: 'pro'
quota: 999999

// Growth - 500 mensagens
phoneNumber: '5511888888888'
plan: 'growth'
quota: 500

// Basic - 100 mensagens
phoneNumber: '5511777777777'
plan: 'basic'
quota: 100
```

## 📚 Documentação Adicional

- [Fluxo de Validação](../docs/FLUXO_VALIDACAO.md)
- [API Documentation](../docs/API_DOCUMENTATION.md)
- [Como Testar](../COMO_TESTAR.md)

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs de erro
docker logs afiliados-vps

# Verificar variáveis de ambiente
docker exec afiliados-vps env
```

### Porta já em uso

```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux
lsof -ti:4000 | xargs kill -9
```

### Health check falhando

```bash
# Testar manualmente
docker exec afiliados-vps node -e "require('http').get('http://localhost:4000/api/plans', (r) => console.log(r.statusCode))"
```

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs: `docker logs afiliados-vps`
2. Teste a API: `curl http://localhost:4000/api/plans`
3. Consulte a documentação completa

## 🔗 Links Úteis

- **Repositório**: https://github.com/SxConnect/afiliados
- **Imagem Docker**: https://github.com/SxConnect/afiliados/pkgs/container/afiliados%2Fvps
- **Issues**: https://github.com/SxConnect/afiliados/issues
