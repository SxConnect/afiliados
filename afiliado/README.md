# Sistema de Afiliados - WhatsApp Automation

Sistema profissional de automação de WhatsApp para afiliados com validação de licenças em múltiplas camadas.

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

## 🚀 Funcionalidades

- ✅ **Validação em 5 Camadas**: WhatsApp, Banco de Dados, Status, Expiração, Machine Fingerprint
- ✅ **Sistema de Planos**: Free, Basic, Growth, Pro com controle de quota
- ✅ **Interface Moderna**: Electron + React + TypeScript + Tailwind CSS
- ✅ **Segurança Robusta**: JWT, RSA-2048, Machine Fingerprint, Rate Limiting
- ✅ **Sistema de Plugins**: Arquitetura modular com permissões por plano
- ✅ **API REST Completa**: 20+ endpoints documentados
- ✅ **Docker Ready**: Imagens otimizadas para produção

## 📦 Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    UI (Electron + React)                │
│  - Login, Dashboard, Plugins, Settings                 │
│  Porta: 3000                                            │
└─────────────────────────────────────────────────────────┘
                        ↓ HTTP
┌─────────────────────────────────────────────────────────┐
│                Core Engine (Node.js)                    │
│  - API REST, Integração PAPI/VPS, Plugins              │
│  Porta: 3001                                            │
└─────────────────────────────────────────────────────────┘
         ↓ HTTP                    ↓ HTTP
┌──────────────────┐      ┌──────────────────┐
│   PAPI API       │      │   VPS Server     │
│  (WhatsApp)      │      │  (Validação)     │
│  Porta: 3000     │      │  Porta: 4000     │
└──────────────────┘      └──────────────────┘
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Docker (opcional)

### Instalação

```bash
# 1. Clonar repositório
git clone https://github.com/SxConnect/afiliados.git
cd afiliados

# 2. Instalar dependências
npm install
cd vps && npm install && cd ..
cd ui && npm install && cd ..

# 3. Configurar variáveis de ambiente
cp .env.example .env
cp vps/.env.example vps/.env

# 4. Iniciar servidores
npm start          # Core Engine (porta 3001)
npm run vps        # VPS Server (porta 4000)
npm run ui         # UI (porta 3000)
```

### Teste Rápido

```bash
# Executar testes automatizados
npm test

# Resultado esperado: 8/8 testes passando
```

## 🐳 Docker

### VPS Server

```bash
# Pull da imagem
docker pull ghcr.io/sxconnect/afiliados/vps:latest

# Executar
docker run -d -p 4000:4000 \
  -e JWT_SECRET=seu-secret \
  ghcr.io/sxconnect/afiliados/vps:latest

# Ou com docker-compose
cd vps
docker-compose up -d
```

Documentação completa: [vps/DEPLOY.md](./vps/DEPLOY.md)

## 📖 Documentação

### Essencial
- [API Documentation](./docs/API_DOCUMENTATION.md) - Endpoints e exemplos
- [Architecture](./docs/ARCHITECTURE.md) - Arquitetura do sistema
- [VPS Deploy Guide](./vps/DEPLOY.md) - Deploy do servidor VPS

### Guias
- [Fluxo de Validação](./docs/FLUXO_VALIDACAO.md) - Detalhes técnicos
- [Início Rápido](./docs/INICIO_RAPIDO.md) - Primeiros passos
- [Exemplos de Uso](./docs/EXEMPLOS_USO.md) - Casos práticos

### Planejamento
Documentos de planejamento e desenvolvimento estão em: `../planejamento/`

## 🔐 Segurança

### Validação em 5 Camadas

1. **WhatsApp (PAPI API)** - Verifica se número está registrado
2. **Banco de Dados (VPS)** - Verifica licença ativa
3. **Status** - Verifica se não está desativada
4. **Expiração** - Verifica se não expirou
5. **Machine Fingerprint** - Controla dispositivo autorizado

