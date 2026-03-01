# 🚀 Guia de Instalação - Sistema Afiliados WhatsApp

## 📋 Pré-requisitos

- Node.js 18+ instalado
- API PAPI rodando (WhatsApp)
- Git (opcional)

## 🔧 Instalação Passo a Passo

### 1. Instalar Dependências

```bash
# Na pasta raiz do projeto
cd afiliado
npm install

# Instalar dependências da VPS simulada
cd vps
npm install
cd ..
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Core Engine
PORT=3001
NODE_ENV=development

# VPS (usar localhost para desenvolvimento)
VPS_URL=http://localhost:4000/api
VPS_PUBLIC_KEY=sua-chave-publica

# API PAPI (WhatsApp)
PAPI_URL=http://localhost:3000/api
PAPI_API_KEY=sua-chave-papi-aqui

# JWT Secret (gerar uma chave segura)
JWT_SECRET=seu-secret-super-seguro-aqui

# Quotas por plano
DEFAULT_QUOTA_FREE=10
DEFAULT_QUOTA_BASIC=100
DEFAULT_QUOTA_GROWTH=500
DEFAULT_QUOTA_PRO=999999
```

### 3. Iniciar os Servidores

Você precisa de 3 terminais abertos:

#### Terminal 1 - API PAPI (WhatsApp)
```bash
# Se você já tem a PAPI rodando, pule este passo
# Caso contrário, siga a documentação da PAPI
```

#### Terminal 2 - VPS Simulada
```bash
cd vps
npm start
```

Você verá:
```
🔐 VPS Simulada rodando na porta 4000
📋 Licenças disponíveis para teste:
   - 5511999999999 (pro)
   - 5511888888888 (growth)
   - 5511777777777 (basic)
```

#### Terminal 3 - Core Engine
```bash
# Na pasta raiz do afiliado
npm start
```

Você verá:
```
🚀 Core Engine rodando na porta 3001
📡 Ambiente: development
```

### 4. Testar a Instalação

Abra o arquivo `test-client.html` no navegador:

```bash
# Windows
start test-client.html

# Linux/Mac
open test-client.html
```

## 🧪 Testando o Sistema

### Teste 1: Validar Licença

1. No cliente de teste, use um dos números disponíveis:
   - `5511999999999` (Plano Pro - Ilimitado)
   - `5511888888888` (Plano Growth - 500 msgs)
   - `5511777777777` (Plano Basic - 100 msgs)

2. Clique em "🔐 Validar Licença"

3. Se bem-sucedido, você verá o token JWT e informações do plano

### Teste 2: Criar Instância WhatsApp

1. Digite um ID para a instância (ex: `afiliado-test`)
2. Clique em "📱 Criar Instância"
3. Clique em "📷 Ver QR Code"
4. Escaneie o QR Code com seu WhatsApp
5. Clique em "✅ Ver Status" para confirmar conexão

### Teste 3: Enviar Mensagem

1. Digite o número de destino no formato: `5511999999999@s.whatsapp.net`
2. Digite a mensagem
3. Clique em "📤 Enviar Mensagem"
4. Verifique se a mensagem foi enviada

### Teste 4: Plugins

1. Clique em "📦 Listar Plugins" para ver plugins disponíveis
2. Teste os plugins conforme seu plano

## 📊 Estrutura do Projeto

```
afiliado/
├── src/
│   ├── core/
│   │   └── server.js          # Servidor principal
│   ├── middleware/
│   │   └── auth.js            # Autenticação JWT
│   ├── routes/
│   │   ├── license.js         # Rotas de licença
│   │   ├── whatsapp.js        # Rotas WhatsApp
│   │   ├── plugins.js         # Rotas de plugins
│   │   └── metrics.js         # Rotas de métricas
│   └── services/
│       ├── PAPIService.js     # Integração PAPI
│       └── VPSService.js      # Validação VPS
├── plugins/
│   ├── message-scheduler/     # Plugin agendador
│   └── auto-responder/        # Plugin auto-resposta
├── vps/
│   └── server.js              # Servidor VPS simulado
├── test-client.html           # Cliente de teste
├── .env                       # Configurações
└── package.json
```

## 🔐 Segurança

### Chaves Criptográficas

Para produção, gere chaves RSA reais:

```bash
# Gerar chave privada
openssl genrsa -out private.key 2048

# Gerar chave pública
openssl rsa -in private.key -pubout -out public.key
```

Use a chave privada na VPS e a pública no Core Engine.

### JWT Secret

Gere um secret forte:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🐛 Troubleshooting

### Erro: "ECONNREFUSED"
- Verifique se todos os servidores estão rodando
- Confirme as portas no arquivo `.env`

### Erro: "Token inválido"
- Valide a licença novamente
- Verifique se o JWT_SECRET é o mesmo em todos os servidores

### Erro: "Quota esgotada"
- Verifique seu plano na VPS
- Use um número com plano superior para testes

### Erro: "Instance not found"
- Crie a instância primeiro
- Verifique se a API PAPI está rodando
- Confirme a API Key da PAPI

## 📚 Próximos Passos

1. **Desenvolver UI Electron**: Interface gráfica profissional
2. **Adicionar mais plugins**: Expandir funcionalidades
3. **Deploy da VPS**: Hospedar em servidor real
4. **Implementar pagamentos**: Integrar gateway de pagamento
5. **Sistema de atualização**: Auto-update do aplicativo

## 🆘 Suporte

Para dúvidas ou problemas:
- Verifique os logs dos servidores
- Consulte a documentação da PAPI
- Revise as configurações do `.env`

## 📝 Licença

Sistema proprietário - Todos os direitos reservados
