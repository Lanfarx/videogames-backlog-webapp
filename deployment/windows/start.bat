@echo off
echo ========================================
echo   AVVIO BACKLOG VIDEOLUDICO
echo ========================================
echo.

REM Controlla che Docker sia in esecuzione
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker non e' in esecuzione.
    echo         Avvia Docker Desktop e riprova.
    pause
    exit /b 1
)

REM Controlla che esista il file .env
if not exist "..\\..\.env" (
    echo [WARNING] File .env non trovato.
    echo           Copia .env.example in .env e configuralo.
    echo           Comando: copy "..\\..\.env.example" "..\\..\.env"
    pause
    exit /b 1
)

echo [INFO] Avvio container...
REM Ferma eventuali container esistenti
cd ..\..\
docker-compose -f deployment/docker/docker-compose.prod.yml down --remove-orphans >nul 2>&1

REM Avvia i nuovi container con le variabili d'ambiente
docker-compose --env-file .env -f deployment/docker/docker-compose.prod.yml up -d --build
cd deployment\windows

if errorlevel 1 (
    echo [ERROR] Errore durante l'avvio.
    echo         Controlla i log: docker-compose -f deployment/docker/docker-compose.prod.yml logs
    pause
    exit /b 1
)

echo.
echo ========================================
echo   APPLICAZIONE AVVIATA CON SUCCESSO!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Attendi 5 secondi per l'avvio completo...
timeout /t 5 /nobreak >nul

echo Apertura del browser...
start http://localhost:3000/landing

echo.
echo Comandi utili:
echo   Logs:     docker-compose -f deployment/docker/docker-compose.prod.yml logs -f
echo   Stop:     stop.bat
echo.
echo Premi un tasto per continuare...
pause
