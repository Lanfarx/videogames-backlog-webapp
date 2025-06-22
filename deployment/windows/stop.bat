@echo off
echo ==========================================
echo   FERMATA WEBAPP BACKLOG VIDEOLUDICO
echo ==========================================

cd /d "%~dp0"

echo Fermata container in corso...
cd ..\..\
docker-compose --env-file .env -f deployment/docker/docker-compose.prod.yml down --remove-orphans

if errorlevel 1 (
    echo [ERRORE] Errore durante la fermata.
    cd deployment\windows
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   WEBAPP FERMATA CORRETTAMENTE!
echo ==========================================

cd deployment\windows
echo Premi un tasto per continuare...
pause
echo Puoi ora chiudere questa finestra.
echo.
timeout /t 3 >nul
