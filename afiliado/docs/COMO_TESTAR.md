# 🧪 Como Testar o Sistema

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ Node.js 20+ instalado
- ✅ npm ou yarn
- ✅ API PAPI rodando (opcional para testes básicos)
- ✅ Navegador moderno (Chrome, Firefox, Edge)

## 🚀 Passo 1: Instalação (3 minutos)

### Opção A: Usando Makefile (Recomendado)

```bash
cd afiliado
make install
```

### Opção B: Manual

```bash
cd afiliado

# Core Engine
npm install

# VPS
cd vps && npm install && cd ..

# UI
cd ui && npm install && cd ..
```

## 🔧 Passo 2: Configuração (2 minutos)

### Editar arquivo `.env`

```env
# Core Engine
PORT=3001
NODE_ENV=development

# VPS
VPS_URL=http://localhost:4000/api

# PAPI (WhatsApp) - OPCIONAL para testes básicos
PAPI_URL=http://localhost:3000/api
PAPI_API_KEY=sua-chave-aqui

# JWT
JWT_SECRET=desenvolvimento-secret-key
```

> 💡 **Dica:** Para testes básicos, você pode deixar PAPI_URL e PAPI_API_KEY vazios. O sistema funcionará sem WhatsApp.

## 🎬 Passo 3: Iniciar Sistema (2 minutos)

### Opção A: Makefile

```bash
make dev
```

### Opção B: Manual (3 terminais)

**Terminal 1 - VPS:**
```bash
cd vps
npm start
```

Aguarde ver:
```
🔐 VPS Simulada rodando na porta 4000
📋 Licenças disponíveis para teste:
   - 5511999999999 (pro)
   - 5511888888888 (growth)
   - 5511777777777 (basic)
```

**Terminal 2 - Core Engine:**
```bash
npm start
```

Aguarde ver:
```
🚀 Core Engine rodando na porta 3001
📡 Ambiente: development
```

**Terminal 3 - UI:**
```bash
cd ui
npm run dev
```

Aguarde ver:
```
  VITE v5.0.8  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🧪 Passo 4: Testar Interface (5 minutos)

### 4.1 Acessar Interface

Abra o navegador em: **http://localhost:5173**

Você deve ver a tela de login com:
- ✅ Logo do sistema
- ✅ Campo de número WhatsApp
- ✅ 3 licenças de teste clicáveis
- ✅ Design moderno com gradiente

### 4.2 Fazer Login

**Teste 1: Login com Plano Pro**

1. Clique na licença: `5511999999999 - Pro (Ilimitado)`
2. Clique em "Entrar"
3. Aguarde validação (~1 segundo)

**Resultado Esperado:**
- ✅ Redirecionamento para Dashboard
- ✅ Header mostrando plano "Pro"
- ✅ Quota mostrando "∞"
- ✅ Sidebar com navegação

**Teste 2: Login com Plano Basic**

1. Faça logout (ícone no header)
2. Use licença: `5511777777777`
3. Faça login

**Resultado Esperado:**
- ✅ Plano "Basic" no header
- ✅ Quota "100" mensagens

### 4.3 Testar Dashboard

**Verificar Cards de Estatísticas:**
- ✅ Quota Disponível (verde)
- ✅ Quota Usada (azul)
- ✅ Plano Atual (roxo)
- ✅ Plugins Ativos (amarelo)

**Testar Conexão WhatsApp (Opcional - requer PAPI):**

1. Digite ID da instância: `teste`
2. Clique "Criar Instância"
3. Aguarde confirmação
4. Clique no ícone QR Code
5. Veja QR Code aparecer

**Testar Envio de Mensagem (Opcional - requer WhatsApp conectado):**

1. Digite número: `5511888888888`
2. Digite mensagem: `Teste do sistema`
3. Clique "Enviar Mensagem"
4. Veja confirmação

**Verificar Métricas do Sistema:**
- ✅ Memória (RSS)
- ✅ Heap Usado
- ✅ Uptime
- ✅ Plataforma

### 4.4 Testar Plugins

1. Clique em "Plugins" na sidebar
2. Veja 2 plugins:
   - 📅 Message Scheduler
   - 🤖 Auto Responder

**Verificar Informações:**
- ✅ Nome e descrição
- ✅ Versão
- ✅ Categoria
- ✅ Plano necessário
- ✅ Status (Ativo/Bloqueado)

**Teste de Bloqueio:**
1. Faça logout
2. Login com plano Free (crie um número qualquer)
3. Vá em Plugins
4. Veja plugins bloqueados com ícone 🔒

### 4.5 Testar Configurações

1. Clique em "Configurações" na sidebar

**Verificar Seções:**
- ✅ Informações da Conta (número, plano, quota)
- ✅ Configurações PAPI API
- ✅ Preferências (toggles funcionais)
- ✅ Segurança (fingerprint, token)

**Testar Toggles:**
1. Clique no toggle "Notificações"
2. Veja animação de mudança
3. Clique novamente
4. Veja voltar ao estado anterior

**Salvar Configurações:**
1. Clique "Salvar Configurações"
2. Veja notificação de sucesso (toast)

## 🔍 Passo 5: Testar API Diretamente (Opcional)

### Usando cURL

**Validar Licença:**
```bash
curl -X POST http://localhost:3001/api/license/validate \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"5511999999999"}'
```

**Resultado Esperado:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "plan": "pro",
  "quota": {
    "total": 999999,
    "used": 0,
    "available": 999999
  },
  "plugins": ["*"]
}
```

