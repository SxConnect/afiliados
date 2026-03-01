# Guia de Início Rápido

## 🚀 Setup em 5 Minutos

### 1. Instalar Dependências

```bash
# Node.js 18+ e Go 1.21+ necessários
node --version
go version
```

### 2. Configurar Pastorini API

```bash
# Obter credenciais da Pastorini API
# 1. Acesse o painel da Pastorini
# 2. Crie uma instância do WhatsApp
# 3. Copie o ID da instância e API Key

# Configurar variáveis de ambiente
cp .env.example .env

# Editar .env e adicionar:
# PASTORINI_API_KEY=sua-chave-api
# PASTORINI_INSTANCE_ID=sua-instancia-id
```

### 3. Configurar VPS

```bash
cd vps
npm install
npm run generate-keys
npm start
```

✅ VPS rodando em http://localhost:3000

### 4. Configurar Core

```bash
cd core
go mod download

# Copiar chave pública
cp ../vps/keys/public.pem ./keys/public.pem

# Build
go build -o afiliado-core.exe main.go

# Executar
./afiliado-core.exe
```

✅ Core rodando em porta dinâmica

### 5. Configurar UI

```bash
cd ui
npm install
npm run electron:dev
```

✅ Aplicação aberta!

## 🎯 Primeiro Login

1. Abra a aplicação
2. Digite um número de WhatsApp (qualquer um para teste)
3. Clique em "Entrar"
4. Você será redirecionado para o Dashboard

## 📊 Testar Funcionalidades

### Dashboard
- Visualize quota disponível
- Veja plugins ativos
- Status da conta

### Plugins
- Navegue até a página de Plugins
- Veja plugins disponíveis
- (Requer upgrade de plano para ativar)

### Settings
- Configure suas API keys (Groq/OpenAI)
- Veja informações da conta

## 🔧 Desenvolvimento

### Hot Reload UI
```bash
cd ui
npm run dev
```

### Rebuild Core
```bash
cd core
go build -o afiliado-core.exe main.go
```

### Logs
- Core: Console onde foi executado
- VPS: Console do servidor
- UI: DevTools (F12)

## 📦 Build para Produção

```bash
# Core
cd core
go build -ldflags="-s -w" -o afiliado-core.exe main.go

# UI
cd ui
npm run electron:build
```

Executável em: `ui/dist/`

## 🐛 Troubleshooting

### Core não inicia
```bash
# Verificar porta disponível
netstat -ano | findstr :8080

# Verificar chave pública
ls core/keys/public.pem
```

### UI não conecta
```bash
# Verificar se Core está rodando
curl http://localhost:8080/api/v1/status
```

### VPS não responde
```bash
# Verificar processo
ps aux | grep node

# Reiniciar
pm2 restart afiliado-vps
```

## 📚 Próximos Passos

1. Leia [ARCHITECTURE.md](docs/ARCHITECTURE.md)
2. Explore [PLUGINS.md](docs/PLUGINS.md)
3. Configure [DEPLOYMENT.md](docs/DEPLOYMENT.md)
4. Entenda [SECURITY.md](docs/SECURITY.md)

## 💡 Dicas

- Use `free` plan para testes
- Crie plugins customizados
- Configure CI/CD
- Monitore métricas

## 🆘 Ajuda

- Issues: GitHub Issues
- Docs: `/docs`
- Community: Discord (futuro)


## 🔌 Integração Pastorini API

O sistema utiliza a Pastorini API para validação de números WhatsApp.

### Configuração Rápida

1. **Obter Credenciais**
   - Acesse o painel da Pastorini API
   - Crie uma instância do WhatsApp
   - Copie o ID da instância e API Key

2. **Configurar Variáveis**
```bash
# .env
PASTORINI_API_KEY=sua-chave-api-pastorini
PASTORINI_INSTANCE_ID=afiliado-validation
VPS_ENDPOINT=https://sua-api-pastorini.com
```

3. **Testar Validação**
```bash
# Testar endpoint
curl -X GET "https://sua-api.com/api/instances/afiliado-validation/check-number/5511999999999" \
  -H "x-api-key: SUA_CHAVE"
```

### Documentação Completa

Veja [PASTORINI_INTEGRATION.md](docs/PASTORINI_INTEGRATION.md) para:
- Fluxo completo de validação
- Tratamento de erros
- Segurança e boas práticas
- Troubleshooting
