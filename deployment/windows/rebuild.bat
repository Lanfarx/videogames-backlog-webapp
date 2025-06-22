@echo off
echo ==========================================
echo   REBUILD COMPLETO WEBAPP
echo ==========================================

cd /d "%~dp0"

:: Controlli preliminari
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERRORE] Docker non e' in esecuzione.
    echo          Avvia Docker Desktop e riprova.
    pause
    exit /b 1
)

if not exist "..\\..\.env" (
    echo [ERRORE] File .env non trovato.
    echo          Copia .env.example in .env e configuralo.
    pause
    exit /b 1
)

echo [INFO] Fermata container esistenti...
cd ..\..\
docker-compose --env-file .env -f deployment/docker/docker-compose.prod.yml down --remove-orphans

echo [INFO] Rimozione immagini esistenti...
docker image rm videogames-backend-prod:latest 2>nul
docker image rm videogames-frontend-prod:latest 2>nul

echo [INFO] Rebuild completo senza cache...
docker-compose --env-file .env -f deployment/docker/docker-compose.prod.yml build --no-cache

echo [INFO] Avvio container ricostruiti...
docker-compose --env-file .env -f deployment/docker/docker-compose.prod.yml up -d

if errorlevel 1 (
    echo [ERRORE] Errore durante il rebuild.
    cd deployment\windows
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   REBUILD COMPLETATO CON SUCCESSO!
echo ==========================================
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo ==========================================

:: Attendi che i servizi siano pronti
echo Attesa avvio servizi...
timeout /t 8 /nobreak >nul

:: Apri il browser
echo Apertura browser...
start http://localhost:3000/landing

cd deployment\windows
echo.
echo Premi un tasto per continuare...
pause
