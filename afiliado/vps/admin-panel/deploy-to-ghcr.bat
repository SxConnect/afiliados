@echo off
REM Script para build e deploy do Admin Panel para GHCR
REM Versão: 1.0.0

setlocal enabledelayedexpansion

REM Configuracoes
set IMAGE_NAME=ghcr.io/sxconnect/afiliados-admin-panel
set VERSION=1.0.0
set GITHUB_USER=SxConnect

echo ========================================
echo   Admin Panel - Build ^& Deploy to GHCR
echo   Version: %VERSION%
echo ========================================
echo.

REM 1. Verificar se esta no diretorio correto
if not exist "Dockerfile" (
    echo [ERRO] Dockerfile nao encontrado!
    echo Execute este script do diretorio afiliado/vps/admin-panel
    exit /b 1
)

REM 2. Verificar se GITHUB_TOKEN esta definido
if "%GITHUB_TOKEN%"=="" (
    echo [AVISO] GITHUB_TOKEN nao esta definido
    echo Por favor, defina a variavel de ambiente:
    echo   set GITHUB_TOKEN=seu_token_aqui
    exit /b 1
)

REM 3. Login no GHCR
echo [INFO] Fazendo login no GitHub Container Registry...
echo %GITHUB_TOKEN% | docker login ghcr.io -u %GITHUB_USER% --password-stdin

if %errorlevel% neq 0 (
    echo [ERRO] Falha no login do GHCR
    exit /b 1
)

echo [OK] Login realizado com sucesso
echo.

REM 4. Build da imagem
echo [INFO] Construindo imagem Docker...
echo   Imagem: %IMAGE_NAME%
echo   Tags: latest, %VERSION%
echo.

docker build ^
    --platform linux/amd64 ^
    -t %IMAGE_NAME%:latest ^
    -t %IMAGE_NAME%:%VERSION% ^
    --label "org.opencontainers.image.version=%VERSION%" ^
    .

if %errorlevel% neq 0 (
    echo [ERRO] Falha no build da imagem
    exit /b 1
)

echo.
echo [OK] Build concluido com sucesso
echo.

REM 5. Push para GHCR
echo [INFO] Enviando imagem para GHCR...

echo   Pushing %IMAGE_NAME%:latest...
docker push %IMAGE_NAME%:latest

echo   Pushing %IMAGE_NAME%:%VERSION%...
docker push %IMAGE_NAME%:%VERSION%

if %errorlevel% neq 0 (
    echo [ERRO] Falha no push da imagem
    exit /b 1
)

echo.
echo [OK] Imagem enviada com sucesso!
echo.

REM 6. Informacoes finais
echo ========================================
echo [OK] DEPLOY CONCLUIDO COM SUCESSO!
echo ========================================
echo.
echo Imagem disponivel em:
echo   %IMAGE_NAME%:latest
echo   %IMAGE_NAME%:%VERSION%
echo.
echo Para atualizar no servidor:
echo   1. SSH no servidor VPS
echo   2. cd /path/to/docker-compose
echo   3. docker-compose pull admin-panel
echo   4. docker-compose up -d admin-panel
echo.

endlocal
