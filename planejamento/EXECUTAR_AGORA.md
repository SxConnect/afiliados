# 🚀 EXECUTAR O SISTEMA AGORA

## ⚡ Início Rápido (5 minutos)

### Passo 1: Instalar Dependências (2 min)

Abra o terminal na pasta `afiliado` e execute:

```bash
# Instalar dependências do Core
npm install

# Instalar dependências da VPS
cd vps
npm install
cd ..

# Instalar dependências da UI
cd ui
npm install
cd ..
```

### Passo 2: Iniciar os Servidores (1 min)

#### Windows:
```bash
scripts\start-dev.bat
```

#### Linux/Mac:
```bash
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

Você verá 3 janelas de terminal abrindo:
- ✅ VPS Server (porta 4000)
- ✅ Core Engine (porta 3001)
- ✅ UI (porta 3000)

### Passo 3: Testar o Sistema (2 min)

#### Opção A: Teste Automatizado
```bash
npm test
```

Você verá:
```
╔════════════════════════════════════════════════════════════╗
║     TESTE DO FLUXO DE VALIDAÇÃO - SISTEMA AFILIADOS      ║
╚════════════════════════════════════════════════════════════╝

[PASSO 1] Verificando saúde dos servidores
✓ Core Engine: ok
✓ VPS Server: 4 planos disponíveis

[PASSO 2] Testando validação de licença: 5511999999999
✓ Validação bem-sucedida!
   Plano: pro
   Quota: 999999/999999
   Plugins: *
   Machine ID: abc123...

...

Total de testes: 8
Passou: 8
Falhou: 0
Taxa de sucesso: 100%

🎉 TODOS OS TESTES PASSARAM! Sistema funcionando perfeitamente.
```

#### Opção B: Teste via Interface

1. Abra o navegador em: http://localhost:3000

2. Você verá a tela de login

3. Use uma das licenças de teste:
   - **Pro**: `5511999999999` (ilimitado)
   - **Growth**: `5511888888888` (500 msgs)
   - **Basic**: `5511777777777` (100 msgs)

4. Clique em "Entrar"

5. Você será redirecionado para o Dashboard

6. Observe os logs nos terminais:

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

---

## 🎯 O Que Está Sendo Testado

### 1. Validação de WhatsApp ✅
- Verifica se o número está registrado no WhatsApp
- Usa PAPI API (simulado em desenvolvimento)

### 2. Validação de Banco de Dados ✅
- Verifica se o número está cadastrado
- Verifica se a licença está ativa
- Verifica se a licença não expirou

### 3. Machine Fingerprint ✅
- Gera ID único do dispositivo
- Registra no primeiro login
- Bloqueia uso em outros dispositivos

### 4. Sistema de Planos ✅
- Free: 10 mensagens/mês
- Basic: 100 mensagens/mês
- Growth: 500 mensagens/mês
- Pro: Ilimitado

### 5. Sistema de Plugins ✅
- Free: Nenhum plugin
- Basic: 1 plugin (auto-responder)
- Growth: 2 plugins (auto-responder, message-scheduler)
- Pro: Todos os plugins

---

## 📊 URLs dos Servidores

- **UI (Interface)**: http://localhost:3000
- **Core API**: http://localhost:3001
- **VPS**: http://localhost:4000
- **Health Check**: http://localhost:3001/health

---

## 🔍 Testando Manualmente via API

### 1. Validar Licença

```bash
curl -X POST http://localhost:3001/api/license/validate \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "5511999999999",
    "instanceId": "test-instance"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "plan": "pro",
  "quota": {
    "total": 999999,
    "used": 0,
    "available": 999999
  },
  "plugins": ["*"],
  "expiresAt": 1234567890,
  "machineId": "abc123...",
  "message": "Login realizado com sucesso"
}
```

### 2. Verificar Status

```bash
curl http://localhost:3001/api/license/status \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 3. Verificar Quota

```bash
curl http://localhost:3001/api/metrics/quota \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 4. Listar Plugins

```bash
curl http://localhost:3001/api/plugins \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 5. Listar Planos

```bash
curl http://localhost:4000/api/plans
```

---

## ❌ Testando Erros

### Licença Inválida

```bash
curl -X POST http://localhost:3001/api/license/validate \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "5511000000000",
    "instanceId": "test-instance"
  }'
```

**Resposta esperada:**
```json
{
  "success": false,
  "error": "Número não cadastrado no sistema",
  "details": "Este número não possui uma licença ativa. Entre em contato com o suporte."
}
```

---

## 🐛 Troubleshooting

### Erro: "ECONNREFUSED"
**Solução**: Verifique se todos os servidores estão rodando
```bash
# Verificar processos
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :4000
```

### Erro: "Cannot find module"
**Solução**: Reinstale as dependências
```bash
rm -rf node_modules
npm install
```

### Erro: "Port already in use"
**Solução**: Mate o processo na porta
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### UI não carrega
**Solução**: Limpe o cache do Vite
```bash
cd ui
rm -rf node_modules/.vite
npm run dev
```

---

## 📚 Documentação Completa

- [Status da Implementação](./STATUS_IMPLEMENTACAO.md) - O que foi implementado
- [Fluxo de Validação](./docs/FLUXO_VALIDACAO.md) - Detalhes técnicos
- [Como Testar](./COMO_TESTAR.md) - Guia completo de testes
- [Estrutura do Projeto](./ESTRUTURA_PROJETO.md) - Organização dos arquivos

---

## ✅ Checklist de Verificação

Antes de considerar o teste completo, verifique:

- [ ] VPS Server está rodando na porta 4000
- [ ] Core Engine está rodando na porta 3001
- [ ] UI está rodando na porta 3000
- [ ] Script de teste passou 100%
- [ ] Login via interface funcionou
- [ ] Dashboard carregou corretamente
- [ ] Logs aparecem nos terminais
- [ ] Licença inválida é rejeitada
- [ ] Machine ID é registrado

---

## 🎉 Pronto!

Se todos os testes passaram, o sistema está **100% funcional**!

Você implementou com sucesso:
1. ✅ Validação de número no WhatsApp
2. ✅ Validação no banco de dados
3. ✅ Verificação de permissões
4. ✅ Machine fingerprint
5. ✅ Sistema completo de segurança

**Próximo passo**: Integrar com PAPI API real e banco de dados PostgreSQL.
