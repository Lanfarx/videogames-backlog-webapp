#!/bin/bash
# Script per fermare l'applicazione

echo "[STOP] Fermata Backlog Videoludico..."

cd ../..
docker-compose -f deployment/docker/docker-compose.prod.yml down
cd deployment/unix

if [ $? -eq 0 ]; then
    echo "[SUCCESS] Applicazione fermata con successo!"
else
    echo "[ERROR] Errore durante la fermata."
fi
