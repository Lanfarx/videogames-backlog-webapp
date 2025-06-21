# Script di avvio rapido per Windows PowerShell
# =============================================================================
# AVVIO BACKLOG VIDEOLUDICO - VERSIONE DETTAGLIATA
# =============================================================================

Write-Host "[START] AVVIO BACKLOG VIDEOLUDICO" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Controlla se Docker è in esecuzione
Write-Host "[INFO] Controllo Docker Desktop..." -ForegroundColor Cyan
try {
    docker info | Out-Null
    Write-Host "[OK] Docker Desktop è in esecuzione" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker Desktop non è in esecuzione!" -ForegroundColor Red
    Write-Host "[TIP] Avvia Docker Desktop e riprova" -ForegroundColor Yellow
    Read-Host "Premi Enter per chiudere"
    exit 1
}

# Controlla se esiste il file .env (relativo alla directory dello script)
Write-Host "[INFO] Controllo configurazione..." -ForegroundColor Cyan
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$envPath = Join-Path $projectRoot ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "[ERROR] File .env non trovato in: $envPath" -ForegroundColor Red
    Write-Host "[TIP] Copia .env.example in .env e configuralo:" -ForegroundColor Yellow
    Write-Host "   Copy-Item '$projectRoot\.env.example' '$projectRoot\.env'" -ForegroundColor Gray
    Read-Host "Premi Enter per chiudere"
    exit 1
} else {
    Write-Host "[OK] File .env trovato" -ForegroundColor Green
}

# Verifica connettività database
Write-Host "[INFO] Controllo connessione database..." -ForegroundColor Cyan
Write-Host "[DB] Database: Supabase Cloud PostgreSQL" -ForegroundColor White

# Avvia i container
Write-Host ""
Write-Host "[BUILD] AVVIO CONTAINER DOCKER" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow

# Ottieni il percorso assoluto del file .env
$ScriptDir = $PSScriptRoot
$RootDir = Resolve-Path "$ScriptDir\..\.."
$EnvFile = Join-Path $RootDir ".env"

# Ferma eventuali container esistenti
Write-Host "[CLEAN] Pulizia container precedenti..." -ForegroundColor Gray
Set-Location $RootDir
docker-compose --env-file "$EnvFile" -f deployment/docker/docker-compose.prod.yml down --remove-orphans 2>$null

# Avvia i nuovi container con le variabili d'ambiente
Write-Host "[BUILD] Avvio nuovi container..." -ForegroundColor Cyan
docker-compose --env-file "$EnvFile" -f deployment/docker/docker-compose.prod.yml up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] APPLICAZIONE AVVIATA CON SUCCESSO!" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    
    Write-Host ""    Write-Host "[ACCESS] ACCESSO ALL'APPLICAZIONE:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://localhost:3000/landing" -ForegroundColor Yellow
    Write-Host "   Backend:  http://localhost:5000" -ForegroundColor Yellow
    
    Write-Host ""    Write-Host "[COMMANDS] COMANDI UTILI:" -ForegroundColor Cyan
    Write-Host "   Log:      docker-compose -f deployment/docker/docker-compose.prod.yml logs -f" -ForegroundColor Gray
    Write-Host "   Stop:     .\stop.ps1" -ForegroundColor Gray
    Write-Host "   Status:   docker ps" -ForegroundColor Gray
    
    Write-Host ""    Write-Host "[FIRST-USE] PRIMO ACCESSO:" -ForegroundColor Magenta
    Write-Host "   1. Vai su http://localhost:3000/landing" -ForegroundColor White
    Write-Host "   2. Fai login con le tue credenziali esistenti" -ForegroundColor White
    Write-Host "   3. Controlla che i tuoi giochi siano presenti" -ForegroundColor White
    
    Write-Host ""
    Write-Host "[WAIT] Attendere 30-60 secondi per il caricamento completo..." -ForegroundColor Yellow
    Write-Host "[BROWSER] Apertura automatica del browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:3000/landing"
    
} else {
    Write-Host ""
    Write-Host "[ERROR] ERRORE NELL'AVVIO!" -ForegroundColor Red
    Write-Host "=========================" -ForegroundColor Red
    Write-Host "[TIP] Controlla i log per dettagli:" -ForegroundColor Yellow
    Write-Host "   docker-compose -f docker-compose.prod.yml logs" -ForegroundColor Gray
}