**Listar Plugins:**
```bash
curl http://localhost:3001/api/plugins \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Usando Postman/Insomnia

1. Importe a collection (se disponível)
2. Configure variável `baseUrl`: `http://localhost:3001/api`
3. Teste todos os endpoints

## ✅ Checklist de Testes

### Interface (UI)
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Cards mostram dados corretos
- [ ] Navegação entre páginas funciona
- [ ] Plugins são listados
- [ ] Configurações são exibidas
- [ ] Logout funciona
- [ ] Notificações (toast) aparecem
- [ ] Design responsivo funciona

### Funcionalidades
- [ ] Validação de licença funciona
- [ ] Controle de quota funciona
- [ ] Plugins são filtrados por plano
- [ ] Métricas são atualizadas
- [ ] Tokens JWT são gerados
- [ ] Rate limiting funciona (teste 100+ requests)

### Segurança
- [ ] Rotas protegidas requerem token
- [ ] Token inválido retorna 401
- [ ] Rate limiting bloqueia após limite
- [ ] CORS está configurado
- [ ] Headers de segurança presentes

### Performance
- [ ] UI carrega em < 2 segundos
- [ ] API responde em < 100ms
- [ ] Sem memory leaks
- [ ] CPU usage < 50%

## 🐛 Problemas Comuns

### 1. "Cannot connect to server"

**Solução:**
```bash
# Verificar se servidores estão rodando
ps aux | grep node

# Reiniciar
make stop
make dev
```

### 2. "Port already in use"

**Solução:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### 3. "Module not found"

**Solução:**
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### 4. UI não carrega

**Solução:**
```bash
cd ui
rm -rf node_modules dist
npm install
npm run dev
```

## 📊 Métricas de Sucesso

Após os testes, você deve ter:

- ✅ 100% das páginas funcionando
- ✅ 100% dos endpoints respondendo
- ✅ 0 erros no console
- ✅ Tempo de resposta < 100ms
- ✅ UI responsiva e fluida

## 🎉 Próximos Passos

Após validar que tudo funciona:

1. **Desenvolvimento:**
   - Adicione novos plugins
   - Customize a UI
   - Integre com seus sistemas

2. **Produção:**
   - Revise [CHECKLIST_PRODUCAO.md](./CHECKLIST_PRODUCAO.md)
   - Configure VPS real
   - Deploy com Docker

3. **Expansão:**
   - Adicione mais funcionalidades
   - Crie marketplace de plugins
   - Implemente pagamentos

## 📚 Recursos Adicionais

- [Documentação Completa](./README.md)
- [Arquitetura](./docs/ARCHITECTURE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Exemplos de Uso](./EXEMPLOS_USO.md)

---

**Tempo total de teste:** ~15 minutos

**Boa sorte com os testes! 🚀**
