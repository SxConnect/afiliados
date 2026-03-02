@echo off
REM Build and Push VPS Docker Image to GHCR

setlocal enabledelayedexpansion

set IMAGE_NAME=ghcr.io/sxconnect/afiliados-vps

REM Ler versão do arquivo VERSION
if exist ..\VERSION (
    set /p VERSION=<..\VERSION
) else (
    set VERSION=1.0.0
)

echo ========================================
echo   VPS Docker Build and Push
echo ========================================
echo.
echo Image: %IMAGE_NAME%
echo Version: %VERSION%
echo.

echo [1/4] Building Docker image...
docker build -t %IMAGE_NAME%:latest -t %IMAGE_NAME%:%VERSION% .
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Testing image...
docker run --rm -e JWT_SECRET=test -e LICENSE_SECRET=test %IMAGE_NAME%:latest node -e "console.log('OK')"
if errorlevel 1 (
    echo ERROR: Image test failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Logging into GitHub Container Registry...
echo Please enter your GitHub Personal Access Token
echo (Create one at: https://github.com/settings/tokens with write:packages permission)
set /p GITHUB_TOKEN="GitHub Token: "

echo %GITHUB_TOKEN% | docker login ghcr.io -u USERNAME --password-stdin
if errorlevel 1 (
    echo ERROR: Login failed!
    pause
    exit /b 1
)

echo.
echo [4/4] Pushing images to GHCR...
docker push %IMAGE_NAME%:latest
docker push %IMAGE_NAME%:%VERSION%

echo.
echo ========================================
echo   SUCCESS!
echo ========================================
echo.
echo Images pushed:
echo   - %IMAGE_NAME%:latest
echo   - %IMAGE_NAME%:%VERSION%
echo.
echo You can now use these images in your docker-compose:
echo   image: %IMAGE_NAME%:latest
echo.
pause
