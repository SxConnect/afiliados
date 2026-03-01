# 📁 Estrutura de Arquivos do Projeto

## 🌳 Árvore Completa

```
afiliado/
│
├── 📄 .env                          # Configurações do Core Engine
├── 📄 .env.example                  # Exemplo de configurações
├── 📄 .gitignore                    # Arquivos ignorados pelo Git
├── 📄 package.json                  # Dependências do projeto
│
├── 📖 README.md                     # Documentação principal
├── 📖 INICIO_RAPIDO.md              # Guia de início rápido (5 min)
├── 📖 GUIA_INSTALACAO.md            # Guia detalhado de instalação
├── 📖 API_DOCUMENTATION.md          # Documentação completa da API
├── 📖 EXEMPLOS_USO.md               # Exemplos práticos de uso
├── 📖 RESUMO_PROJETO.md             # Visão geral do projeto
├── 📖 CHECKLIST_PRODUCAO.md         # Checklist para produção
├── 📖 ESTRUTURA_ARQUIVOS.md         # Este arquivo
│
├── 🌐 test-client.html              # Cliente web para testes
│
├── 📂 src/                          # Código fonte do Core Engine
│   │
│   ├── 📂 core/                     # Núcleo do sistema
│   │   └── 📄 server.js             # Servidor Express principal
│   │
│   ├── 📂 middleware/               # Middlewares
│   │   └── 📄 auth.js               # Autenticação JWT
│   │
│   ├── 📂 routes/                   # Rotas da API
│   │   ├── 📄 license.js            # Rotas de licença
│   │   ├── 📄 whatsapp.js           # Rotas WhatsApp/PAPI
│   │   ├── 📄 plugins.js            # Rotas de plugins
│   │   └── 📄 metrics.js            # Rotas de métricas
│   │
│   └── 📂 services/                 # Serviços
│       ├── 📄 PAPIService.js        # Integração com PAPI API
│       └── 📄 VPSService.js         # Validação com VPS
│
├── 📂 plugins/                      # Plugins modulares
│   │
│   ├── 📂 message-scheduler/        # Plugin: Agendador de Mensagens
│   │   ├── 📄 index.js              # Lógica do plugin
│   │   └── 📄 manifest.json         # Manifesto do plugin
│   │
│   └── 📂 auto-responder/           # Plugin: Resposta Automática
│       ├── 📄 index.js              # Lógica do plugin
│       └── 📄 manifest.json         # Manifesto do plugin
│
├── 📂 vps/                          # Servidor VPS de Validação
│   ├── 📄 .env                      # Configurações da VPS
│   ├── 📄 package.json              # Dependências da VPS
│   └── 📄 server.js                 # Servidor de validação
│
└── 📂 scripts/                      # Scripts utilitários
    ├── 📄 start-all.bat             # Iniciar tudo (Windows)
    └── 📄 start-all.sh              # Iniciar tudo (Linux/Mac)
```

## 📊 Estatísticas

- **Total de arquivos:** 29
- **Linhas de código:** ~3.500+
- **Arquivos de documentação:** 8
- **Plugins implementados:** 2
- **Rotas da API:** 4 grupos
- **Serviços:** 2

## 🔍 Descrição Detalhada

### 📂 Raiz do Projeto

| Arquivo | Descrição | Tipo |
|---------|-----------|------|
| `.env` | Configurações sensíveis (não commitar) | Config |
| `.env.example` | Exemplo de configurações | Template |
| `.gitignore` | Arquivos ignorados pelo Git | Config |
| `package.json` | Dependências e scripts npm | Config |
| `test-client.html` | Interface web para testes | HTML |

### 📖 Documentação

| Arquivo | Conteúdo | Para Quem |
|---------|----------|-----------|
| `README.md` | Visão geral e início rápido | Todos |
| `INICIO_RAPIDO.md` | Guia de 5 minutos | Iniciantes |
| `GUIA_INSTALACAO.md` | Instalação detalhada | Desenvolvedores |
| `API_DOCUMENTATION.md` | Todos os endpoints | Integradores |
| `EXEMPLOS_USO.md` | Casos práticos | Desenvolvedores |
| `RESUMO_PROJETO.md` | Visão completa | Gestores |
| `CHECKLIST_PRODUCAO.md` | Deploy em produção | DevOps |
| `ESTRUTURA_ARQUIVOS.md` | Este arquivo | Todos |

