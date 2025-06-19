# Script per fermare l'applicazione

Write-Host "[STOP] Fermata Backlog Videoludico..." -ForegroundColor Yellow

Set-Location "../.."
docker-compose -f deployment/docker/docker-compose.prod.yml down
Set-Location "deployment/windows"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Applicazione fermata con successo!" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Errore durante la fermata." -ForegroundColor Red
}

Read-Host "Premi Enter per chiudere"
