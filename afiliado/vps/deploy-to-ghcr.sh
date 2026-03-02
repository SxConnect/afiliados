#!/bin/bash
# Script completo para build e deploy da imagem Docker para GHCR
# Arquitetura 10K Usuários - v2.0.0

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
IMAGE_NAME="ghcr.io/sxconnect/afiliados-vps"
VERSION="2.0.0"
GITHUB_USER="SxConnect"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  VPS Docker Build & Deploy to GHCR${NC}"
echo -e "${BLUE}  Version: ${VERSION}${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. Verificar se está no diretório correto
if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ Dockerfile não encontrado!${NC}"
    echo "Execute este script do diretório afiliado/vps"
    exit 1
fi

# 2. Verificar se GITHUB_TOKEN está definido
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  GITHUB_TOKEN não está definido${NC}"
    echo "Por favor, defina a variável de ambiente:"
    echo "  export GITHUB_TOKEN=seu_token_aqui"
    exit 1
fi

# 3. Login no GHCR
echo -e "${BLUE}🔐 Fazendo login no GitHub Container Registry...${NC}"
echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USER" --password-stdin

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha no login do GHCR${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Login realizado com sucesso${NC}"
echo ""

# 4. Build da imagem
echo -e "${BLUE}🔨 Construindo imagem Docker...${NC}"
echo "  Imagem: ${IMAGE_NAME}"
echo "  Tags: latest, ${VERSION}"
echo ""

docker build \
    --platform linux/amd64 \
    -t ${IMAGE_NAME}:latest \
    -t ${IMAGE_NAME}:${VERSION} \
    --label "org.opencontainers.image.version=${VERSION}" \
    --label "org.opencontainers.image.created=$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
    .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha no build da imagem${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Build concluído com sucesso${NC}"
echo ""

# 5. Push para GHCR
echo -e "${BLUE}📤 Enviando imagem para GHCR...${NC}"

echo "  Pushing ${IMAGE_NAME}:latest..."
docker push ${IMAGE_NAME}:latest

echo "  Pushing ${IMAGE_NAME}:${VERSION}..."
docker push ${IMAGE_NAME}:${VERSION}

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha no push da imagem${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Imagem enviada com sucesso!${NC}"
echo ""

# 6. Informações finais
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "📦 Imagem disponível em:"
echo "  ${IMAGE_NAME}:latest"
echo "  ${IMAGE_NAME}:${VERSION}"
echo ""
echo "🚀 Para atualizar no servidor:"
echo "  1. SSH no servidor VPS"
echo "  2. cd /path/to/docker-compose"
echo "  3. docker-compose pull"
echo "  4. docker-compose up -d"
echo ""
echo "🔍 Verificar imagem no GHCR:"
echo "  https://github.com/orgs/SxConnect/packages/container/package/afiliados-vps"
echo ""
