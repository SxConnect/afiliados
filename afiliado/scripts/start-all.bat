@echo off
echo 🚀 Iniciando Sistema Afiliados WhatsApp...
echo.

REM Verifica se node_modules existe
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    call npm install
)

if not exist "vps\node_modules" (
    echo 📦 Instalando dependências da VPS...
    cd vps
    call npm install
    cd ..
)

REM Inicia VPS em nova janela
echo 🔐 Iniciando VPS Simulada (porta 4000)...
start "VPS Simulada" cmd /k "cd vps && node server.js"

timeout /t 2 /nobreak >nul

REM Inicia Core Engine em nova janela
echo 🚀 Iniciando Core Engine (porta 3001)...
start "Core Engine" cmd /k "node src/core/server.js"

timeout /t 2 /nobreak >nul

echo.
echo ✅ Todos os servidores iniciados!
echo.
echo 🌐 Abra test-client.html no navegador para testar
echo.
pause
