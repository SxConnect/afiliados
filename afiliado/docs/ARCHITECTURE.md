# Arquitetura do Sistema

## Visão Geral

Sistema híbrido desktop com três camadas principais:

1. **UI Layer** (Electron + React)
2. **Core Engine** (Go)
3. **VPS** (Node.js)

## Fluxo de Dados

```
UI (Electron) <-> Core (Go) <-> VPS (Node.js)
     |              |              |
  Interface    Validação      Autorização
  Dashboard    Segurança      Quota
  Plugins      API Local      Licenças
```

## Camada 1: UI (Electron + React)

### Responsabilidades
- Interface do usuário
- Visualização de dados
- Navegação entre páginas
- Comunicação com Core via API local

### Páginas
- Login
- Dashboard
- Plugins
- Settings

### Segurança
- Nenhuma lógica crítica
- Apenas apresentação
- Validação básica de formulários

## Camada 2: Core Engine (Go)

### Responsabilidades
- Servidor API local (porta dinâmica)
- Validação de licença
- Controle de quota
- Gerenciamento de plugins
- Comunicação com VPS
- Assinaturas criptográficas

### Endpoints
- `POST /api/v1/login` - Autenticação
- `GET /api/v1/status` - Status do sistema
- `GET /api/v1/quota` - Verificar quota
- `GET /api/v1/plugins` - Listar plugins
- `POST /api/v1/validate-action` - Validar ação

### Segurança
- Token de sessão interno
- Verificação de assinatura
- Fingerprint da máquina
- CORS restrito

## Camada 3: VPS (Node.js)

### Responsabilidades
- Validação de usuários
- Controle de assinaturas
- Gerenciamento de quota
- Emissão de tokens assinados
- Controle de plugins ativos

### Endpoints
- `POST /api/v1/validate` - Validar usuário
- `GET /api/v1/quota/:userId` - Verificar quota
- `POST /api/v1/usage/:userId` - Incrementar uso

### Segurança
- Assinatura RSA
- Tokens temporários
- Fingerprint binding
- Rate limiting

## Sistema de Plugins

### Estrutura
```
plugins/
├── plugin-id/
│   ├── manifest.json
│   ├── index.js
│   └── assets/
```

### Manifest
```json
{
  "id": "plugin-id",
  "name": "Plugin Name",
  "version": "1.0.0",
  "requiresPlan": "base",
  "entryPoint": "index.js"
}
```

### Carregamento
1. Core lê diretório de plugins
2. Valida manifesto
3. Verifica permissão do usuário
4. Carrega dinamicamente se autorizado

## Modelo de Segurança

### Assinatura Criptográfica
- Chave privada na VPS
- Chave pública no Core
- Tokens assinados com RSA-SHA256

### Validação de Licença
1. Usuário faz login
2. Core envia fingerprint para VPS
3. VPS valida e retorna token assinado
4. Core verifica assinatura
5. UI recebe autorização

### Controle de Quota
- Quota armazenada apenas na VPS
- Verificação obrigatória antes de ações
- Incremento remoto após uso

## Escalabilidade

### Horizontal
- VPS pode escalar com load balancer
- Core é stateless (exceto sessão local)
- UI é cliente puro

### Vertical
- Core otimizado em Go
- VPS leve (sem LLM)
- Banco de dados separado (futuro)

## Evolução Futura

### SaaS
- UI web adicional
- API pública
- Sincronização cloud

### Marketplace
- Plugins de terceiros
- Sistema de pagamento integrado
- Versionamento automático
