@echo off
echo ==========================================
echo   AVVIO WEBAPP BACKLOG VIDEOLUDICO
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

:: Controlla se le immagini Docker esistono
echo Controllo immagini Docker...
docker image inspect videogames-backend-prod:latest >nul 2>&1
set backend_exists=%errorlevel%

docker image inspect videogames-frontend-prod:latest >nul 2>&1
set frontend_exists=%errorlevel%

:: Vai alla root del progetto
cd ..\..\

:: Se almeno una immagine non esiste, forza il build
if %backend_exists% neq 0 (
    echo [INFO] Backend non trovato, build necessario...
    goto build
)
if %frontend_exists% neq 0 (
    echo [INFO] Frontend non trovato, build necessario...
    goto build
)

:: Se entrambe esistono, avvio rapido
echo [INFO] Immagini trovate, avvio rapido...
docker-compose --env-file .env -f deployment/docker/docker-compose.prod.yml up -d
goto success

:build
echo [INFO] Costruzione immagini in corso...
docker-compose --env-file .env -f deployment/docker/docker-compose.prod.yml up -d --build

:success
if errorlevel 1 (
    echo [ERRORE] Errore durante l'avvio.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   WEBAPP AVVIATA CORRETTAMENTE!
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
