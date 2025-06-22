#!/bin/bash
# Script per rebuild completo dell'applicazione - Mac/Linux

echo "=============================================="
echo "  GAMEBACKLOG - REBUILD COMPLETO"
echo "=============================================="
echo

# Controlla se Docker è in esecuzione
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker non è in esecuzione. Avvia Docker Desktop e riprova."
    exit 1
fi

# Ottieni il percorso assoluto del file .env
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

# Controlla se esiste il file .env
if [ ! -f "$ENV_FILE" ]; then
    echo "[ERROR] File .env non trovato nella root del progetto."
    echo "[INFO] Copia .env.example in .env e configuralo:"
    echo "       cp $ROOT_DIR/.env.example $ROOT_DIR/.env"
    echo ""
    read -p "Premi Invio per uscire..."
    exit 1
fi

echo "[INFO] Rebuild completo con pulizia cache..."
echo ""

# Vai alla directory root
cd "$ROOT_DIR"

echo "[1/4] Fermata container esistenti..."
docker-compose --env-file "$ENV_FILE" -f deployment/docker/docker-compose.prod.yml down --remove-orphans > /dev/null 2>&1

echo "[2/4] Rimozione immagini esistenti..."
docker rmi videogames-backlog-webapp_frontend videogames-backlog-webapp_backend 2>/dev/null || true

echo "[3/4] Pulizia cache Docker (opzionale)..."
echo "Vuoi pulire anche la cache Docker? (y/N): "
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    docker system prune -f
    echo "Cache pulita!"
else
    echo "Cache mantenuta."
fi

echo "[4/4] Build e avvio completo..."
docker-compose --env-file "$ENV_FILE" -f deployment/docker/docker-compose.prod.yml up -d --build --force-recreate

# Torna alla directory degli script
cd "$SCRIPT_DIR"

if [ $? -eq 0 ]; then
    echo ""
    echo "=============================================="
    echo "  REBUILD COMPLETATO CON SUCCESSO!"
    echo "=============================================="
    echo ""
    echo "Frontend: http://localhost:3000/landing"
    echo "Backend:  http://localhost:5000"
    echo ""
    echo "[BROWSER] Apertura automatica del browser..."
    
    # Apertura browser cross-platform
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:3000/landing >/dev/null 2>&1
    elif command -v open > /dev/null; then
        open http://localhost:3000/landing
    else
        echo "Apri manualmente: http://localhost:3000/landing"
    fi
    
    echo ""
    echo "Buon gaming!"
else
    echo ""
    echo "=============================================="
    echo "  ERRORE DURANTE IL REBUILD"
    echo "=============================================="
    echo ""
    echo "Suggerimenti:"
    echo "   - Verifica che Docker sia in esecuzione"
    echo "   - Controlla che il file .env sia configurato"
    echo "   - Controlla i log: docker-compose logs"
    echo ""
    read -p "Premi Invio per uscire..."
    exit 1
fi
