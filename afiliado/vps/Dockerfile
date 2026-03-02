# Dockerfile para VPS License Server - Arquitetura 10K Usuários
# Imagem otimizada para produção com cluster mode

# Stage 1: Build
FROM node:20-alpine AS builder

LABEL org.opencontainers.image.source="https://github.com/SxConnect/afiliados"
LABEL org.opencontainers.image.description="VPS License Validation Server - Production Ready for 10K Users"
LABEL org.opencontainers.image.licenses="Proprietary"
LABEL org.opencontainers.image.version="2.0.0"

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências de produção
RUN npm install --production && \
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
COPY --chown=nodejs:nodejs package*.json ./
COPY --chown=nodejs:nodejs server.js ./
COPY --chown=nodejs:nodejs server-production.js ./
COPY --chown=nodejs:nodejs src ./src
COPY --chown=nodejs:nodejs database ./database
COPY --chown=nodejs:nodejs .env* ./

# Criar diretórios necessários
RUN mkdir -p logs && chown nodejs:nodejs logs

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {let d='';r.on('data',c=>d+=c);r.on('end',()=>{try{const j=JSON.parse(d);process.exit(j.status==='ok'&&j.database?.connected?0:1)}catch(e){process.exit(1)}})})"

# Usar dumb-init para gerenciar processos
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar em modo produção com cluster
CMD ["node", "server-production.js"]
