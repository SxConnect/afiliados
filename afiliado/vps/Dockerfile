# Dockerfile para VPS License Server
# Imagem otimizada para produção

# Stage 1: Build
FROM node:20-alpine AS builder

LABEL org.opencontainers.image.source="https://github.com/SxConnect/afiliados"
LABEL org.opencontainers.image.description="VPS License Validation Server"
LABEL org.opencontainers.image.licenses="Proprietary"

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências de produção
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Production
FROM node:20-alpine

# Instalar dumb-init para gerenciamento de processos
RUN apk add --no-cache dumb-init

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar dependências do builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar código da aplicação
COPY --chown=nodejs:nodejs server.js ./
COPY --chown=nodejs:nodejs .env* ./

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/api/plans', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usar dumb-init para gerenciar processos
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar
CMD ["node", "server.js"]
