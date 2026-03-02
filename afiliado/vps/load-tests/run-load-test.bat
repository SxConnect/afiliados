@echo off
REM Script para executar teste de carga completo no Windows
REM Autor: SRE Team

setlocal enabledelayedexpansion

echo ==========================================
echo TESTE DE CARGA - SISTEMA DE ENTITLEMENTS
echo ==========================================
echo.

REM Configurações
if "%BASE_URL%"=="" set BASE_URL=http://localhost:3000
set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set RESULTS_DIR=results\%TIMESTAMP%

echo Configuracao:
echo   Base URL: %BASE_URL%
echo   Results Dir: %RESULTS_DIR%
echo.

REM Criar diretório de resultados
if not exist "%RESULTS_DIR%" mkdir "%RESULTS_DIR%"

REM 1. Verificar pré-requisitos
echo 1. VERIFICANDO PRE-REQUISITOS...
echo -----------------------------------------

REM Verificar Node.js
where node >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js: !NODE_VERSION!
) else (
    echo [ERRO] Node.js nao encontrado
    exit /b 1
)

REM Verificar k6
where k6 >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] k6 instalado
) else (
    echo [AVISO] k6 nao encontrado
    echo    Instale em: https://k6.io/docs/getting-started/installation/
    exit /b 1
)

REM Verificar servidor
echo.
echo Verificando servidor...
curl -s "%BASE_URL%/health" >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Servidor respondendo em %BASE_URL%
) else (
    echo [ERRO] Servidor nao esta respondendo em %BASE_URL%
    echo    Inicie o servidor antes de executar os testes
    exit /b 1
)

REM 2. Coletar informações do sistema
echo.
echo 2. COLETANDO INFORMACOES DO SISTEMA...
echo -----------------------------------------

REM Salvar informações do sistema
echo Data: %date% %time% > "%RESULTS_DIR%\system-info.txt"
echo Node.js: %NODE_VERSION% >> "%RESULTS_DIR%\system-info.txt"
echo Base URL: %BASE_URL% >> "%RESULTS_DIR%\system-info.txt"

echo Sistema: Windows
echo Node.js: %NODE_VERSION%

REM 3. Iniciar monitoramento
echo.
echo 3. INICIANDO MONITORAMENTO DO SISTEMA...
echo -----------------------------------------

start /B node monitor-system.js > "%RESULTS_DIR%\monitor.log" 2>&1
timeout /t 2 /nobreak >nul
echo [OK] Monitor iniciado

REM 4. Executar testes
echo.
echo 4. EXECUTANDO TESTES DE CARGA...
echo -----------------------------------------
echo.
echo Duracao estimada: ~16 minutos
echo.
echo Cenarios:
echo   A - Base:     100 req/s por 2 min
echo   B - Moderado: 250 req/s por 3 min
echo   C - Alto:     500 req/s por 3 min
echo   D - Stress:   Rampa ate falha (5 min)
echo.

REM Executar k6
k6 run --out json="%RESULTS_DIR%\k6-raw.json" --summary-export="%RESULTS_DIR%\k6-summary.json" k6-load-test.js

set K6_EXIT_CODE=%errorlevel%

REM 5. Parar monitoramento
echo.
echo 5. PARANDO MONITORAMENTO...
echo -----------------------------------------

REM Enviar Ctrl+C para o monitor (simulado)
taskkill /F /IM node.exe /FI "WINDOWTITLE eq monitor-system.js*" >nul 2>nul
timeout /t 2 /nobreak >nul

REM Copiar métricas
if exist "system-metrics.json" (
    move /Y system-metrics.json "%RESULTS_DIR%\" >nul
    echo [OK] Metricas do sistema salvas
)

REM 6. Analisar resultados
echo.
echo 6. ANALISANDO RESULTADOS...
echo -----------------------------------------

if exist "%RESULTS_DIR%\k6-summary.json" (
    if exist "%RESULTS_DIR%\system-metrics.json" (
        node analyze-results.js "%RESULTS_DIR%\k6-summary.json" "%RESULTS_DIR%\system-metrics.json" > "%RESULTS_DIR%\analysis-report.txt"
        type "%RESULTS_DIR%\analysis-report.txt"
        
        if exist "load-test-analysis.json" (
            move /Y load-test-analysis.json "%RESULTS_DIR%\" >nul
        )
    ) else (
        echo [AVISO] Arquivo system-metrics.json nao encontrado
    )
) else (
    echo [AVISO] Arquivo k6-summary.json nao encontrado
)

echo.
echo ==========================================
echo TESTE CONCLUIDO
echo ==========================================
echo.
echo Resultados salvos em: %RESULTS_DIR%
echo.
echo Arquivos gerados:
dir /B "%RESULTS_DIR%"
echo.

if %K6_EXIT_CODE% equ 0 (
    echo [OK] Teste executado com sucesso
) else (
    echo [AVISO] Teste finalizado com avisos (codigo: %K6_EXIT_CODE%^)
)

echo.
echo Para visualizar o relatorio completo:
echo   type %RESULTS_DIR%\analysis-report.txt
echo.

endlocal
