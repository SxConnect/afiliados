#!/bin/bash
# Push VPS Docker Image to GHCR

set -e

IMAGE_NAME="ghcr.io/sxconnect/afiliados-vps"
VERSION=$(cat ../VERSION 2>/dev/null || echo "1.0.0")

echo "🔐 Logging into GitHub Container Registry..."
echo "Please make sure you have a GitHub token with write:packages permission"
echo "Create one at: https://github.com/settings/tokens"
echo ""
read -sp "GitHub Token: " GITHUB_TOKEN
echo ""
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

echo ""
echo "🚀 Pushing to GitHub Container Registry..."
docker push ${IMAGE_NAME}:latest
docker push ${IMAGE_NAME}:${VERSION}

echo ""
echo "✅ Done! Images pushed successfully:"
echo "   - ${IMAGE_NAME}:latest"
echo "   - ${IMAGE_NAME}:${VERSION}"