### 📂 src/ - Core Engine

#### core/
- `server.js`: Servidor Express principal com todas as configurações

#### middleware/
- `auth.js`: Middleware de autenticação JWT

#### routes/
- `license.js`: Validação e status de licença
- `whatsapp.js`: Integração com WhatsApp via PAPI
- `plugins.js`: Gerenciamento de plugins
- `metrics.js`: Métricas e quota

#### services/
- `PAPIService.js`: Comunicação com PAPI API
- `VPSService.js`: Validação com servidor VPS

### 📂 plugins/ - Sistema Modular

#### message-scheduler/
Plugin para agendamento de mensagens:
- `index.js`: Lógica de agendamento
- `manifest.json`: Metadados do plugin

#### auto-responder/
Plugin para respostas automáticas:
- `index.js`: Lógica de auto-resposta
- `manifest.json`: Metadados do plugin

### 📂 vps/ - Servidor de Validação

- `server.js`: Servidor Express para validação
- `package.json`: Dependências específicas
- `.env`: Configurações da VPS

### 📂 scripts/ - Utilitários

- `start-all.bat`: Script Windows para iniciar tudo
- `start-all.sh`: Script Linux/Mac para iniciar tudo

## 🎯 Arquivos Principais por Funcionalidade

### 🔐 Autenticação e Segurança
```
src/middleware/auth.js
src/routes/license.js
src/services/VPSService.js
vps/server.js
```

### 📱 WhatsApp
```
src/routes/whatsapp.js
src/services/PAPIService.js
```

### 🔌 Plugins
```
src/routes/plugins.js
plugins/message-scheduler/
plugins/auto-responder/
```

### 📊 Monitoramento
```
src/routes/metrics.js
```

### 🧪 Testes
```
test-client.html
```

## 📝 Convenções de Nomenclatura

### Arquivos
- **Serviços:** `NomeService.js` (PascalCase)
- **Rotas:** `nome.js` (lowercase)
- **Plugins:** `nome-plugin/` (kebab-case)
- **Documentação:** `NOME_ARQUIVO.md` (UPPERCASE)

### Diretórios
- **Código:** `src/`, `plugins/`, `vps/`
- **Utilitários:** `scripts/`
- **Documentação:** Raiz do projeto

## 🔄 Fluxo de Arquivos

```
1. Cliente → test-client.html
2. Request → src/core/server.js
3. Auth → src/middleware/auth.js
4. Route → src/routes/*.js
5. Service → src/services/*.js
6. External → PAPI API / VPS
```

## 📦 Dependências por Módulo

### Core Engine
```json
{
  "express": "API REST",
  "jsonwebtoken": "Autenticação",
  "axios": "HTTP client",
  "helmet": "Segurança",
  "cors": "CORS",
  "express-rate-limit": "Rate limiting",
  "node-machine-id": "Fingerprint"
}
```

### VPS
```json
{
  "express": "API REST",
  "jsonwebtoken": "Tokens",
  "crypto": "Assinatura"
}
```

## 🚀 Próximos Arquivos (Roadmap)

### Em Desenvolvimento
- [ ] `ui/` - Interface Electron
- [ ] `tests/` - Testes automatizados
- [ ] `docs/` - Documentação adicional
- [ ] `migrations/` - Migrações de banco

### Futuro
- [ ] `plugins/crm/` - Plugin CRM
- [ ] `plugins/analytics/` - Plugin Analytics
- [ ] `plugins/ai-assistant/` - Plugin IA
- [ ] `mobile/` - App mobile

## 💡 Dicas

### Para Desenvolvedores
1. Comece lendo `INICIO_RAPIDO.md`
2. Explore `src/core/server.js` para entender o fluxo
3. Veja `EXEMPLOS_USO.md` para casos práticos

### Para Integradores
1. Leia `API_DOCUMENTATION.md`
2. Use `test-client.html` para testar
3. Consulte `EXEMPLOS_USO.md` para integração

### Para DevOps
1. Revise `CHECKLIST_PRODUCAO.md`
2. Configure variáveis em `.env`
3. Use scripts em `scripts/` para automação

---

**Última atualização:** 2024
**Total de arquivos:** 29
**Linhas de código:** ~3.500+
