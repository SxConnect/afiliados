# 📁 Estrutura do Projeto - Sistema Afiliados

## 🎯 Visão Geral

O projeto está organizado em **4 módulos principais**:

```
afiliado/
├── ui/              # Interface Electron + React + TypeScript
├── core/            # Core Engine (Node.js)
├── vps/             # Servidor de Validação (Node.js)
├── docs/            # Documentação completa
├── docker/          # Configurações Docker
├── plugins/         # Plugins modulares
└── scripts/         # Scripts utilitários
```

---

## 📂 Estrutura Detalhada

### 1. `/ui` - Interface Gráfica (Electron + React)

Interface desktop moderna construída com Electron, React 18 e TypeScript 5.

```
ui/
├── electron/
│   ├── main.js              # Processo principal Electron
│   └── preload.js           # Script de preload
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Header.tsx       # Cabeçalho com info do usuário
│   │   ├── Sidebar.tsx      # Menu lateral de navegação
│   │   └── Layout.tsx       # Layout principal
│   ├── pages/               # Páginas da aplicação
│   │   ├── LoginPage.tsx    # Tela de login
│   │   ├── DashboardPage.tsx # Dashboard principal
│   │   ├── PluginsPage.tsx  # Gerenciamento de plugins
│   │   └── SettingsPage.tsx # Configurações
│   ├── services/
│   │   └── api.ts           # Cliente API (axios)
│   ├── store/
│   │   └── authStore.ts     # Estado global (Zustand)
│   ├── types/
│   │   └── index.ts         # Tipos TypeScript
│   ├── hooks/
│   │   └── useWhatsApp.ts   # Custom hooks
│   ├── utils/
│   │   ├── cn.ts            # Utilitário de classes
│   │   └── format.ts        # Formatação de dados
│   ├── App.tsx              # Componente raiz
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globais
├── public/                  # Arquivos estáticos
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

**Tecnologias:**
- Electron 28
- React 18
- TypeScript 5
- Tailwind CSS 3
- Vite 5
- Zustand (State)
- React Router 6

**Páginas:**
1. **Login** - Autenticação via número WhatsApp
2. **Dashboard** - Visão geral, conexão WhatsApp, envio de mensagens
3. **Plugins** - Lista e gerenciamento de plugins
4. **Settings** - Configurações do sistema

---

### 2. `/core` - Core Engine (Node.js)

Servidor local que gerencia toda a lógica de negócio e comunicação.

```
core/
├── core/
│   └── server.js            # Servidor Express principal
├── middleware/
│   └── auth.js              # Middleware de autenticação JWT
├── routes/
│   ├── license.js           # Rotas de licença
│   ├── whatsapp.js          # Rotas WhatsApp/PAPI
│   ├── plugins.js           # Rotas de plugins
│   └── metrics.js           # Rotas de métricas
└── services/
    ├── PAPIService.js       # Integração com PAPI API
    └── VPSService.js        # Validação com VPS
```

**Tecnologias:**
- Node.js 20
- Express 4
- JWT para autenticação
- Helmet para segurança
- Rate Limiting
- Axios para HTTP

**Responsabilidades:**
- API REST para UI
- Autenticação e autorização
- Integração com PAPI API (WhatsApp)
- Validação com VPS
- Controle de quota
- Sistema de plugins
- Métricas em tempo real

**Endpoints Principais:**
- `POST /api/license/validate` - Validar licença
- `GET /api/license/status` - Status da licença
- `POST /api/whatsapp/instance/create` - Criar instância WhatsApp
- `GET /api/whatsapp/instance/:id/qr` - Obter QR Code
- `POST /api/whatsapp/send/text` - Enviar mensagem
- `GET /api/plugins` - Listar plugins
- `GET /api/metrics/quota` - Verificar quota

---

### 3. `/vps` - Servidor de Validação (Node.js)

Servidor remoto para validação de licenças e controle de quotas.

```
vps/
├── server.js                # Servidor Express
├── package.json
└── .env                     # Configurações
```

**Tecnologias:**
- Node.js 20
- Express 4
- JWT
- Crypto (RSA-2048)

**Responsabilidades:**
- Validação de licenças
- Controle de planos (Free, Basic, Growth, Pro)
- Gestão de quotas
- Assinatura criptográfica RSA-2048
- Emissão de tokens JWT
- Fingerprint de máquina

**Endpoints:**
- `POST /api/validate` - Validar licença
- `GET /api/quota` - Verificar quota
- `POST /api/quota/consume` - Consumir quota
- `GET /api/plans` - Listar planos

**Planos Implementados:**
| Plano | Quota | Plugins | Preço |
|-------|-------|---------|-------|
| Free | 10 msgs/mês | Nenhum | R$ 0 |
| Basic | 100 msgs/mês | 1 plugin | R$ 29,90 |
| Growth | 500 msgs/mês | 3 plugins | R$ 79,90 |
| Pro | Ilimitado | Todos | R$ 199,90 |

---

### 4. `/docs` - Documentação

Documentação completa do projeto.

```
docs/
├── QUICKSTART.md            # Início rápido (10 min)
├── ARCHITECTURE.md          # Arquitetura técnica
├── API_DOCUMENTATION.md     # Documentação da API
├── COMO_TESTAR.md           # Guia de testes
├── GUIA_INSTALACAO.md       # Instalação detalhada
├── EXEMPLOS_USO.md          # Exemplos práticos
├── CHECKLIST_PRODUCAO.md    # Checklist para produção
├── ENTREGA_FINAL.md         # Resumo da entrega
└── RELATORIO_FINAL.md       # Relatório completo
```

---

### 5. `/docker` - Configurações Docker

Arquivos para containerização.

```
docker/
├── docker-compose.yml       # Orquestração de containers
└── Dockerfile               # Build da imagem
```

**Serviços:**
- `vps` - Servidor de validação
- `core` - Core Engine
- `postgres` - Banco de dados (opcional)
- `redis` - Cache (opcional)

---

### 6. `/plugins` - Plugins Modulares

Sistema de plugins extensível.

```
plugins/
├── message-scheduler/
│   ├── index.js             # Lógica do plugin
│   └── manifest.json        # Metadados
└── auto-responder/
    ├── index.js             # Lógica do plugin
    └── manifest.json        # Metadados
