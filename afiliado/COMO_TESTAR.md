# Como Testar o Sistema

Este guia mostra como testar o sistema completo de validação de licenças.

## Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn instalado
- 3 terminais abertos

## Passo 1: Instalar Dependências

### Terminal 1 - VPS Server
```bash
cd afiliado/vps
npm install
```

### Terminal 2 - Core Engine
```bash
cd afiliado
npm install
```

### Terminal 3 - UI (Electron + React)
```bash
cd afiliado/ui
npm install
```

## Passo 2: Iniciar os Servidores

### Terminal 1 - VPS Server (Porta 4000)
```bash
cd afiliado/vps
npm start
```

Você deve ver:
```
🔐 VPS Simulada rodando na porta 4000
📋 Licenças disponíveis para teste:
   - 5511999999999 (pro)
   - 5511888888888 (growth)
   - 5511777777777 (basic)
```

### Terminal 2 - Core Engine (Porta 3001)
```bash
cd afiliado
npm start
```

Você deve ver:
```
🚀 Core Engine rodando na porta 3001
📡 Ambiente: development
```

### Terminal 3 - UI (Porta 3000)
```bash
cd afiliado/ui
npm run dev
```

Você deve ver:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

## Passo 3: Testar via Script Automatizado

Em um novo terminal:

```bash
cd afiliado
node scripts/test-validation.js
```

Este script testa:
1. ✅ Health check dos servidores
2. ✅ Machine fingerprint
3. ✅ Listagem de planos
4. ✅ Validação de licença válida
5. ✅ Validação de token JWT
6. ✅ Verificação de quota
7. ✅ Listagem de plugins
8. ✅ Rejeição de licença inválida

## Passo 4: Testar via Interface (UI)

1. Abra o navegador em `http://localhost:3000`

2. Você verá a tela de login

3. Use uma das licenças de teste:

### Licença Pro (Ilimitado)
```
Número: 5511999999999
Plano: Pro
Quota: Ilimitada
Plugins: Todos
```

### Licença Growth (500 mensagens)
```
Número: 5511888888888
Plano: Growth
Quota: 500 mensagens/mês
Plugins: auto-responder, message-scheduler
```

### Licença Basic (100 mensagens)
```
Número: 5511777777777
Plano: Basic
Quota: 100 mensagens/mês
Plugins: auto-responder
```

4. Clique em "Entrar"

5. Observe os logs nos terminais:

**Terminal VPS:**
```
[VPS] ========================================
[VPS] Nova requisição de validação
[VPS] Número: 5511999999999
[VPS] Machine ID: abc123...
[VPS] ========================================

[VPS] ✓ Licença encontrada no banco de dados
[VPS] ✓ Licença está ativa
[VPS] ✓ Licença válida (30 dias restantes)
[VPS] ✓ Machine ID registrado pela primeira vez
[VPS] ✓ Validação completa
[VPS] Plano: PRO
[VPS] Quota disponível: 999999/999999
[VPS] Plugins: *
```

**Terminal Core:**
```
[License] Iniciando validação para: 5511999999999
[License] Verificando número no WhatsApp...
[License] ✓ Número verificado no WhatsApp
[License] Validando licença no banco de dados...
[License] ✓ Licença válida - Plano: pro
[License] Machine ID: abc123...
[License] ✓ Token JWT gerado com sucesso
[License] Validação completa para 5511999999999
```

6. Após o login, você verá o Dashboard com:
   - Informações do plano
   - Quota disponível
   - Plugins habilitados
   - Estatísticas do sistema

## Passo 5: Testar Funcionalidades

### 5.1. Verificar Quota

No Dashboard, você verá:
```
Quota Disponível
999,999 / 999,999 mensagens
```

### 5.2. Listar Plugins

Vá para a página "Plugins" e veja:
- ✅ Auto Responder (habilitado)
- ✅ Message Scheduler (habilitado)

### 5.3. Testar Envio de Mensagem

**NOTA:** Para testar envio real, você precisa:
1. Configurar a PAPI API (veja seção abaixo)
2. Criar uma instância do WhatsApp
3. Conectar via QR Code

## Passo 6: Testar Validações de Segurança

### 6.1. Testar Licença Inválida

Na tela de login, digite:
```
Número: 5511000000000
```

