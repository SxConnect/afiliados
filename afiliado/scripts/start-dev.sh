#!/bin/bash

echo "========================================"
echo " INICIANDO SISTEMA AFILIADOS"
echo "========================================"
echo ""

# Função para verificar se uma porta está em uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "⚠️  Porta $1 já está em uso!"
        return 1
    fi
    return 0
}

# Verifica portas
echo "Verificando portas disponíveis..."
check_port 4000 || exit 1
check_port 3001 || exit 1
check_port 3000 || exit 1
echo "✓ Todas as portas estão disponíveis"
echo ""

# Inicia VPS Server
echo "[1/3] Iniciando VPS Server (porta 4000)..."
cd vps
npm start &
VPS_PID=$!
cd ..
sleep 3

# Inicia Core Engine
echo "[2/3] Iniciando Core Engine (porta 3001)..."
npm start &
CORE_PID=$!
sleep 3

# Inicia UI
echo "[3/3] Iniciando UI (porta 3000)..."
cd ui
npm run dev &
UI_PID=$!
cd ..

echo ""
echo "========================================"
echo " TODOS OS SERVIDORES INICIADOS!"
echo "========================================"
echo ""
echo "VPS Server:   http://localhost:4000 (PID: $VPS_PID)"
echo "Core Engine:  http://localhost:3001 (PID: $CORE_PID)"
echo "UI:           http://localhost:3000 (PID: $UI_PID)"
echo ""
echo "Pressione Ctrl+C para parar todos os servidores"
echo ""

# Função para parar todos os processos
cleanup() {
    echo ""
    echo "Parando todos os servidores..."
    kill $VPS_PID $CORE_PID $UI_PID 2>/dev/null
    echo "✓ Todos os servidores foram parados"
    exit 0
}

# Captura Ctrl+C
trap cleanup INT

# Mantém o script rodando
wait
