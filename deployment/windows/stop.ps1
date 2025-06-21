# Script per fermare l'applicazione

Write-Host "[STOP] Fermata Backlog Videoludico..." -ForegroundColor Yellow

# Ottieni il percorso assoluto del file .env
$ScriptDir = $PSScriptRoot
$RootDir = Resolve-Path "$ScriptDir\..\.."
$EnvFile = Join-Path $RootDir ".env"

Set-Location "../.."
docker-compose --env-file "$EnvFile" -f deployment/docker/docker-compose.prod.yml down
Set-Location "deployment/windows"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Applicazione fermata con successo!" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Errore durante la fermata." -ForegroundColor Red
}

Read-Host "Premi Enter per chiudere"
