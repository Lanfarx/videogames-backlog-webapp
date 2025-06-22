#!/bin/bash
# Script per fermare l'applicazione

echo "[STOP] Fermata Backlog Videoludico..."

# Ottieni il percorso assoluto del file .env
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

cd ../..
docker-compose --env-file "$ENV_FILE" -f deployment/docker/docker-compose.prod.yml down
cd deployment/unix

if [ $? -eq 0 ]; then
    echo "[SUCCESS] Applicazione fermata con successo!"
else
    echo "[ERROR] Errore durante la fermata."
fi
