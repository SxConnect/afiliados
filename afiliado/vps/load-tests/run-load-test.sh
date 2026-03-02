#!/bin/bash

# Script para executar teste de carga completo
# Autor: SRE Team
# Data: $(date +%Y-%m-%d)

set -e

echo "=========================================="
echo "TESTE DE CARGA - SISTEMA DE ENTITLEMENTS"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações
BASE_URL="${BASE_URL:-http://localhost:3000}"
RESULTS_DIR="./results/$(date +%Y%m%d_%H%M%S)"

echo "📋 Configuração:"
echo "  Base URL: $BASE_URL"
echo "  Results Dir: $RESULTS_DIR"
echo ""

# Criar diretório de resultados
mkdir -p "$RESULTS_DIR"

# 1. Verificar pré-requisitos
echo "1️⃣  VERIFICANDO PRÉ-REQUISITOS..."
echo "─────────────────────────────────────────"

# Verificar Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js não encontrado"
    exit 1
fi

# Verificar k6
if command -v k6 &> /dev/null; then
    K6_VERSION=$(k6 version)
    echo "✅ k6: $K6_VERSION"
else
    echo "⚠️  k6 não encontrado. Instalando..."
    echo "   Visite: https://k6.io/docs/getting-started/installation/"
    exit 1
fi

# Verificar se o servidor está rodando
echo ""
echo "🔍 Verificando servidor..."
if curl -s "$BASE_URL/health" > /dev/null; then
    echo "✅ Servidor respondendo em $BASE_URL"
else
    echo "❌ Servidor não está respondendo em $BASE_URL"
    echo "   Inicie o servidor antes de executar os testes"
    exit 1
fi

# Coletar informações do sistema
echo ""
echo "2️⃣  COLETANDO INFORMAÇÕES DO SISTEMA..."
echo "─────────────────────────────────────────"

# CPU Info
CPU_INFO=$(lscpu 2>/dev/null || sysctl -n machdep.cpu.brand_string 2>/dev/null || echo "N/A")
CPU_CORES=$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo "N/A")
echo "CPU: $CPU_INFO"
echo "Cores: $CPU_CORES"

# Memory Info
if command -v free &> /dev/null; then
    TOTAL_MEM=$(free -h | awk '/^Mem:/ {print $2}')
    echo "RAM Total: $TOTAL_MEM"
elif command -v vm_stat &> /dev/null; then
    TOTAL_MEM=$(sysctl -n hw.memsize | awk '{print $0/1024/1024/1024 "GB"}')
    echo "RAM Total: $TOTAL_MEM"
fi

# PostgreSQL Info (se disponível)
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version | awk '{print $3}')
    echo "PostgreSQL: $PG_VERSION"
fi

# Salvar informações do sistema
cat > "$RESULTS_DIR/system-info.txt" << EOF
Data: $(date)
Node.js: $NODE_VERSION
CPU: $CPU_INFO
Cores: $CPU_CORES
RAM: $TOTAL_MEM
Base URL: $BASE_URL
EOF

echo ""
echo "3️⃣  INICIANDO MONITORAMENTO DO SISTEMA..."
echo "─────────────────────────────────────────"

# Iniciar monitor de sistema em background
node monitor-system.js > "$RESULTS_DIR/monitor.log" 2>&1 &
MONITOR_PID=$!
echo "✅ Monitor iniciado (PID: $MONITOR_PID)"

# Aguardar monitor inicializar
sleep 2

echo ""
echo "4️⃣  EXECUTANDO TESTES DE CARGA..."
echo "─────────────────────────────────────────"
echo ""
echo "⏱️  Duração estimada: ~16 minutos"
echo ""
echo "Cenários:"
echo "  A - Base:     100 req/s por 2 min"
echo "  B - Moderado: 250 req/s por 3 min"
echo "  C - Alto:     500 req/s por 3 min"
echo "  D - Stress:   Rampa até falha (5 min)"
echo ""

# Executar k6
k6 run \
    --out json="$RESULTS_DIR/k6-raw.json" \
    --summary-export="$RESULTS_DIR/k6-summary.json" \
    k6-load-test.js

K6_EXIT_CODE=$?

echo ""
echo "5️⃣  PARANDO MONITORAMENTO..."
echo "─────────────────────────────────────────"

# Parar monitor
kill -INT $MONITOR_PID 2>/dev/null || true
wait $MONITOR_PID 2>/dev/null || true

# Copiar métricas do sistema
if [ -f "system-metrics.json" ]; then
    mv system-metrics.json "$RESULTS_DIR/"
    echo "✅ Métricas do sistema salvas"
fi

echo ""
echo "6️⃣  ANALISANDO RESULTADOS..."
echo "─────────────────────────────────────────"

# Analisar resultados
if [ -f "$RESULTS_DIR/k6-summary.json" ] && [ -f "$RESULTS_DIR/system-metrics.json" ]; then
    node analyze-results.js \
        "$RESULTS_DIR/k6-summary.json" \
        "$RESULTS_DIR/system-metrics.json" \
        | tee "$RESULTS_DIR/analysis-report.txt"
    
    # Copiar relatório detalhado
    if [ -f "load-test-analysis.json" ]; then
        mv load-test-analysis.json "$RESULTS_DIR/"
    fi
else
    echo "⚠️  Arquivos de resultado não encontrados"
fi

echo ""
echo "=========================================="
echo "TESTE CONCLUÍDO"
echo "=========================================="
echo ""
echo "📁 Resultados salvos em: $RESULTS_DIR"
echo ""
echo "Arquivos gerados:"
ls -lh "$RESULTS_DIR"
echo ""

if [ $K6_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Teste executado com sucesso${NC}"
else
    echo -e "${RED}⚠️  Teste finalizado com avisos (código: $K6_EXIT_CODE)${NC}"
fi

echo ""
echo "Para visualizar o relatório completo:"
echo "  cat $RESULTS_DIR/analysis-report.txt"
echo ""
