# Estrutura Completa do Projeto

```
afiliado/
│
├── 📄 README.md                    # Documentação principal
├── 📄 LICENSE                      # Licença MIT
├── 📄 CHANGELOG.md                 # Histórico de mudanças
├── 📄 CONTRIBUTING.md              # Guia de contribuição
├── 📄 QUICKSTART.md                # Início rápido
├── 📄 VERSION                      # Versão atual
├── 📄 .gitignore                   # Arquivos ignorados
├── 📄 .env.example                 # Exemplo de variáveis
├── 📄 Makefile                     # Automação de comandos
├── 📄 docker-compose.yml           # Orquestração Docker
│
├── 📁 .github/                     # Configurações GitHub
│   ├── workflows/
│   │   └── ci.yml                  # Pipeline CI/CD
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── pull_request_template.md
│
├── 📁 docs/                        # Documentação completa
│   ├── 📄 ARCHITECTURE.md          # Arquitetura do sistema
│   ├── 📄 PLUGINS.md               # Sistema de plugins
│   ├── 📄 SECURITY.md              # Modelo de segurança
│   ├── 📄 DEPLOYMENT.md            # Guia de deploy
│   ├── 📄 MONETIZATION.md          # Modelo de negócio
│   ├── 📄 API.md                   # Documentação da API
│   ├── 📄 ROADMAP.md               # Roadmap do produto
│   ├── 📄 FAQ.md                   # Perguntas frequentes
│   └── 📄 EXECUTIVE_SUMMARY.md     # Resumo executivo
│
├── 📁 shared/                      # Tipos compartilhados
│   └── 📄 types.ts                 # Interfaces TypeScript
│
├── 📁 ui/                          # Interface Electron + React
│   ├── 📄 package.json             # Dependências Node
│   ├── 📄 tsconfig.json            # Config TypeScript
│   ├── 📄 tsconfig.node.json       # Config Node
│   ├── 📄 vite.config.ts           # Config Vite
│   ├── 📄 index.html               # HTML principal
│   │
│   ├── 📁 electron/                # Processo principal Electron
│   │   ├── 📄 main.js              # Entry point
│   │   └── 📄 preload.js           # Preload script
│   │
│   └── 📁 src/                     # Código React
│       ├── 📄 main.tsx             # Entry point React
│       ├── 📄 App.tsx              # Componente raiz
│       ├── 📄 index.css            # Estilos globais
│       │
│       ├── 📁 pages/               # Páginas da aplicação
│       │   ├── 📄 Login.tsx
│       │   ├── 📄 Login.css
│       │   ├── 📄 Dashboard.tsx
│       │   ├── 📄 Dashboard.css
│       │   ├── 📄 Plugins.tsx
│       │   ├── 📄 Plugins.css
│       │   ├── 📄 Settings.tsx
│       │   └── 📄 Settings.css
│       │
│       └── 📁 services/            # Serviços
│           └── 📄 api.ts           # Cliente API
│
├── 📁 core/                        # Engine Go
│   ├── 📄 go.mod                   # Dependências Go
│   ├── 📄 main.go                  # Entry point
│   │
│   └── 📁 internal/                # Código interno
│       ├── 📁 api/                 # Servidor HTTP
│       │   └── 📄 server.go
│       │
│       ├── 📁 config/              # Configurações
│       │   └── 📄 config.go
│       │
│       ├── 📁 plugins/             # Sistema de plugins
│       │   └── 📄 manager.go
│       │
│       ├── 📁 security/            # Segurança
│       │   ├── 📄 crypto.go
│       │   └── 📄 fingerprint.go
│       │
│       └── 📁 vps/                 # Cliente VPS
│           └── 📄 client.go
│
├── 📁 vps/                         # Servidor de validação
│   ├── 📄 package.json             # Dependências Node
│   ├── 📄 server.js                # Servidor Express
│   ├── 📄 Dockerfile               # Container Docker
│   ├── 📄 .dockerignore            # Arquivos ignorados
│   │
│   └── 📁 scripts/                 # Scripts utilitários
│       └── 📄 generate-keys.js     # Gerar chaves RSA
│
└── 📁 plugins/                     # Plugins modulares
    └── 📁 example-plugin/          # Plugin de exemplo
        ├── 📄 manifest.json        # Metadados
        ├── 📄 index.js             # Código principal
        └── 📄 README.md            # Documentação
```

## Descrição das Camadas

### 📁 UI (Electron + React)
Interface do usuário construída com tecnologias web modernas.
- **Electron**: Empacotamento desktop
- **React**: Framework UI
- **TypeScript**: Type safety
- **Vite**: Build tool rápido

### 📁 Core (Go)
Engine local de alta performance.
- **API REST**: Comunicação com UI
- **Plugins**: Carregamento dinâmico
- **Security**: Criptografia e validação
- **VPS Client**: Comunicação remota

### 📁 VPS (Node.js)
Servidor de validação e controle.
- **Express**: Framework web
- **Crypto**: Assinatura RSA
- **Database**: Gestão de usuários (futuro)
- **Docker**: Containerização

### 📁 Plugins
Sistema modular extensível.
- **Manifest**: Metadados do plugin
- **Index**: Código principal
- **Assets**: Recursos adicionais

### 📁 Docs
Documentação completa do projeto.
- **Técnica**: Arquitetura, API, Segurança
- **Negócio**: Monetização, Roadmap
- **Usuário**: FAQ, Quickstart

## Fluxo de Dados

```
┌─────────┐         ┌──────────┐         ┌─────────┐
│   UI    │ ◄─────► │   Core   │ ◄─────► │   VPS   │
│ (React) │  Local  │   (Go)   │  HTTPS  │ (Node)  │
└─────────┘   API   └──────────┘         └─────────┘
     │                    │                     │
     │                    │                     │
     ▼                    ▼                     ▼
 Interface          Validação             Autorização
 Dashboard          Segurança             Licenças
 Plugins            API Local             Quota
```

## Tecnologias Utilizadas

### Frontend
- Electron 28+
- React 18+
- TypeScript 5+
- Vite 5+
- Axios

### Backend
- Go 1.21+
- Gin (HTTP framework)
- JWT
- Crypto/RSA

### VPS
- Node.js 18+
- Express 4+
- Crypto (built-in)

### DevOps
- Docker
- GitHub Actions
- Make
- Git

## Comandos Principais

```bash
# Instalar tudo
make install

# Build completo
make build

# Executar em dev
make run

# Testes
make test

# Limpar
make clean
```

## Portas Utilizadas

- **UI**: Electron (sem porta)
- **Core**: Porta dinâmica (ex: 8080)
- **VPS**: 3000 (configurável)

## Variáveis de Ambiente

### Core
```
VPS_ENDPOINT=http://localhost:3000
PUBLIC_KEY=<chave-publica>
ENVIRONMENT=development
```

### VPS
```
PORT=3000
NODE_ENV=production
```

### UI
```
VITE_API_URL=http://localhost:8080
```

## Tamanho Estimado

- **UI**: ~50MB (node_modules)
- **Core**: ~10MB (compilado)
- **VPS**: ~30MB (node_modules)
- **Executável Final**: ~150MB

## Performance

- **Startup**: <3 segundos
- **API Latency**: <50ms
- **Memory**: ~100MB
- **CPU**: <1% idle

---

**Última atualização**: Março 2024  
**Versão**: 1.0.0
