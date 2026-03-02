#!/bin/bash
# Script de Setup Inicial para Produção - VPS License Server v2.0.0

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  VPS License Server - Setup Produção${NC}"
echo -e "${BLUE}  Versão: 2.0.0${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  Este script deve ser executado como root${NC}"
    echo "Execute: sudo bash setup-production.sh"
    exit 1
fi

# 1. Verificar dependências
echo -e "${BLUE}📦 Verificando dependências...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado${NC}"
    echo "Instale o Docker: https://docs.docker.com/engine/install/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não encontrado${NC}"
    echo "Instale o Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker: $(docker --version)${NC}"
echo -e "${GREEN}✅ Docker Compose: $(docker-compose --version)${NC}"
echo ""

# 2. Criar diretório de trabalho
WORK_DIR="/opt/afiliados-vps"
echo -e "${BLUE}📁 Criando diretório de trabalho: ${WORK_DIR}${NC}"

mkdir -p ${WORK_DIR}
cd ${WORK_DIR}

echo -e "${GREEN}✅ Diretório criado${NC}"
echo ""

# 3. Baixar arquivos necessários
echo -e "${BLUE}📥 Baixando arquivos de configuração...${NC}"

# docker-compose.yml
if [ ! -f "docker-compose.yml" ]; then
    echo "Baixando docker-compose.yml..."
    curl -o docker-compose.yml https://raw.githubusercontent.com/SxConnect/afiliados/main/afiliado/vps/docker-compose.production.yml
fi

# .env.example
if [ ! -f ".env.example" ]; then
    echo "Baixando .env.example..."
    curl -o .env.example https://raw.githubusercontent.com/SxConnect/afiliados/main/afiliado/vps/.env.production.example
fi

echo -e "${GREEN}✅ Arquivos baixados${NC}"
echo ""

# 4. Gerar secrets
echo -e "${BLUE}🔐 Gerando secrets...${NC}"

JWT_SECRET=$(openssl rand -base64 32)
LICENSE_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 24)
REDIS_PASSWORD=$(openssl rand -base64 24)

echo -e "${GREEN}✅ Secrets gerados${NC}"
echo ""

# 5. Criar arquivo .env
echo -e "${BLUE}📝 Criando arquivo .env...${NC}"

cat > .env << EOF
# Environment Variables - VPS License Server v2.0.0
# Gerado automaticamente em: $(date)

# Secrets
JWT_SECRET=${JWT_SECRET}
LICENSE_SECRET=${LICENSE_SECRET}
DB_PASSWORD=${DB_PASSWORD}
REDIS_PASSWORD=${REDIS_PASSWORD}
EOF

chmod 600 .env

echo -e "${GREEN}✅ Arquivo .env criado${NC}"
echo ""

# 6. Fazer backup dos secrets
BACKUP_FILE="secrets_backup_$(date +%Y%m%d_%H%M%S).txt"
echo -e "${BLUE}💾 Fazendo backup dos secrets...${NC}"

cat > ${BACKUP_FILE} << EOF
VPS License Server - Secrets Backup
Gerado em: $(date)

JWT_SECRET=${JWT_SECRET}
LICENSE_SECRET=${LICENSE_SECRET}
DB_PASSWORD=${DB_PASSWORD}
REDIS_PASSWORD=${REDIS_PASSWORD}

IMPORTANTE:
- Guarde este arquivo em local seguro
- Não compartilhe estes valores
- Faça backup em local separado do servidor
EOF

chmod 600 ${BACKUP_FILE}

echo -e "${GREEN}✅ Backup salvo em: ${BACKUP_FILE}${NC}"
echo ""

# 7. Pull das imagens
echo -e "${BLUE}📦 Baixando imagens Docker...${NC}"

docker-compose pull

echo -e "${GREEN}✅ Imagens baixadas${NC}"
echo ""

# 8. Criar volumes
echo -e "${BLUE}💾 Criando volumes...${NC}"

docker volume create vps_postgres-data
docker volume create vps_redis-data
docker volume create vps_traefik-letsencrypt

echo -e "${GREEN}✅ Volumes criados${NC}"
echo ""

# 9. Iniciar serviços
echo -e "${BLUE}🚀 Iniciando serviços...${NC}"

docker-compose up -d

echo -e "${GREEN}✅ Serviços iniciados${NC}"
echo ""

# 10. Aguardar serviços ficarem prontos
echo -e "${BLUE}⏳ Aguardando serviços ficarem prontos...${NC}"

sleep 10

# 11. Executar migrações
echo -e "${BLUE}🔄 Executando migrações do banco de dados...${NC}"

docker-compose exec -T vps npm run migrate

echo -e "${GREEN}✅ Migrações executadas${NC}"
echo ""

# 12. Verificar health
echo -e "${BLUE}🏥 Verificando health check...${NC}"

sleep 5

HEALTH_STATUS=$(curl -s http://localhost:3000/health | jq -r '.status' 2>/dev/null || echo "error")

if [ "$HEALTH_STATUS" = "ok" ]; then
    echo -e "${GREEN}✅ Health check: OK${NC}"
else
    echo -e "${YELLOW}⚠️  Health check: Verificar logs${NC}"
fi

echo ""

# 13. Mostrar status
echo -e "${BLUE}📊 Status dos serviços:${NC}"
docker-compose ps
echo ""

# 14. Informações finais
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ SETUP CONCLUÍDO COM SUCESSO!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}📋 INFORMAÇÕES IMPORTANTES:${NC}"
echo ""
echo "📁 Diretório de trabalho:"
echo "   ${WORK_DIR}"
echo ""
echo "🔐 Backup dos secrets:"
echo "   ${WORK_DIR}/${BACKUP_FILE}"
echo ""
echo "🌐 Endpoints:"
echo "   Health Check: http://localhost:3000/health"
echo "   API: http://localhost:3000/api/"
echo ""
echo "📊 Comandos úteis:"
echo "   Ver logs: docker-compose logs -f"
echo "   Parar: docker-compose stop"
echo "   Iniciar: docker-compose start"
echo "   Reiniciar: docker-compose restart"
echo "   Status: docker-compose ps"
echo ""
echo -e "${YELLOW}⚠️  PRÓXIMOS PASSOS:${NC}"
echo ""
echo "1. Configurar DNS apontando para este servidor"
echo "2. Atualizar domínio no docker-compose.yml (traefik labels)"
echo "3. Reiniciar Traefik: docker-compose restart traefik"
echo "4. Verificar certificado SSL: https://seu-dominio.com/health"
echo "5. Executar testes de carga"
echo "6. Configurar monitoramento"
echo "7. Fazer backup do arquivo: ${BACKUP_FILE}"
echo ""
echo -e "${RED}🔒 SEGURANÇA:${NC}"
echo ""
echo "- Guarde o arquivo ${BACKUP_FILE} em local seguro"
echo "- Não compartilhe os secrets"
echo "- Configure firewall (portas 80, 443, 22)"
echo "- Configure fail2ban"
echo "- Mantenha o sistema atualizado"
echo ""
echo -e "${GREEN}✅ Setup completo! Sistema pronto para uso.${NC}"
echo ""

