@echo off
setlocal

echo ==========================================
echo   STOPPING VIDEO GAMES BACKLOG WEBAPP
echo ==========================================
echo.

cd /d "%~dp0"

set DOCKER_COMPOSE=docker compose
docker compose version >nul 2>&1
if not errorlevel 1 goto compose_ok

set DOCKER_COMPOSE=docker-compose
docker-compose version >nul 2>&1
if not errorlevel 1 goto compose_ok

set DOCKER_COMPOSE=

:compose_ok
cd ..\..\

echo [INFO] Stopping containers...

if "%DOCKER_COMPOSE%"=="" goto manual_stop
%DOCKER_COMPOSE% --env-file .env -f deployment/docker/docker-compose.prod.yml down --remove-orphans
goto done

:manual_stop
docker stop videogames-frontend-prod videogames-backend-prod 2>nul
docker rm videogames-frontend-prod videogames-backend-prod 2>nul

:done
echo.
echo ==========================================
echo   WEBAPP STOPPED SUCCESSFULLY!
echo ==========================================
echo.

cd /d "%~dp0"
powershell -NoProfile -Command "Start-Sleep -Seconds 2"
exit /b 0
