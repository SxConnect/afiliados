# Multi-stage build para otimização

# Stage 1: Build da UI
FROM node:20-alpine AS ui-builder
WORKDIR /app/ui
COPY ui/package*.json ./
RUN npm ci
COPY ui/ ./
RUN npm run build

# Stage 2: Core Engine
FROM node:20-alpine AS core
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
COPY plugins/ ./plugins/
COPY --from=ui-builder /app/ui/dist ./ui/dist

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "src/core/server.js"]
