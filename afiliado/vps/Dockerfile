# Multi-stage build para otimização
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar apenas package files para cache de dependências
COPY package*.json ./

# Instalar dependências de produção
RUN npm ci --only=production && \
    npm cache clean --force

# Stage final
FROM node:20-alpine

# Metadados
LABEL org.opencontainers.image.source="https://github.com/SxConnect/afiliados"
LABEL org.opencontainers.image.description="VPS License API - Sistema de Validação de Licenças"
LABEL org.opencontainers.image.licenses="MIT"

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar dependências do builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar código da aplicação
COPY --chown=nodejs:nodejs . .

# Criar diretório para chaves
RUN mkdir -p /app/keys && \
    chown -R nodejs:nodejs /app/keys

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicialização
CMD ["node", "server.js"]
