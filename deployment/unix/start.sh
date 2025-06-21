#!/bin/bash
# Script di avvio rapido per Mac/Linux

echo "[START] Avvio Backlog Videoludico..."

# Controlla se Docker è in esecuzione
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker non è in esecuzione. Avvia Docker Desktop e riprova."
    exit 1
fi

# Controlla se esiste il file .env
if [ ! -f "../../.env" ]; then
    echo "[WARNING] File .env non trovato. Copia .env.example in .env e configuralo."
    echo "[TIP] Comando: cp ../../.env.example ../../.env"
    exit 1
fi

echo "[BUILD] Avvio container..."

# Ottieni il percorso assoluto del file .env
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

cd ../..
docker-compose --env-file "$ENV_FILE" -f deployment/docker/docker-compose.prod.yml down --remove-orphans > /dev/null 2>&1
docker-compose --env-file "$ENV_FILE" -f deployment/docker/docker-compose.prod.yml up -d --build
cd deployment/unix

if [ $? -eq 0 ]; then
    echo ""
    echo "[SUCCESS] Applicazione avviata!"
    echo "Frontend: http://localhost:3000/landing"
    echo "Backend: http://localhost:5000"
    echo ""
    echo "Comandi utili:"
    echo "  Logs: docker-compose -f deployment/docker/docker-compose.prod.yml logs -f"
    echo "  Stop: ./stop.sh"
    echo ""
    echo "[BROWSER] Apertura automatica del browser..."
    # Apertura browser cross-platform
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:3000/landing
    elif command -v open > /dev/null; then
        open http://localhost:3000/landing
    else
        echo "Apri manualmente: http://localhost:3000/landing"
    fi
else
    echo "[ERROR] Errore durante l'avvio. Controlla i log:"
    echo "   docker-compose -f deployment/docker/docker-compose.prod.yml logs"
fi
