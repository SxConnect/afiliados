# Índice da Documentação

Bem-vindo à documentação completa do Afiliado Pro! Este índice ajuda você a encontrar rapidamente o que precisa.

---

## 🚀 Começando

### Para Usuários
- [Início Rápido](../QUICKSTART.md) - Setup em 5 minutos
- [FAQ](FAQ.md) - Perguntas frequentes
- [Guia de Instalação](SETUP.md) - Instalação detalhada

### Para Desenvolvedores
- [Estrutura do Projeto](../PROJECT_STRUCTURE.md) - Visão geral
- [Contribuindo](../CONTRIBUTING.md) - Como contribuir
- [Changelog](../CHANGELOG.md) - Histórico de mudanças

---

## 📚 Documentação Técnica

### Arquitetura
- [Arquitetura do Sistema](ARCHITECTURE.md) - Design completo
  - Camadas da aplicação
  - Fluxo de dados
  - Tecnologias utilizadas
  - Escalabilidade

### API
- [Documentação da API](API.md) - Referência completa
  - Core Engine API
  - VPS API
  - Códigos de erro
  - Exemplos de uso

### Integrações
- [Integração Pastorini API](PASTORINI_INTEGRATION.md) - Validação WhatsApp
  - Configuração
  - Fluxo de validação
  - Tratamento de erros
  - Segurança

### Segurança
- [Modelo de Segurança](SECURITY.md) - Proteções implementadas
  - Assinatura criptográfica
  - Validação remota
  - Fingerprint
  - Anti-pirataria

### Plugins
- [Sistema de Plugins](PLUGINS.md) - Criar e distribuir plugins
  - Estrutura de um plugin
  - Manifest.json
  - Context API
  - Exemplos práticos

---

## 🛠️ Operações

### Deploy
- [Guia de Deploy](DEPLOYMENT.md) - Colocar em produção
  - Deploy da VPS
  - Build do executável
  - Docker
  - Monitoramento

### Setup
- [Configuração](SETUP.md) - Setup detalhado
  - Pré-requisitos
  - Instalação
  - Configuração
  - Troubleshooting

---

## 💼 Negócio

### Monetização
- [Modelo de Monetização](MONETIZATION.md) - Estratégia de receita
  - Planos e preços
  - Plugins pagos
  - Quota adicional
  - Métricas de sucesso

### Roadmap
- [Roadmap do Produto](ROADMAP.md) - Visão de futuro
  - Q1-Q4 2024
  - 2025 e além
  - Features planejadas
  - Métricas de sucesso

### Resumo Executivo
- [Executive Summary](EXECUTIVE_SUMMARY.md) - Visão geral do negócio
  - Problema e solução
  - Modelo de negócio
  - Projeções financeiras
  - Vantagens competitivas

---

## 📖 Guias por Persona