Você deve ver o erro:
```
❌ Número não cadastrado no sistema
```

### 6.2. Testar Machine Fingerprint

1. Faça login com `5511999999999`
2. O sistema registra o machine ID
3. Tente fazer login em outro dispositivo com o mesmo número
4. Você deve ver o erro:
```
❌ Dispositivo não autorizado
Esta licença está vinculada a outro dispositivo
```

### 6.3. Testar Quota Esgotada

1. Faça login com `5511777777777` (Basic - 100 msgs)
2. Envie 100 mensagens
3. Tente enviar a 101ª mensagem
4. Você deve ver o erro:
```
❌ Quota esgotada
```

## Passo 7: Testar com PAPI API Real (Opcional)

### 7.1. Configurar PAPI

1. Instale a PAPI API seguindo a documentação em `H:\dev-afiliado\Documentação da papi`

2. Configure o `.env` do Core Engine:
```env
PAPI_URL=http://localhost:3000/api
PAPI_API_KEY=sua-chave-papi-aqui
```

3. Reinicie o Core Engine

### 7.2. Criar Instância

```bash
curl -X POST http://localhost:3001/api/whatsapp/instance/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"instanceId": "minha-instancia"}'
```

### 7.3. Obter QR Code

```bash
curl http://localhost:3001/api/whatsapp/instance/minha-instancia/qr \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 7.4. Verificar Status

```bash
curl http://localhost:3001/api/whatsapp/instance/minha-instancia/status \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 7.5. Enviar Mensagem

```bash
curl -X POST http://localhost:3001/api/whatsapp/send/text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "instanceId": "minha-instancia",
    "jid": "5511999999999@s.whatsapp.net",
    "text": "Olá! Mensagem de teste."
  }'
```

## Passo 8: Testar via Postman/Insomnia

### 8.1. Importar Collection

Crie uma collection com as seguintes requisições:

#### 1. Validar Licença
```
POST http://localhost:3001/api/license/validate
Content-Type: application/json

{
  "phoneNumber": "5511999999999",
  "instanceId": "test-instance"
}
```

#### 2. Verificar Status
```
GET http://localhost:3001/api/license/status
Authorization: Bearer SEU_TOKEN
```

#### 3. Verificar Quota
```
GET http://localhost:3001/api/metrics/quota
Authorization: Bearer SEU_TOKEN
```

#### 4. Listar Plugins
```
GET http://localhost:3001/api/plugins
Authorization: Bearer SEU_TOKEN
```

#### 5. Listar Planos
```
GET http://localhost:4000/api/plans
```

## Troubleshooting

### Erro: "ECONNREFUSED"
- Verifique se todos os servidores estão rodando
- Verifique as portas: VPS (4000), Core (3001), UI (3000)

### Erro: "Token inválido"
- Faça login novamente para obter um novo token
- Verifique se o JWT_SECRET é o mesmo no Core e VPS

### Erro: "Número não cadastrado"
- Use uma das licenças de teste: 5511999999999, 5511888888888, 5511777777777
- Verifique se a VPS está rodando

### Erro: "Dispositivo não autorizado"
- Limpe o machine ID no banco de dados da VPS
- Ou use outro número de teste

### UI não carrega
- Verifique se o Vite está rodando na porta 3000
- Limpe o cache: `rm -rf node_modules/.vite`
- Reinstale: `npm install`

## Logs Importantes

### VPS Server
- Validações de licença
- Verificações de machine ID
- Consumo de quota

### Core Engine
- Requisições de API
- Validações de token
- Comunicação com PAPI

### UI
- Erros de autenticação
- Requisições de API
- Estado da aplicação

## Próximos Passos

Após testar o sistema localmente:

1. ✅ Configure a PAPI API real
2. ✅ Configure um banco de dados PostgreSQL
3. ✅ Configure variáveis de ambiente de produção
4. ✅ Faça deploy da VPS em um servidor remoto
5. ✅ Faça deploy do Core Engine
6. ✅ Compile o Electron para distribuição

## Suporte

Para mais informações, consulte:
- [Fluxo de Validação](./docs/FLUXO_VALIDACAO.md)
- [Documentação da API](./docs/API_DOCUMENTATION.md)
- [Arquitetura](./docs/ARCHITECTURE.md)
- [Início Rápido](./docs/INICIO_RAPIDO.md)
