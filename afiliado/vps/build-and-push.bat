@echo off
REM Script para build e push da imagem Docker da VPS para GHCR (Windows)
REM Uso: build-and-push.bat [tag]

setlocal enabledelayedexpansion

REM Configurações
set REGISTRY=ghcr.io
set REPO=sxconnect/afiliados
set IMAGE_NAME=vps
set TAG=%1
if "%TAG%"=="" set TAG=latest

set FULL_IMAGE=%REGISTRY%/%REPO%/%IMAGE_NAME%:%TAG%

echo ========================================
echo   Build e Push - VPS Docker Image
echo ========================================
echo.

REM Build da imagem
echo [1/4] Construindo imagem Docker...
docker build ^
    --tag "%FULL_IMAGE%" ^
    --tag "%REGISTRY%/%REPO%/%IMAGE_NAME%:main" ^
    --label "org.opencontainers.image.source=https://github.com/%REPO%" ^
    --label "org.opencontainers.image.description=VPS License Validation Server" ^
    --label "org.opencontainers.image.licenses=Proprietary" ^
    .

if errorlevel 1 (
    echo Erro ao construir imagem
    exit /b 1
)
echo OK - Imagem construida com sucesso
echo.

REM Testar a imagem localmente
echo [2/4] Testando imagem localmente...
for /f "tokens=*" %%i in ('docker run -d -p 4001:4000 -e NODE_ENV=test "%FULL_IMAGE%"') do set CONTAINER_ID=%%i
timeout /t 5 /nobreak > nul

curl -f http://localhost:4001/api/plans > nul 2>&1
if errorlevel 1 (
    echo Erro ao testar imagem
    docker logs %CONTAINER_ID%
    docker stop %CONTAINER_ID%
    docker rm %CONTAINER_ID%
    exit /b 1
)

echo OK - Imagem funcionando corretamente
docker stop %CONTAINER_ID%
docker rm %CONTAINER_ID%
echo.

REM Push para GHCR
echo [3/4] Enviando imagem para GHCR...
docker push "%FULL_IMAGE%"
docker push "%REGISTRY%/%REPO%/%IMAGE_NAME%:main"

if errorlevel 1 (
    echo Erro ao enviar imagem
    echo Execute: echo %%GITHUB_TOKEN%% ^| docker login ghcr.io -u USERNAME --password-stdin
    exit /b 1
)
echo OK - Imagem enviada com sucesso
echo.

REM Informações finais
echo [4/4] Resumo
echo ========================================
echo Imagem: %FULL_IMAGE%
echo Tags:
echo   - %REGISTRY%/%REPO%/%IMAGE_NAME%:%TAG%
echo   - %REGISTRY%/%REPO%/%IMAGE_NAME%:main
echo.
echo Para usar a imagem:
echo   docker pull %FULL_IMAGE%
echo   docker run -d -p 4000:4000 %FULL_IMAGE%
echo.
echo Ou com docker-compose:
echo   docker-compose up -d
echo ========================================

endlocal
