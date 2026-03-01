# 🏗️ Arquitetura do Sistema

## Visão Geral

O Sistema Profissional de Afiliados segue uma arquitetura híbrida com três camadas principais:

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (Electron)                   │
│              React + TypeScript + Tailwind               │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────┐
│                Core Engine (Node.js)                     │
│         Express + JWT + Rate Limiting + Plugins          │
└──────┬────────────────────────────────────────┬─────────┘
       │                                        │
       │ HTTP                                   │ HTTP
       ▼                                        ▼
┌──────────────────┐                  ┌─────────────────┐
│   PAPI API       │                  │  VPS Validation │
│   (WhatsApp)     │                  │   (Node.js)     │
└──────────────────┘                  └─────────────────┘
```

## Camadas

### 1. UI Layer (Electron + React)

**Tecnologias:**
- Electron 28+
- React 18
- TypeScript 5
- Tailwind CSS 3
- Zustand (State Management)
- React Router 6

**Responsabilidades:**
- Interface gráfica do usuário
- Gerenciamento de estado local
- Comunicação com Core Engine via API REST
- Exibição de métricas e dashboards

**Páginas:**
1. **Login** - Autenticação via número WhatsApp
2. **Dashboard** - Visão geral, conexão WhatsApp, envio de mensagens
3. **Plugins** - Gerenciamento de plugins modulares
4. **Settings** - Configurações do sistema

### 2. Core Engine (Node.js + Express)

**Tecnologias:**
- Node.js 20+
- Express 4
- JWT para autenticação
- Helmet para segurança
- Rate Limiting
- Axios para HTTP client

**Responsabilidades:**
- API REST para UI
- Autenticação e autorização
- Integração com PAPI API (WhatsApp)
- Validação com VPS
- Controle de quota
- Sistema de plugins
- Logs e métricas

**Rotas:**
- `/api/license/*` - Validação de licença
- `/api/whatsapp/*` - Operações WhatsApp
- `/api/plugins/*` - Gerenciamento de plugins
- `/api/metrics/*` - Métricas do sistema

### 3. VPS Validation (Node.js)

**Tecnologias:**
- Node.js 20+
- Express 4
- JWT
- Crypto (RSA-2048)

**Responsabilidades:**
- Validação de licenças
- Controle de planos e quotas
- Assinatura criptográfica
- Gerenciamento de plugins por plano
- Fingerprint de máquina

## Fluxo de Dados

### Autenticação

```
1. User → UI: Insere número WhatsApp
2. UI → Core: POST /api/license/validate
3. Core → VPS: POST /api/validate
4. VPS → Core: Token JWT + Dados do plano
5. Core → UI: Token JWT + Informações do usuário
6. UI: Armazena token e redireciona para Dashboard
```

### Envio de Mensagem

```
1. User → UI: Preenche formulário de mensagem
2. UI → Core: POST /api/whatsapp/send/text
3. Core → VPS: GET /api/quota (verifica quota)
4. VPS → Core: Quota disponível
5. Core → PAPI: POST /instances/:id/send-text
6. PAPI → WhatsApp: Envia mensagem
7. Core → VPS: POST /api/quota/consume
8. Core → UI: Confirmação de envio
```

## Segurança

### Autenticação JWT

- Tokens com expiração de 24h
- Assinatura HMAC SHA-256
- Renovação automática (refresh token)

### Assinatura Criptográfica

- RSA-2048 bits
- Chave privada apenas na VPS
- Chave pública no Core Engine
- Validação de integridade de dados

### Fingerprint de Máquina

- Identificador único baseado em hardware
- Previne uso em múltiplos dispositivos
- Vinculado à licença

### Rate Limiting

- 100 requisições por 15 minutos
- Por IP e por usuário
- Proteção contra abuso

## Sistema de Plugins

### Arquitetura

```
plugins/
├── plugin-name/
│   ├── index.js          # Lógica do plugin
│   ├── manifest.json     # Metadados
│   └── README.md         # Documentação
```

### Manifest Schema

```json
{
  "id": "plugin-id",
  "name": "Plugin Name",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "Author Name",
  "icon": "🔌",
  "category": "automation",
  "requiredPlan": "basic",
  "permissions": ["whatsapp.send", "storage.write"],
  "actions": [
    {
      "id": "action-id",
      "name": "Action Name",
      "params": {
        "param1": "string",
        "param2": "number"
      }
    }
  ]
}
```

### Ciclo de Vida

1. **Load**: Plugin é carregado dinamicamente
2. **Validate**: Verifica permissões e plano
3. **Execute**: Executa ação solicitada
4. **Cleanup**: Libera recursos

## Escalabilidade

### Horizontal

- Core Engine pode ser replicado
- Load balancer na frente
- Sessões compartilhadas via Redis

### Vertical

- Otimização de memória
- Cache de queries
- Connection pooling

## Monitoramento

### Métricas Coletadas

- CPU usage
- Memory usage (RSS, Heap)
- Uptime
- Request rate
- Error rate
- Quota usage

### Logs

- Estruturados em JSON
- Níveis: error, warn, info, debug
- Rotação automática
- Centralização (ELK, Papertrail)

## Deploy

### Desenvolvimento

```bash
make install
make dev
```

### Produção

```bash
make build
make docker-up
```

### CI/CD

- GitHub Actions
- Build automático
- Testes automatizados
- Deploy em Docker Hub

## Tecnologias Futuras

- [ ] Go para Core Engine (performance)
- [ ] GraphQL API
- [ ] WebSocket para real-time
- [ ] Kubernetes para orquestração
- [ ] Prometheus + Grafana para métricas
