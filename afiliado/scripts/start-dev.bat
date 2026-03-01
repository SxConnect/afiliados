@echo off
echo ========================================
echo  INICIANDO SISTEMA AFILIADOS
echo ========================================
echo.

echo [1/3] Iniciando VPS Server (porta 4000)...
start "VPS Server" cmd /k "cd vps && npm start"
timeout /t 3 /nobreak > nul

echo [2/3] Iniciando Core Engine (porta 3001)...
start "Core Engine" cmd /k "npm start"
timeout /t 3 /nobreak > nul

echo [3/3] Iniciando UI (porta 3000)...
start "UI - Electron + React" cmd /k "cd ui && npm run dev"

echo.
echo ========================================
echo  TODOS OS SERVIDORES INICIADOS!
echo ========================================
echo.
echo VPS Server:   http://localhost:4000
echo Core Engine:  http://localhost:3001
echo UI:           http://localhost:3000
echo.
echo Pressione qualquer tecla para fechar...
pause > nul