### Tecnologias de Segurança

- JWT Tokens com expiração de 24h
- Assinatura criptográfica RSA-2048
- Machine Fingerprint único por dispositivo
- Rate Limiting (100 req/15min)
- CORS configurado
- Helmet para headers de segurança

## 📊 Planos Disponíveis

| Plano   | Quota      | Plugins | Preço     |
|---------|------------|---------|-----------|
| Free    | 10/mês     | 0       | R$ 0      |
| Basic   | 100/mês    | 1       | R$ 29,90  |
| Growth  | 500/mês    | 2       | R$ 79,90  |
| Pro     | Ilimitado  | Todos   | R$ 199,90 |

### Licenças de Teste

```
Pro:    5511999999999
Growth: 5511888888888
Basic:  5511777777777
```

## 🔌 API Endpoints

### Públicos
- `GET /health` - Health check
- `POST /api/license/validate` - Validar licença

### Protegidos (requer JWT)
- `GET /api/license/status` - Status da licença
- `GET /api/metrics/quota` - Verificar quota
- `GET /api/plugins` - Listar plugins
- `POST /api/whatsapp/send/text` - Enviar mensagem

Documentação completa: [docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)

## 🧪 Testes

```bash
# Testes automatizados
npm test

# Testes manuais via curl
curl http://localhost:3001/health
curl -X POST http://localhost:3001/api/license/validate \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"5511999999999","instanceId":"test"}'
```

## 🛠️ Desenvolvimento

### Estrutura do Projeto

```
afiliado/
├── core/              # Core Engine (Node.js)
│   ├── routes/        # Rotas da API
│   ├── services/      # Serviços (PAPI, VPS)
│   └── middleware/    # Middlewares (auth)
├── vps/               # VPS Server (validação)
├── ui/                # Interface (Electron + React)
│   ├── src/
│   │   ├── pages/     # Páginas
│   │   ├── components/# Componentes
│   │   └── services/  # API client
├── plugins/           # Sistema de plugins
├── docker/            # Configuração Docker
├── docs/              # Documentação
└── scripts/           # Scripts de automação
```

### Scripts Disponíveis

```bash
npm start          # Iniciar Core Engine
npm run dev        # Modo desenvolvimento
npm run vps        # Iniciar VPS Server
npm run ui         # Iniciar UI
npm test           # Executar testes
npm run build:ui   # Build da UI
```

## 🚀 Deploy

### VPS Server (Docker)

```bash
# Build e push para GHCR
cd vps
./build-and-push.sh latest

# Deploy em servidor
docker pull ghcr.io/sxconnect/afiliados/vps:latest
docker-compose up -d
```

Guia completo: [vps/DEPLOY.md](./vps/DEPLOY.md)

### Core Engine

```bash
# Build
npm install --production

# Iniciar com PM2
pm2 start core/core/server.js --name afiliados-core

# Ou com Docker
docker build -t afiliados-core -f docker/Dockerfile .
docker run -d -p 3001:3001 afiliados-core
```

## 📈 Monitoramento

### Health Checks

```bash
# Core Engine
curl http://localhost:3001/health

# VPS Server
curl http://localhost:4000/api/plans
```

### Logs

```bash
# Docker
docker logs -f afiliados-vps

# PM2
pm2 logs afiliados-core
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📝 Licença

Este projeto é proprietário. Todos os direitos reservados.

## 🔗 Links

- **Repositório**: https://github.com/SxConnect/afiliados
- **Docker Images**: https://github.com/SxConnect/afiliados/pkgs/container/afiliados%2Fvps
- **Issues**: https://github.com/SxConnect/afiliados/issues

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a [documentação](./docs/)
2. Verifique as [issues existentes](https://github.com/SxConnect/afiliados/issues)
3. Abra uma nova issue se necessário

---

**Desenvolvido com ❤️ para automação profissional de WhatsApp**