```

**Plugins Implementados:**
1. **Message Scheduler** - Agendamento de mensagens
2. **Auto Responder** - Respostas automáticas

---

### 7. `/scripts` - Scripts Utilitários

Scripts para automação.

```
scripts/
├── start-all.bat            # Iniciar tudo (Windows)
├── start-all.sh             # Iniciar tudo (Linux/Mac)
├── generate-ui-files.js     # Gerar arquivos da UI
└── project-stats.js         # Estatísticas do projeto
```

---

## 🔄 Fluxo de Comunicação

```
┌─────────────────────────────────────────────────────────┐
│                    UI (Electron)                         │
│              React + TypeScript + Tailwind               │
│                  http://localhost:5173                   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────┐
│                Core Engine (Node.js)                     │
│         Express + JWT + Rate Limiting + Plugins          │
│                  http://localhost:3001                   │
└──────┬────────────────────────────────────────┬─────────┘
       │                                        │
       │ HTTP                                   │ HTTP
       ▼                                        ▼
┌──────────────────┐                  ┌─────────────────┐
│   PAPI API       │                  │  VPS Validation │
│   (WhatsApp)     │                  │   (Node.js)     │
│   localhost:3000 │                  │   localhost:4000│
└──────────────────┘                  └─────────────────┘
```

---

## 🚀 Como Iniciar

### Opção 1: Makefile (Recomendado)

```bash
# Instalar tudo
make install

# Iniciar desenvolvimento
make dev

# Build produção
make build
```

### Opção 2: Manual

```bash
# 1. Instalar dependências
npm install                    # Core
cd vps && npm install && cd .. # VPS
cd ui && npm install && cd ..  # UI

# 2. Iniciar VPS (Terminal 1)
cd vps && npm start

# 3. Iniciar Core (Terminal 2)
npm start

# 4. Iniciar UI (Terminal 3)
cd ui && npm run dev
```

### Opção 3: Docker

```bash
cd docker
docker-compose up -d
```

---

## 📊 Estatísticas

```
📦 Total: 68 arquivos
📝 Código: 3.203 linhas
📖 Documentação: 4.419 linhas
💯 Total: 8.801 linhas
```

---

## 🔐 Integração PAPI API

O sistema está **100% integrado** com a PAPI API para comunicação WhatsApp:

### Funcionalidades Implementadas:

✅ **Instâncias:**
- Criar instância
- Obter QR Code
- Verificar status
- Deletar instância

✅ **Mensagens:**
- Enviar texto
- Enviar imagem
- Enviar vídeo
- Enviar áudio
- Enviar documento
- Enviar localização
- Enviar contato
- Enviar botões
- Enviar lista
- Enviar enquete

✅ **Validação:**
- Verificar número no WhatsApp
- Validação automática antes de enviar

✅ **Webhooks:**
- Configurar webhook
- Receber mensagens em tempo real

### Configuração:

Edite o arquivo `.env`:

```env
PAPI_URL=http://localhost:3000/api
PAPI_API_KEY=sua-chave-aqui
```

---

## 📚 Documentação Adicional

- [Quickstart](./docs/QUICKSTART.md) - Início rápido
- [Como Testar](./docs/COMO_TESTAR.md) - Guia de testes
- [Arquitetura](./docs/ARCHITECTURE.md) - Detalhes técnicos
- [API Documentation](./docs/API_DOCUMENTATION.md) - Endpoints

---

**Estrutura organizada e pronta para desenvolvimento! 🚀**
