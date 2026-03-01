# 👋 COMECE AQUI - Sistema de Afiliados

## 🎉 Bem-vindo!

Você tem em mãos um **sistema completo e funcional** de automação de WhatsApp para afiliados com validação em múltiplas camadas.

---

## ⚡ Início Ultra-Rápido (3 minutos)

### 1. Instalar (1 minuto)
```bash
cd afiliado
npm install && cd vps && npm install && cd ../ui && npm install && cd ..
```

### 2. Executar (30 segundos)
```bash
# Windows
scripts\start-dev.bat

# Linux/Mac
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

### 3. Testar (1 minuto)
```bash
npm test
```

**Resultado esperado**: ✅ 8/8 testes passando (100%)

---

## 📖 O Que Você Tem

### ✅ Sistema Completo de Validação

```
1. WhatsApp ──> Verifica se número está registrado (PAPI API)
2. Banco de Dados ──> Verifica se tem licença ativa (VPS)
3. Status ──> Verifica se licença não expirou
4. Permissões ──> Verifica plano e direitos de uso
5. Dispositivo ──> Verifica machine fingerprint (único por PC)
```

### ✅ 4 Planos Prontos

| Plano | Quota | Teste com |
|-------|-------|-----------|
| Pro | Ilimitado | 5511999999999 |
| Growth | 500/mês | 5511888888888 |
| Basic | 100/mês | 5511777777777 |
| Free | 10/mês | - |

### ✅ Interface Profissional

- Login com validação
- Dashboard com métricas
- Gerenciamento de plugins
- Configurações

### ✅ Segurança Robusta

- JWT Tokens
- RSA-2048
- Machine Fingerprint
- Rate Limiting
- Validação Remota

---

## 🚀 Próximos Passos

### Opção 1: Testar Agora (Recomendado)
👉 **[EXECUTAR_AGORA.md](./EXECUTAR_AGORA.md)**
- Guia passo a passo
- 5 minutos para rodar tudo
- Testes automatizados

### Opção 2: Entender o Sistema
👉 **[RESUMO_EXECUTIVO.md](./RESUMO_EXECUTIVO.md)**
- O que foi implementado
- Como funciona
- Estatísticas

### Opção 3: Ver Detalhes Técnicos
👉 **[STATUS_IMPLEMENTACAO.md](./STATUS_IMPLEMENTACAO.md)**
- Status de cada funcionalidade
- Código implementado
- Testes disponíveis

### Opção 4: Explorar Documentação
👉 **[INDICE.md](./INDICE.md)**
- 44+ documentos
- Organizado por categoria
- Busca rápida

---

## 🎯 Fluxo de Validação (Resumo)

```
┌─────────────┐
│   USUÁRIO   │ Digite: 5511999999999
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  1. Verifica no WhatsApp (PAPI)    │ ✅ Número existe
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  2. Verifica no Banco (VPS)        │ ✅ Licença ativa
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  3. Verifica Expiração             │ ✅ Válida por 30 dias
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  4. Verifica Dispositivo           │ ✅ Machine ID registrado
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  5. Gera Token JWT                 │ ✅ Login completo
└─────────────────────────────────────┘
```

---

## 📊 URLs dos Servidores

Após executar `scripts\start-dev.bat`:

- **UI**: http://localhost:3000 (Interface)
- **Core**: http://localhost:3001 (API)
- **VPS**: http://localhost:4000 (Validação)

---

## 🧪 Testar Agora

### Via Interface (Mais Fácil)

1. Abra: http://localhost:3000
2. Digite: `5511999999999`
3. Clique: "Entrar"
4. Veja: Dashboard com suas informações

### Via Script (Mais Completo)

```bash
npm test
```

Você verá:
```
✓ Core Engine: ok
✓ VPS Server: 4 planos disponíveis
✓ Validação bem-sucedida!
   Plano: pro
   Quota: 999999/999999
   Plugins: *
...
🎉 TODOS OS TESTES PASSARAM!
```

---

## 📚 Documentação Essencial

### Para Começar
1. **[EXECUTAR_AGORA.md](./EXECUTAR_AGORA.md)** - Guia de execução
2. **[COMO_TESTAR.md](./COMO_TESTAR.md)** - Guia de testes

### Para Entender
3. **[RESUMO_EXECUTIVO.md](./RESUMO_EXECUTIVO.md)** - Visão geral
4. **[docs/FLUXO_VALIDACAO.md](./docs/FLUXO_VALIDACAO.md)** - Fluxo técnico

### Para Desenvolver
5. **[docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)** - API REST
6. **[ESTRUTURA_PROJETO.md](./ESTRUTURA_PROJETO.md)** - Estrutura

### Índice Completo
7. **[INDICE.md](./INDICE.md)** - Todos os 44+ documentos

---

## ❓ Perguntas Frequentes

### Como funciona a validação?
👉 Leia: [docs/FLUXO_VALIDACAO.md](./docs/FLUXO_VALIDACAO.md)

### Como testar o sistema?
👉 Leia: [EXECUTAR_AGORA.md](./EXECUTAR_AGORA.md)

### Quais são os planos disponíveis?
👉 Leia: [RESUMO_EXECUTIVO.md](./RESUMO_EXECUTIVO.md#-planos-e-licenças)

### Como funciona o machine fingerprint?
👉 Leia: [docs/FLUXO_VALIDACAO.md](./docs/FLUXO_VALIDACAO.md#4-validação-no-banco-de-dados-vps)

### Onde está o código?
- Core: `core/`
- VPS: `vps/`
- UI: `ui/`
- Plugins: `plugins/`

---

## 🔧 Troubleshooting Rápido

### Erro: "ECONNREFUSED"
```bash
# Verifique se os servidores estão rodando
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :4000
```

### Erro: "Cannot find module"
```bash
# Reinstale as dependências
rm -rf node_modules
npm install
```

### Testes falhando
```bash
# Verifique se os servidores estão rodando
# Execute: scripts\start-dev.bat
# Depois: npm test
```

---

## ✅ Checklist Rápido

Antes de considerar pronto:

- [ ] Instalei as dependências (`npm install`)
- [ ] Iniciei os servidores (`scripts\start-dev.bat`)
- [ ] Executei os testes (`npm test`)
- [ ] Todos os testes passaram (8/8)
- [ ] Testei via interface (http://localhost:3000)
- [ ] Login funcionou com `5511999999999`
- [ ] Vi os logs nos terminais

---

## 🎉 Pronto!

Se você chegou até aqui e todos os testes passaram, **parabéns!**

Você tem um sistema completo e funcional de validação de licenças com:

✅ Validação de WhatsApp
✅ Validação de banco de dados
✅ Controle de permissões
✅ Machine fingerprint
✅ Interface profissional
✅ API REST completa
✅ Documentação completa

---

## 📞 Próximos Passos

1. **Integrar com PAPI real** - Configure a API real do WhatsApp
2. **Banco de dados real** - Migre para PostgreSQL
3. **Deploy** - Coloque em produção
4. **Distribuir** - Compile o Electron

---

## 🚀 Comece Agora!

```bash
# 1. Instalar
npm install && cd vps && npm install && cd ../ui && npm install && cd ..

# 2. Executar
scripts\start-dev.bat

# 3. Testar
npm test
```

**Boa sorte!** 🎉
