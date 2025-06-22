#!/bin/bash
# Script di avvio rapido per Mac/Linux - Versione Migliorata

echo "=============================================="
echo "  GAMEBACKLOG - AVVIO RAPIDO"
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

echo "[INFO] Controllo immagini Docker esistenti..."

# Vai alla directory root
cd "$ROOT_DIR"

# Controlla se le immagini esistono già
FRONTEND_IMAGE=$(docker images -q videogames-backlog-webapp_frontend 2>/dev/null)
BACKEND_IMAGE=$(docker images -q videogames-backlog-webapp_backend 2>/dev/null)

if [ -n "$FRONTEND_IMAGE" ] && [ -n "$BACKEND_IMAGE" ]; then
    echo "[INFO] Immagini Docker trovate. Avvio rapido..."
    echo "[START] Avvio container esistenti..."
    
    # Avvio rapido senza build
    docker-compose --env-file "$ENV_FILE" -f deployment/docker/docker-compose.prod.yml down --remove-orphans > /dev/null 2>&1
    docker-compose --env-file "$ENV_FILE" -f deployment/docker/docker-compose.prod.yml up -d
else
    echo "[INFO] Immagini Docker non trovate. Eseguo build completa..."
    echo "[BUILD] Building e avvio container..."
    
    # Build completa
    docker-compose --env-file "$ENV_FILE" -f deployment/docker/docker-compose.prod.yml down --remove-orphans > /dev/null 2>&1
    docker-compose --env-file "$ENV_FILE" -f deployment/docker/docker-compose.prod.yml up -d --build
fi

# Torna alla directory degli script
cd "$SCRIPT_DIR"

if [ $? -eq 0 ]; then
    echo ""
    echo "=============================================="
    echo "  APPLICAZIONE AVVIATA CON SUCCESSO!"
    echo "=============================================="
    echo ""
    echo "Frontend: http://localhost:3000/landing"
    echo "Backend:  http://localhost:5000"
    echo ""
    echo "Comandi utili:"
    echo "   Logs:     docker-compose -f deployment/docker/docker-compose.prod.yml logs -f"
    echo "   Stop:     ./stop.sh"
    echo "   Rebuild:  ./rebuild.sh"
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
    echo "  ERRORE DURANTE L'AVVIO"
    echo "=============================================="
    echo ""
    echo "Suggerimenti:"
    echo "   - Verifica che Docker sia in esecuzione"
    echo "   - Controlla che il file .env sia configurato"
    echo "   - Prova con ./rebuild.sh per una build completa"
    echo ""
    read -p "Premi Invio per uscire..."
    exit 1
fi
