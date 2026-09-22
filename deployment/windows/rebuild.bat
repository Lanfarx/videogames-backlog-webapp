@echo off
setlocal

echo ==========================================
echo   COMPLETE WEBAPP REBUILD (Docker)
echo ==========================================
echo.

cd /d "%~dp0"

docker info >nul 2>&1
if not errorlevel 1 goto docker_ok
echo [ERROR] Docker is not running or not installed.
echo         Please start Docker Desktop and try again.
echo.
pause
exit /b 1

:docker_ok
set DOCKER_COMPOSE=docker compose
docker compose version >nul 2>&1
if not errorlevel 1 goto compose_ok

set DOCKER_COMPOSE=docker-compose
docker-compose version >nul 2>&1
if not errorlevel 1 goto compose_ok

echo [ERROR] Docker Compose not found. Please verify your Docker Desktop installation.
pause
exit /b 1

:compose_ok
if exist "..\..\.env" goto env_ok
if not exist "..\..\.env.example" goto env_err

echo [INFO] Creating .env file from .env.example...
copy "..\..\.env.example" "..\..\.env" >nul
goto env_ok

:env_err
echo [ERROR] Neither .env nor .env.example was found.
pause
exit /b 1

:env_ok
cd ..\..\

echo [1/4] Stopping existing containers...
%DOCKER_COMPOSE% --env-file .env -f deployment/docker/docker-compose.prod.yml down --remove-orphans

echo [2/4] Removing old Docker images...
docker image rm videogames-backend-prod:latest 2>nul
docker image rm videogames-frontend-prod:latest 2>nul

echo [3/4] Rebuilding Docker images without cache (Safety timeout: 500s)...
powershell -NoProfile -Command "$p = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', '%DOCKER_COMPOSE% --env-file .env -f deployment/docker/docker-compose.prod.yml build --no-cache' -PassThru -NoNewWindow; if (-not $p.WaitForExit(500000)) { $p.Kill(); Write-Host '[ERROR] 500-second timeout exceeded during rebuild!' -ForegroundColor Red; exit 124 } else { exit $p.ExitCode }"

if errorlevel 1 goto build_err
goto do_up

:build_err
echo.
echo [ERROR] Image rebuild failed or timed out.
echo         Tip: restart Docker Desktop and try again.
cd /d "%~dp0"
pause
exit /b 1

:do_up
echo [4/4] Starting rebuilt containers...
%DOCKER_COMPOSE% --env-file .env -f deployment/docker/docker-compose.prod.yml up -d
if errorlevel 1 goto up_err

echo.
echo ==========================================
echo   REBUILD COMPLETED SUCCESSFULLY!
echo ==========================================
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo ==========================================
echo.

echo Waiting for services to initialize (6 seconds)...
powershell -NoProfile -Command "Start-Sleep -Seconds 6"

echo Opening browser at http://localhost:3000/landing...
start http://localhost:3000/landing

cd /d "%~dp0"
echo.
echo Operation completed.
echo.
exit /b 0

:up_err
echo.
echo [ERROR] Failed to start Docker containers.
cd /d "%~dp0"
pause
exit /b 1
