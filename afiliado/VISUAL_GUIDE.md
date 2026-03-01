# Guia Visual do Afiliado Pro

## 🎯 Visão Geral em 1 Minuto

```
┌─────────────────────────────────────────────────────────────┐
│                     AFILIADO PRO                            │
│         Sistema Profissional de Escala para Afiliados      │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   ELECTRON   │ ◄──► │      GO      │ ◄──► │   NODE.JS    │
│   + REACT    │ API  │    ENGINE    │ HTTPS│     VPS      │
│              │Local │              │      │              │
│  Interface   │      │  Validação   │      │ Autorização  │
│  Dashboard   │      │  Segurança   │      │  Licenças    │
│   Plugins    │      │   Plugins    │      │    Quota     │
└──────────────┘      └──────────────┘      └──────────────┘
```

---

## 🏗️ Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA 1 - UI                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Login   │  │Dashboard │  │ Plugins  │  │ Settings │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                    Electron + React + TypeScript            │
└─────────────────────────────────────────────────────────────┘
                              ▼ API Local
┌─────────────────────────────────────────────────────────────┐
│                   CAMADA 2 - CORE                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   API    │  │ Security │  │ Plugins  │  │   VPS    │   │
│  │  Server  │  │  Crypto  │  │ Manager  │  │  Client  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                         Go Engine                           │
└─────────────────────────────────────────────────────────────┘
                              ▼ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA 3 - VPS                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Validação │  │ Licenças │  │  Quota   │  │ Plugins  │   │
│  │ Usuário  │  │  Tokens  │  │ Control  │  │ Control  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                      Node.js Server                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Fluxo de Segurança

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE LOGIN                           │
└─────────────────────────────────────────────────────────────┘

1. Usuário insere WhatsApp
         │
         ▼
2. UI envia para Core
         │
         ▼
3. Core gera Fingerprint
         │
         ▼
4. Core envia para VPS
   ├─ Phone
   └─ Fingerprint
         │
         ▼
5. VPS valida usuário
   ├─ Verifica plano
   ├─ Verifica quota
   └─ Gera token
         │
         ▼
6. VPS assina token (RSA)
         │
         ▼
7. Core recebe resposta
   ├─ Token
   ├─ Assinatura
   └─ Dados do usuário
         │
         ▼
8. Core verifica assinatura
         │
         ▼
9. UI recebe autorização
         │
         ▼
10. Dashboard liberado ✓
```

---

## 🧩 Sistema de Plugins

```
┌─────────────────────────────────────────────────────────────┐
│                  ARQUITETURA DE PLUGINS                     │
└─────────────────────────────────────────────────────────────┘

plugins/
├── plugin-analytics/
│   ├── manifest.json ◄─── Metadados
│   ├── index.js      ◄─── Código principal
│   └── assets/       ◄─── Recursos
│
├── plugin-templates/
│   ├── manifest.json
│   ├── index.js
│   └── assets/
│
└── plugin-automation/
    ├── manifest.json
    ├── index.js
    └── assets/

         ▼ Carregamento Dinâmico

┌─────────────────────────────────────────────────────────────┐
│                   PLUGIN MANAGER                            │
│                                                             │
│  1. Lê diretório de plugins                                │
│  2. Valida manifest.json                                   │
│  3. Verifica permissões do usuário                         │
│  4. Carrega plugin se autorizado                           │
│  5. Fornece Context API                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 💰 Modelo de Monetização

```
┌─────────────────────────────────────────────────────────────┐
│                    PLANOS E PREÇOS                          │
└─────────────────────────────────────────────────────────────┘

FREE          BASE          GROWTH         PRO
R$ 0/mês      R$ 97/mês     R$ 297/mês     R$ 997/mês
───────────   ───────────   ───────────    ───────────
10 vídeos     100 vídeos    500 vídeos     10k vídeos
0 plugins     1 plugin      3 plugins      ∞ plugins
Básico        Métricas      Analytics      White Label
              
┌─────────────────────────────────────────────────────────────┐
│                  RECEITAS ADICIONAIS                        │
└─────────────────────────────────────────────────────────────┘

PLUGINS MODULARES          QUOTA ADICIONAL
─────────────────          ───────────────
Básicos: R$ 47/mês         R$ 0,50/vídeo
Avançados: R$ 97/mês       Pacotes com desconto
Premium: R$ 197/mês        Pay-as-you-go

┌─────────────────────────────────────────────────────────────┐
│                  PROJEÇÃO DE RECEITA                        │
└─────────────────────────────────────────────────────────────┘

2024                       2025
────────                   ────────
1.000 usuários             10.000 usuários
R$ 100k MRR                R$ 1M MRR
10 plugins                 50 plugins
Break-even Q3              Lucratividade 40%
```

---

