# ⚡ Quickstart - 10 Minutos

## 🎯 Objetivo

Ter o sistema completo rodando em 10 minutos!

## 📋 Pré-requisitos

- Node.js 20+
- npm ou yarn
- Git (opcional)

## 🚀 Passo a Passo

### 1. Instalar Dependências (3 min)

```bash
# Opção 1: Usando Makefile (recomendado)
make install

# Opção 2: Manual
npm install
cd vps && npm install && cd ..
cd ui && npm install && cd ..
```

### 2. Configurar Ambiente (2 min)

Edite o arquivo `.env`:

```env
# Core Engine
PORT=3001
NODE_ENV=development

# VPS
VPS_URL=http://localhost:4000/api

# PAPI (WhatsApp) - CONFIGURE AQUI
PAPI_URL=http://localhost:3000/api
PAPI_API_KEY=sua-chave-aqui

# JWT
JWT_SECRET=desenvolvimento-secret-key
```

### 3. Iniciar Sistema (2 min)

```bash
# Opção 1: Usando Makefile
make dev

# Opção 2: Manual (3 terminais)
# Terminal 1 - VPS
cd vps && npm start

# Terminal 2 - Core
npm start

# Terminal 3 - UI
cd ui && npm run dev
```

### 4. Acessar Interface (1 min)

Abra o navegador em: `http://localhost:5173`

### 5. Fazer Login (2 min)

Use uma das licenças de teste:

- **5511999999999** - Plano Pro (Ilimitado)
- **5511888888888** - Plano Growth (500 msgs)
- **5511777777777** - Plano Basic (100 msgs)

## ✅ Verificação

Após login, você deve ver:

1. ✅ Dashboard com estatísticas
2. ✅ Opção de criar instância WhatsApp
3. ✅ Plugins disponíveis
4. ✅ Configurações do sistema

## 🧪 Teste Rápido

### 1. Criar Instância WhatsApp

1. No Dashboard, digite um ID: `teste`
2. Clique em "Criar Instância"
3. Clique no ícone QR Code
4. Escaneie com WhatsApp

### 2. Enviar Mensagem

1. Aguarde status "CONNECTED"
2. Digite número: `5511888888888`
3. Digite mensagem: "Teste"
4. Clique "Enviar Mensagem"

## 🐛 Problemas Comuns

### Erro: "ECONNREFUSED"

**Solução:** Verifique se todos os servidores estão rodando

```bash
# Verificar processos
ps aux | grep node

# Reiniciar
make stop
make dev
```

### Erro: "PAPI_API_KEY inválida"

**Solução:** Configure a chave correta no `.env`

### Erro: "Port already in use"

**Solução:** Mate o processo na porta

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

## 📚 Próximos Passos

1. Explore os **Plugins** disponíveis
2. Configure **Webhooks** para receber mensagens
3. Teste **Agendamento** de mensagens
4. Configure **Respostas Automáticas**

## 🆘 Precisa de Ajuda?

- 📖 [Documentação Completa](./README.md)
- 🏗️ [Arquitetura](./docs/ARCHITECTURE.md)
- 💡 [Exemplos de Uso](./EXEMPLOS_USO.md)
- 🔧 [Troubleshooting](./docs/TROUBLESHOOTING.md)

---

**Tempo total:** ~10 minutos ⏱️

Bom desenvolvimento! 🚀