### 👨‍💻 Desenvolvedor Frontend
1. [Estrutura do Projeto](../PROJECT_STRUCTURE.md)
2. [UI Architecture](ARCHITECTURE.md#camada-1--ui-electron)
3. [API Client](API.md#core-engine-api)
4. [Contribuindo](../CONTRIBUTING.md)

### 👨‍💻 Desenvolvedor Backend
1. [Core Engine](ARCHITECTURE.md#camada-2--core-engine-go)
2. [VPS Server](ARCHITECTURE.md#camada-3--vps-nodejs)
3. [API Documentation](API.md)
4. [Security Model](SECURITY.md)
5. [Pastorini Integration](PASTORINI_INTEGRATION.md)

### 🔌 Desenvolvedor de Plugins
1. [Sistema de Plugins](PLUGINS.md)
2. [Plugin Examples](PLUGINS.md#exemplo-completo)
3. [Context API](PLUGINS.md#context-api)
4. [Marketplace](ROADMAP.md#marketplace)

### 🚀 DevOps
1. [Deployment Guide](DEPLOYMENT.md)
2. [Docker Setup](DEPLOYMENT.md#opção-2-docker)
3. [Monitoring](DEPLOYMENT.md#monitoramento)
4. [CI/CD](../PROJECT_STRUCTURE.md#github)

### 💼 Product Manager
1. [Executive Summary](EXECUTIVE_SUMMARY.md)
2. [Roadmap](ROADMAP.md)
3. [Monetization](MONETIZATION.md)
4. [FAQ](FAQ.md)

### 👤 Usuário Final
1. [Quickstart](../QUICKSTART.md)
2. [FAQ](FAQ.md)
3. [Troubleshooting](SETUP.md#troubleshooting)

---

## 🔍 Busca Rápida

### Conceitos
- **Arquitetura Híbrida**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Assinatura Criptográfica**: [SECURITY.md](SECURITY.md#assinatura-criptográfica)
- **Fingerprint**: [SECURITY.md](SECURITY.md#fingerprint-da-máquina)
- **Pastorini API**: [PASTORINI_INTEGRATION.md](PASTORINI_INTEGRATION.md)
- **Plugins**: [PLUGINS.md](PLUGINS.md)
- **Quota**: [MONETIZATION.md](MONETIZATION.md#quota-adicional)
- **Validação Remota**: [SECURITY.md](SECURITY.md#validação-remota-obrigatória)

### Tecnologias
- **Electron**: [ARCHITECTURE.md](ARCHITECTURE.md#camada-1--ui-electron)
- **Go**: [ARCHITECTURE.md](ARCHITECTURE.md#camada-2--core-engine-go)
- **Node.js**: [ARCHITECTURE.md](ARCHITECTURE.md#camada-3--vps-nodejs)
- **React**: [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md#-ui-electron--react)
- **Docker**: [DEPLOYMENT.md](DEPLOYMENT.md#opção-2-docker)

### Processos
- **Build**: [SETUP.md](SETUP.md#build-para-produção)
- **Deploy**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Testing**: [CONTRIBUTING.md](../CONTRIBUTING.md#testes)
- **CI/CD**: [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md#github)

---

## 📊 Diagramas

### Fluxo de Autenticação
```
Usuário → UI → Core → VPS
         ↓     ↓      ↓
      Login  Valida  Autoriza
         ↓     ↓      ↓
      Token ← ← ← Assinado
```

### Fluxo de Quota
```
Ação → Core → VPS (verifica)
  ↓      ↓       ↓
Executa ← ← Autorizado
  ↓
VPS (incrementa)
```

### Arquitetura de Plugins
```
Core → Plugin Manager
  ↓         ↓
Carrega → Valida → Executa
  ↓         ↓         ↓
Plugin ← Context ← API
```

---

## 🆘 Precisa de Ajuda?

### Problemas Técnicos
1. Verifique [FAQ](FAQ.md)
2. Veja [Troubleshooting](SETUP.md#troubleshooting)
3. Abra uma [Issue](https://github.com/afiliado/issues)

### Dúvidas de Negócio
1. Leia [Executive Summary](EXECUTIVE_SUMMARY.md)
2. Veja [Monetization](MONETIZATION.md)
3. Entre em contato: business@afiliado.com

### Contribuições
1. Leia [Contributing](../CONTRIBUTING.md)
2. Veja [Roadmap](ROADMAP.md)
3. Abra um [Pull Request](https://github.com/afiliado/pulls)

---

## 📝 Convenções

### Documentação
- Markdown para todos os docs
- Diagramas em ASCII art
- Exemplos de código comentados
- Links relativos entre docs

### Código
- Go: [Effective Go](https://golang.org/doc/effective_go)
- TypeScript: [Style Guide](https://google.github.io/styleguide/tsguide.html)
- Commits: [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🔄 Atualizações

Esta documentação é atualizada continuamente. Última atualização: **Março 2024**

Para sugerir melhorias na documentação, abra uma issue com a tag `documentation`.

---

**Versão da Documentação**: 1.0.0  
**Compatível com**: Afiliado Pro v1.0.0+
