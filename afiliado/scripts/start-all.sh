#!/bin/bash

# Script para iniciar todos os servidores

echo "🚀 Iniciando Sistema Afiliados WhatsApp..."
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verifica se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "${BLUE}📦 Instalando dependências...${NC}"
    npm install
fi

if [ ! -d "vps/node_modules" ]; then
    echo "${BLUE}📦 Instalando dependências da VPS...${NC}"
    cd vps && npm install && cd ..
fi

# Inicia VPS em background
echo "${GREEN}🔐 Iniciando VPS Simulada (porta 4000)...${NC}"
cd vps
node server.js &
VPS_PID=$!
cd ..

sleep 2

# Inicia Core Engine em background
echo "${GREEN}🚀 Iniciando Core Engine (porta 3001)...${NC}"
node src/core/server.js &
CORE_PID=$!

sleep 2

echo ""
echo "${GREEN}✅ Todos os servidores iniciados!${NC}"
echo ""
echo "📋 Processos:"
echo "   VPS: PID $VPS_PID (porta 4000)"
echo "   Core: PID $CORE_PID (porta 3001)"
echo ""
echo "🌐 Abra test-client.html no navegador para testar"
echo ""
echo "Para parar os servidores:"
echo "   kill $VPS_PID $CORE_PID"
echo ""

# Aguarda Ctrl+C
trap "kill $VPS_PID $CORE_PID; exit" INT
wait
