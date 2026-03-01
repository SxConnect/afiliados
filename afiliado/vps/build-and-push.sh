#!/bin/bash

# Script para build e push da imagem Docker da VPS para GHCR
# Uso: ./build-and-push.sh [tag]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações
REGISTRY="ghcr.io"
REPO="sxconnect/afiliados"
IMAGE_NAME="vps"
TAG="${1:-latest}"

FULL_IMAGE="${REGISTRY}/${REPO}/${IMAGE_NAME}:${TAG}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Build e Push - VPS Docker Image${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Verificar se está logado no GHCR
echo -e "${YELLOW}[1/5] Verificando autenticação no GHCR...${NC}"
if ! docker info | grep -q "ghcr.io"; then
    echo -e "${YELLOW}Fazendo login no GHCR...${NC}"
    echo "Execute: echo \$GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin"
    exit 1
fi
echo -e "${GREEN}✓ Autenticado no GHCR${NC}"
echo ""

# Build da imagem
echo -e "${YELLOW}[2/5] Construindo imagem Docker...${NC}"
docker build \
    --platform linux/amd64,linux/arm64 \
    --tag "${FULL_IMAGE}" \
    --tag "${REGISTRY}/${REPO}/${IMAGE_NAME}:main" \
    --label "org.opencontainers.image.source=https://github.com/${REPO}" \
    --label "org.opencontainers.image.description=VPS License Validation Server" \
    --label "org.opencontainers.image.licenses=Proprietary" \
    .

echo -e "${GREEN}✓ Imagem construída com sucesso${NC}"
echo ""

# Testar a imagem localmente
echo -e "${YELLOW}[3/5] Testando imagem localmente...${NC}"
CONTAINER_ID=$(docker run -d -p 4001:4000 -e NODE_ENV=test "${FULL_IMAGE}")
sleep 5

if curl -f http://localhost:4001/api/plans > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Imagem funcionando corretamente${NC}"
else
    echo -e "${RED}✗ Erro ao testar imagem${NC}"
    docker logs "${CONTAINER_ID}"
    docker stop "${CONTAINER_ID}"
    docker rm "${CONTAINER_ID}"
    exit 1
fi

docker stop "${CONTAINER_ID}"
docker rm "${CONTAINER_ID}"
echo ""

# Push para GHCR
echo -e "${YELLOW}[4/5] Enviando imagem para GHCR...${NC}"
docker push "${FULL_IMAGE}"
docker push "${REGISTRY}/${REPO}/${IMAGE_NAME}:main"
echo -e "${GREEN}✓ Imagem enviada com sucesso${NC}"
echo ""

# Informações finais
echo -e "${YELLOW}[5/5] Resumo${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Imagem: ${FULL_IMAGE}"
echo -e "Tags:"
echo -e "  - ${REGISTRY}/${REPO}/${IMAGE_NAME}:${TAG}"
echo -e "  - ${REGISTRY}/${REPO}/${IMAGE_NAME}:main"
echo ""
echo -e "Para usar a imagem:"
echo -e "  docker pull ${FULL_IMAGE}"
echo -e "  docker run -d -p 4000:4000 ${FULL_IMAGE}"
echo ""
echo -e "Ou com docker-compose:"
echo -e "  docker-compose up -d"
echo -e "${GREEN}========================================${NC}"
