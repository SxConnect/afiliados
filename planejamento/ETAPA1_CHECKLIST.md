# ✅ Checklist - Etapa 1: Deploy VPS

## Pré-requisitos

- [ ] Repositório GitHub criado e público
- [ ] Docker instalado na VPS
- [ ] Portainer instalado e rodando
- [ ] Traefik configurado como reverse proxy
- [ ] Domínio configurado (ex: api.afiliado.sxconnect.com.br)

## 1. Preparação Local

- [ ] Dockerfile criado e otimizado
- [ ] package.json configurado
- [ ] server.js implementado com todos os endpoints
- [ ] .env.example criado
- [ ] .dockerignore configurado
- [ ] docker-compose.yml criado
- [ ] GitHub Actions workflow criado

## 2. Configuração GitHub

- [ ] Repositório público em https://github.com/SxConnect/afiliados.git
- [ ] Secrets configurados (se necessário)
- [ ] Workflow habilitado

## 3. Build e Push

- [ ] Commit realizado
- [ ] Push para GitHub
- [ ] GitHub Actions executou com sucesso
- [ ] Imagem publicada no GHCR
- [ ] Imagem visível em ghcr.io/sxconnect/afiliados:latest

## 4. Deploy na VPS

- [ ] Acesso ao Portainer
- [ ] Stack criada com nome "afiliado-license-api"
- [ ] docker-compose.yml colado
- [ ] Variáveis de ambiente configuradas:
  - [ ] JWT_SECRET
  - [ ] LICENSE_SECRET
  - [ ] PASTORINI_API_KEY (opcional)
  - [ ] PASTORINI_INSTANCE_ID (opcional)
- [ ] Deploy executado
- [ ] Container iniciado com sucesso

## 5. Validação Traefik

- [ ] Labels Traefik aplicadas corretamente
- [ ] Router criado
- [ ] Certificado SSL emitido
- [ ] Domínio resolvendo corretamente
- [ ] HTTPS funcionando

## 6. Testes

- [ ] Healthcheck respondendo: `curl https://api.afiliado.sxconnect.com.br/health`
- [ ] HTTP 200 retornado
- [ ] JSON válido retornado
- [ ] TLS válido (sem erros de certificado)
- [ ] Container healthy no Portainer
- [ ] Logs sem erros

## 7. Testes de API

- [ ] POST /api/validate-license funcionando
- [ ] POST /api/check-quota funcionando
- [ ] POST /api/consume-quota funcionando
- [ ] POST /api/validate-plugin funcionando
- [ ] Rate limiting funcionando (100 req/15min)
- [ ] Tokens JWT sendo gerados
- [ ] Assinaturas HMAC validando

## 8. Monitoramento

- [ ] Logs estruturados visíveis
- [ ] Healthcheck passando
- [ ] Container reiniciando automaticamente se cair
- [ ] Métricas disponíveis no Traefik

## 9. Documentação

- [ ] README.md atualizado
- [ ] Guias de deploy criados
- [ ] Comandos documentados
- [ ] Troubleshooting documentado

## 10. Critérios de Aceitação Final

- [ ] ✅ Imagem no GHCR
- [ ] ✅ Deploy via Portainer funcionando
- [ ] ✅ Traefik resolvendo domínio com HTTPS
- [ ] ✅ Healthcheck ativo
- [ ] ✅ Container reinicia automaticamente
- [ ] ✅ API respondendo corretamente
- [ ] ✅ Logs sem erros críticos

---

## Status: ⏳ Em Progresso

**Última atualização:** 2024-01-01

**Próximos passos:**
1. Remover lock do git
2. Fazer commit e push
3. Verificar build no GitHub Actions
4. Deploy no Portainer
5. Validar funcionamento
