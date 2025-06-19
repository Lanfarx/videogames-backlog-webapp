@echo off
echo ========================================
echo   LOGS BACKLOG VIDEOLUDICO
echo ========================================
echo.

REM Controlla che Docker sia in esecuzione
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker non e' in esecuzione o l'app non e' avviata.
    pause
    exit /b 1
)

echo [INFO] Visualizzazione logs in tempo reale...
echo         Premi Ctrl+C per uscire
echo.

cd ..\..\
docker-compose -f deployment/docker/docker-compose.prod.yml logs -f
cd deployment\windows

pause
