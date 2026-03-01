# Guia de Configuração

## Pré-requisitos

- Node.js 18+
- Go 1.21+
- Git

## Instalação

### 1. VPS (Servidor de Validação)

```bash
cd vps
npm install
npm run generate-keys
npm start
```

O servidor estará rodando em `http://localhost:3000`

### 2. Core Engine (Go)

```bash
cd core
go mod download
go build -o afiliado-core.exe main.go
./afiliado-core.exe
```

O Core estará rodando em uma porta dinâmica (ex: 8080)

### 3. UI (Electron)

```bash
cd ui
npm install
npm run electron:dev
```

## Configuração

### Chaves Criptográficas

1. Gerar chaves na VPS:
```bash
cd vps
npm run generate-keys
```

2. Copiar chave pública para o Core:
```bash
cp vps/keys/public.pem core/keys/public.pem
```

3. Configurar variável de ambiente:
```bash
export PUBLIC_KEY=$(cat core/keys/public.pem)
```

### Variáveis de Ambiente

#### Core (.env)
```
VPS_ENDPOINT=http://localhost:3000
PUBLIC_KEY=<conteúdo da chave pública>
ENVIRONMENT=development
```

#### VPS (.env)
```
PORT=3000
NODE_ENV=production
```

## Build para Produção

### Core
```bash
cd core
go build -ldflags="-s -w" -o afiliado-core.exe main.go
```

### UI
```bash
cd ui
npm run build
npm run electron:build
```

O executável estará em `ui/dist/`

## Estrutura de Diretórios

```
afiliado/
├── core/           # Go Engine
│   ├── internal/
│   │   ├── api/
│   │   ├── config/
│   │   ├── plugins/
│   │   ├── security/
│   │   └── vps/
│   └── main.go
├── ui/             # Electron + React
│   ├── electron/
│   ├── src/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── vps/            # Servidor de validação
│   ├── scripts/
│   └── server.js
└── shared/         # Tipos compartilhados
    └── types.ts
```

## Testes

### Core
```bash
cd core
go test ./...
```

### UI
```bash
cd ui
npm test
```

### VPS
```bash
cd vps
npm test
```

## Troubleshooting

### Core não inicia
- Verificar se a porta está disponível
- Verificar chave pública configurada
- Verificar logs em `core/logs/`

### UI não conecta ao Core
- Verificar se Core está rodando
- Verificar porta no arquivo de configuração
- Verificar CORS no Core

### VPS não valida
- Verificar chaves geradas corretamente
- Verificar conexão de rede
- Verificar logs do servidor
