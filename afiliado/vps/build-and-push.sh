#!/bin/bash
# Build and Push VPS Docker Image to GHCR

set -e

IMAGE_NAME="ghcr.io/sxconnect/afiliados-vps"
VERSION=$(cat ../VERSION 2>/dev/null || echo "1.0.0")

echo "🔨 Building VPS Docker image..."
docker build -t ${IMAGE_NAME}:latest -t ${IMAGE_NAME}:${VERSION} .

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "To push to GitHub Container Registry:"
echo "1. Login: echo \$GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin"
echo "2. Push: docker push ${IMAGE_NAME}:latest && docker push ${IMAGE_NAME}:${VERSION}"
echo ""
echo "Or run: ./push-to-ghcr.sh"
