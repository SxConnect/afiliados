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
├── core/                  # Engine Go
├── vps/                   # Servidor de validação
├── plugins/               # Plugins modulares
├── shared/                # Tipos compartilhados
└── docs/                  # Documentação
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- Go 1.21+
- Git

### Instalação

```bash
# 1. Clonar repositório
git clone https://github.com/SxConnect/afiliados.git
cd afiliados

# 2. Instalar tudo
make install

# 3. Gerar chaves de segurança
cd vps && npm run generate-keys

# 4. Executar
make run
```

Veja [QUICKSTART.md](QUICKSTART.md) para guia detalhado.

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

---

**Versão**: 1.2.0  
**Node.js**: 20+  
**Go**: 1.21+  
**Docker**: 20.10+

Feito com ❤️ para afiliados profissionais