## 📊 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│              FLUXO DE GERAÇÃO DE VÍDEO                      │
└─────────────────────────────────────────────────────────────┘

1. Usuário clica "Criar Vídeo"
         │
         ▼
2. UI solicita ao Core
         │
         ▼
3. Core verifica quota na VPS
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Quota OK   Quota Excedida
    │         │
    │         └──► Erro 403
    │
    ▼
4. VPS autoriza e retorna token
         │
         ▼
5. Core executa geração
   ├─ Carrega plugin necessário
   ├─ Usa API LLM do usuário
   └─ Processa vídeo
         │
         ▼
6. Core notifica VPS (incrementa quota)
         │
         ▼
7. UI recebe vídeo gerado ✓
```

---

## 🚀 Roadmap Visual

```
2024
────────────────────────────────────────────────────────────

Q1 ✅                Q2 🔄              Q3 📅              Q4 📅
─────                ─────              ─────              ─────
Arquitetura          Pagamentos         Marketplace        SaaS
Plugins Base         5 Plugins          Plano Pro          Mobile
Documentação         Planos Ativos      API Pública        Enterprise

2025
────────────────────────────────────────────────────────────

Q1 🚀                Q2 🚀              Q3 🚀              Q4 🚀
─────                ─────              ─────              ─────
Marketplace          Multi-idioma       Blockchain         IPO Prep
SDK v2               Internacional      NFT Support        Enterprise+
GraphQL              Academy            Crypto Pay         Aquisições
```

---

## 📈 Métricas de Sucesso

```
┌─────────────────────────────────────────────────────────────┐
│                    KPIs PRINCIPAIS                          │
└─────────────────────────────────────────────────────────────┘

PRODUTO                    NEGÓCIO                 USUÁRIOS
───────                    ───────                 ────────
Uptime: 99.9%              MRR: R$ 100k            NPS: >50
Latência: <100ms           CAC: <R$ 50             Retenção: >80%
Performance: ⚡            LTV: >R$ 1.500          Conversão: >15%

┌─────────────────────────────────────────────────────────────┐
│                  CRESCIMENTO ESPERADO                       │
└─────────────────────────────────────────────────────────────┘

    Usuários                MRR                  Plugins
    ────────                ───                  ───────
    
    10k │                   1M │                  50 │
        │         ╱             │       ╱             │      ╱
     5k │      ╱                │    ╱                │   ╱
        │   ╱               500k │ ╱              25 │╱
     1k │╱                      │╱                   │
        └────────────            └────────────       └────────────
        2024    2025            2024    2025        2024    2025
```

---

## 🛠️ Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────┐
│                  TECNOLOGIAS UTILIZADAS                     │
└─────────────────────────────────────────────────────────────┘

FRONTEND              BACKEND              DEVOPS
────────              ───────              ──────
Electron 28+          Go 1.21+             Docker
React 18+             Gin Framework        GitHub Actions
TypeScript 5+         JWT/RSA              Make
Vite 5+               Crypto               Git
Axios                 Node.js 18+          
                      Express 4+           

SEGURANÇA             DATABASE             CLOUD
─────────             ────────             ─────
RSA-2048              (Futuro)             VPS
SHA-256               PostgreSQL           CDN (futuro)
JWT                   Redis                S3 (futuro)
Fingerprint           
```

---

## 📁 Estrutura Simplificada

```
afiliado/
│
├── 📱 ui/                  ← Interface (Electron + React)
│   ├── electron/           ← Processo principal
│   └── src/                ← Código React
│       ├── pages/          ← Páginas
│       └── services/       ← API client
│
├── ⚙️ core/                ← Engine (Go)
│   └── internal/
│       ├── api/            ← Servidor HTTP
│       ├── security/       ← Criptografia
│       ├── plugins/        ← Gerenciador
│       └── vps/            ← Cliente VPS
│
├── 🌐 vps/                 ← Servidor (Node.js)
│   ├── server.js           ← API REST
│   └── scripts/            ← Utilitários
│
├── 🧩 plugins/             ← Plugins modulares
│   └── example-plugin/
│
└── 📚 docs/                ← Documentação
    ├── ARCHITECTURE.md
    ├── SECURITY.md
    ├── PLUGINS.md
    └── ...
```

---

## 🎓 Próximos Passos

```
┌─────────────────────────────────────────────────────────────┐
│                  COMEÇAR AGORA                              │
└─────────────────────────────────────────────────────────────┘

1. Leia o QUICKSTART.md
         │
         ▼
2. Instale as dependências
         │
         ▼
3. Execute make run
         │
         ▼
4. Explore o Dashboard
         │
         ▼
5. Leia a documentação completa
         │
         ▼
6. Contribua com o projeto! 🚀
```

---

**Versão**: 1.0.0  
**Data**: Março 2024  
**Status**: Pronto para uso! ✅
