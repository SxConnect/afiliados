# 🚀 Sistema Profissional de Escala para Afiliados

Sistema desktop híbrido de alta performance com arquitetura modular, segura e escalável para criação e gestão de conteúdo para afiliados.

## ✨ Características Principais

- 🖥️ **Desktop Nativo**: Electron + React para interface moderna
- ⚡ **Core em Go**: Performance e segurança máximas
- 🔐 **Segurança Robusta**: Múltiplas camadas de proteção
- 🧩 **Sistema de Plugins**: Arquitetura modular extensível
- 💰 **Monetização Híbrida**: Assinaturas + plugins + quota
- 📊 **Analytics Integrado**: Métricas e insights em tempo real
- 🌐 **Validação Remota**: Controle centralizado via VPS

## 🏗️ Arquitetura

```
┌─────────────────┐
│   UI (Electron) │  ← Interface do usuário
│   React + TS    │
└────────┬────────┘
         │ API Local
┌────────▼────────┐
│  Core Engine    │  ← Lógica de negócio
│      Go         │     Segurança
└────────┬────────┘     Plugins
         │ HTTPS
┌────────▼────────┐
│   VPS Server    │  ← Validação
│    Node.js      │     Licenças
└────────┬────────┘     Quota
         │
┌────────▼────────┐
│ Pastorini API   │  ← Validação WhatsApp
│   WhatsApp      │     Verificação de números
└─────────────────┘
```

### Camadas

- **UI Layer**: Electron + React + TypeScript
- **Core Engine**: Go (microservidor local)
- **VPS**: Node.js (servidor de validação)
- **Pastorini API**: Validação de números WhatsApp
- **Shared**: Tipos e contratos compartilhados

## 📁 Estrutura do Projeto

```
afiliado/
├── ui/                    # Interface Electron + React
│   ├── electron/          # Processo principal
│   ├── src/               # Código React
│   │   ├── pages/         # Páginas da aplicação
│   │   └── services/      # Serviços e API
│   └── package.json
├── core/                  # Engine Go
│   ├── internal/
│   │   ├── api/           # Servidor HTTP
│   │   ├── config/        # Configurações
│   │   ├── plugins/       # Sistema de plugins
│   │   ├── security/      # Criptografia
│   │   └── vps/           # Cliente VPS
│   ├── main.go
│   └── go.mod
├── vps/                   # Servidor de validação
│   ├── server.js          # API REST
│   ├── scripts/           # Utilitários
│   └── package.json
├── plugins/               # Plugins modulares
│   └── example-plugin/
├── shared/                # Tipos compartilhados
│   └── types.ts
└── docs/                  # Documentação
    ├── ARCHITECTURE.md
    ├── PLUGINS.md
    ├── SECURITY.md
    ├── DEPLOYMENT.md
    └── MONETIZATION.md
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- Go 1.21+
- Git

### Instalação

```bash
# 1. Clonar repositório
git clone <repo-url>
cd afiliado

# 2. Instalar tudo
make install

# 3. Gerar chaves de segurança
cd vps && npm run generate-keys

# 4. Executar
make run
```

Veja [QUICKSTART.md](QUICKSTART.md) para guia detalhado.

## 🔐 Segurança

Sistema com múltiplas camadas de proteção:

- ✅ Assinatura criptográfica RSA-2048
- ✅ Validação remota obrigatória
- ✅ Controle de quota na VPS
- ✅ Fingerprint de máquina
- ✅ Tokens temporários assinados
- ✅ Plugins remotamente controlados
- ✅ Verificação de integridade

Objetivo: **Tornar crack economicamente inviável**

Leia mais em [SECURITY.md](docs/SECURITY.md)

## 💰 Modelo de Negócio

### Planos

| Plano | Preço | Vídeos/mês | Plugins | Features |
|-------|-------|------------|---------|----------|
| Free | R$ 0 | 10 | 0 | Básico |
| Base | R$ 97 | 100 | 1 | Métricas |
| Growth | R$ 297 | 500 | 3 | Analytics |
| Pro | R$ 997 | 10.000 | Todos | White Label |

### Receitas

- 📅 Assinaturas mensais/anuais
- 🧩 Plugins modulares pagos
- 📊 Quota adicional (pay-as-you-go)
- 🎨 Templates premium (futuro)

Detalhes em [MONETIZATION.md](docs/MONETIZATION.md)

## 🧩 Sistema de Plugins

Arquitetura modular que permite extensão via plugins:

```javascript
// plugins/meu-plugin/index.js
module.exports = {
  name: 'Meu Plugin',
  version: '1.0.0',
  
  async init(context) {
    // Inicialização
  },
  
  async execute(params) {
    // Lógica do plugin
    return { success: true };
  }
};
```

Veja [PLUGINS.md](docs/PLUGINS.md) para criar seus plugins.

## 📊 Features

### Dashboard
- Visão geral da conta
- Quota disponível
- Plugins ativos
- Métricas em tempo real

### Plugins
- Marketplace de plugins
- Ativação remota
- Versionamento
- Permissões granulares

### Settings
- Configuração de API keys
- Preferências do usuário
- Informações da conta

## 🛠️ Desenvolvimento

### Comandos

```bash
# Instalar dependências
make install

