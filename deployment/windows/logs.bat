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

REM Ottieni il percorso assoluto della root del progetto
set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%..\.."
pushd "%ROOT_DIR%"
set "ENV_FILE=%CD%\.env"
popd

cd ..\..\
docker-compose --env-file "%ENV_FILE%" -f deployment/docker/docker-compose.prod.yml logs -f
cd deployment\windows

pause
