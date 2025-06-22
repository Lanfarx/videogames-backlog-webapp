@echo off
echo ========================================
echo   FERMATA BACKLOG VIDEOLUDICO
echo ========================================
echo.

echo [INFO] Fermata dei container in corso...
REM Ottieni il percorso assoluto della root del progetto
set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%..\.."
pushd "%ROOT_DIR%"
set "ENV_FILE=%CD%\.env"
popd

cd ..\..\
docker-compose --env-file "%ENV_FILE%" -f deployment/docker/docker-compose.prod.yml down --remove-orphans
cd deployment\windows

if errorlevel 1 (
    echo [ERROR] Errore durante la fermata.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   APPLICAZIONE FERMATA CON SUCCESSO!
echo ========================================
echo.
echo L'applicazione e' stata fermata completamente.
echo Puoi ora chiudere questa finestra.
echo.
timeout /t 3 >nul
