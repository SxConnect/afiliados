# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Planejado
- Sistema de pagamento integrado
- Marketplace de plugins
- Analytics avançado
- API pública

## [1.2.0] - 2024-03-01

### Adicionado - Etapa 1: VPS Deploy
- Dockerfile multi-stage otimizado para Node 20-alpine
- GitHub Actions workflow para build e push automático para GHCR
- docker-compose.yml compatível com Portainer
- Labels Traefik configuradas (router, TLS, certresolver)
- Healthcheck implementado no container
- Script de testes automatizados (test-api.sh)
- Endpoint `/health` melhorado com métricas
- Endpoint `/api/license/status` para status da licença
- Graceful shutdown (SIGTERM, SIGINT)
- Error handlers (404, 500)
- Logging estruturado

### Modificado
- server.js com chave privada opcional (desenvolvimento)
- server.js com versão da API (1.0.0)
- .dockerignore otimizado
- .env.example com todas as variáveis

### Documentação
- Adicionado `docs/ETAPA1_DEPLOY_GUIDE.md` - Guia completo de deploy
- Adicionado `ETAPA1_CHECKLIST.md` - Checklist de validação
- Adicionado `ETAPA1_QUICK_COMMANDS.md` - Comandos rápidos
- Adicionado `vps/README.md` - Documentação da VPS
- Atualizado README.md com seção de Deploy

### DevOps
- CI/CD completo com GitHub Actions
- Build multi-platform (amd64, arm64)
- Cache de build habilitado
- Tags automáticas (latest, version)
- Integração com GHCR (GitHub Container Registry)

### Segurança
- Usuário não-root no container (nodejs:1001)
- Secrets via variáveis de ambiente
- Rate limiting configurado (Traefik)
- CORS configurável

## [1.1.0] - 2024-03-01

### Adicionado
- Integração com Pastorini API v1.6 para validação de números WhatsApp
- Validação automática de números durante o login
- Suporte para API Key da Pastorini via header `x-api-key`
- Documentação completa da integração Pastorini
- Variáveis de ambiente `PASTORINI_API_KEY` e `PASTORINI_INSTANCE_ID`
- Método `ValidateNumberWithPastorini()` no cliente VPS
- Retorno do JID do WhatsApp na resposta de login
- Tratamento de erros específicos para números inválidos

### Modificado
- Handler de login agora valida número com Pastorini antes de processar
- Cliente VPS aceita API Key como parâmetro
- Configuração do Core suporta credenciais Pastorini
- Chave pública RSA agora é opcional (para ambientes de desenvolvimento)

### Documentação
- Adicionado `docs/PASTORINI_INTEGRATION.md` - Guia completo de integração
- Adicionado `PASTORINI_INTEGRATION_SUMMARY.md` - Resumo da implementação
- Atualizado `QUICKSTART.md` com seção Pastorini
- Atualizado `README.md` com diagrama incluindo Pastorini
- Atualizado `docs/INDEX.md` com links para documentação Pastorini
- Atualizado `.env.example` com variáveis Pastorini

### Segurança
- Validação em múltiplas camadas (formato → WhatsApp → licença → assinatura)
- API Key protegida em variável de ambiente
- Timeout configurável para requisições Pastorini

## [1.0.0] - 2024-03-01

### Adicionado
- Arquitetura híbrida (Electron + Go + VPS)
- Sistema de autenticação com validação remota
- Controle de quota na VPS
- Sistema de plugins modulares
- Dashboard com métricas
- Página de plugins
- Página de configurações
- Assinatura criptográfica RSA
- Fingerprint de máquina
- Tokens temporários
- Documentação completa
- Guia de início rápido
- CI/CD com GitHub Actions
- Docker support
- Makefile para automação

### Segurança
- Implementação de múltiplas camadas de proteção
- Validação remota obrigatória
- Controle de quota exclusivamente na VPS
- Verificação de assinatura criptográfica

### Documentação
- ARCHITECTURE.md - Arquitetura do sistema
- PLUGINS.md - Sistema de plugins
- SECURITY.md - Modelo de segurança
- DEPLOYMENT.md - Guia de deploy
- MONETIZATION.md - Modelo de negócio
- QUICKSTART.md - Início rápido
- CONTRIBUTING.md - Guia de contribuição

## [0.1.0] - 2024-02-15

### Adicionado
- Estrutura inicial do projeto
- Configuração básica do Electron
- Setup do Core em Go
- Servidor VPS básico
- Tipos compartilhados

---

## Tipos de Mudanças

- `Adicionado` para novas funcionalidades
- `Modificado` para mudanças em funcionalidades existentes
- `Descontinuado` para funcionalidades que serão removidas
- `Removido` para funcionalidades removidas
- `Corrigido` para correções de bugs
- `Segurança` para vulnerabilidades corrigidas