# Build completo
make build

# Executar em dev
make run

# Testes
make test

# Limpar builds
make clean
```

### Estrutura de Dev

```bash
# Terminal 1 - VPS
cd vps && npm start

# Terminal 2 - Core
cd core && go run main.go

# Terminal 3 - UI
cd ui && npm run electron:dev
```

## 📦 Deploy

### VPS (Servidor)

```bash
# Docker
docker-compose up -d

# Ou manual
cd vps
npm install --production
pm2 start server.js
```

### Desktop (Executável)

```bash
cd ui
npm run electron:build
```

Veja [DEPLOYMENT.md](docs/DEPLOYMENT.md) para guia completo.

## 🧪 Testes

```bash
# Core (Go)
cd core && go test ./...

# UI (TypeScript)
cd ui && npm test

# VPS (Node.js)
cd vps && npm test
```

## 📚 Documentação

- [Arquitetura](docs/ARCHITECTURE.md) - Design do sistema
- [Plugins](docs/PLUGINS.md) - Criar plugins
- [Segurança](docs/SECURITY.md) - Modelo de segurança
- [Deploy](docs/DEPLOYMENT.md) - Guia de deploy
- [Monetização](docs/MONETIZATION.md) - Modelo de negócio
- [Pastorini Integration](docs/PASTORINI_INTEGRATION.md) - Integração WhatsApp
- [Início Rápido](QUICKSTART.md) - Setup em 5 minutos

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 Licença

MIT License - veja [LICENSE](LICENSE)

## 🆘 Suporte

- 📖 Documentação: `/docs`
- 🐛 Issues: GitHub Issues
- 💬 Community: Discord (em breve)

## 🗺️ Roadmap

### Q1 2024
- ✅ Arquitetura base
- ✅ Sistema de plugins
- ✅ Planos Base e Growth
- 🔄 Sistema de pagamento

### Q2 2024
- 🔄 Plano Pro
- 🔄 5 plugins adicionais
- 🔄 Analytics avançado
- 🔄 API pública

### Q3 2024
- 📅 Marketplace de plugins
- 📅 Templates premium
- 📅 White label
- 📅 Mobile app

### Q4 2024
- 📅 SaaS version
- 📅 Enterprise features
- 📅 Integrações avançadas

---

Feito com ❤️ para afiliados profissionais


## 🚢 Deploy

### Etapa 1: VPS License API

A VPS está pronta para deploy com Docker, GHCR e Traefik:

```bash
# 1. Push para GitHub (CI/CD automático)
git push origin main

# 2. Deploy via Portainer
# Usar: afiliado/vps/docker-compose.yml

# 3. Verificar
curl https://api.afiliado.sxconnect.com.br/health
```

**Documentação completa:**
- [Guia de Deploy Etapa 1](docs/ETAPA1_DEPLOY_GUIDE.md)
- [Checklist Etapa 1](ETAPA1_CHECKLIST.md)
- [VPS README](vps/README.md)

**Recursos:**
- ✅ Dockerfile multi-stage otimizado
- ✅ GitHub Actions para GHCR
- ✅ Docker Compose para Portainer
- ✅ Labels Traefik configuradas
- ✅ Healthcheck implementado
- ✅ Script de testes incluído
