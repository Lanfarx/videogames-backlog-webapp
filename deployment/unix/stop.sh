#!/bin/bash
# Script per fermare l'applicazione - Versione Migliorata

echo "=============================================="
echo "  GAMEBACKLOG - STOP"
echo "=============================================="
echo

# Ottieni il percorso assoluto del file .env
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

echo "[STOP] Fermata container Docker..."

# Vai alla directory root
cd "$ROOT_DIR"

# Ferma tutti i container
docker-compose --env-file "$ENV_FILE" -f deployment/docker/docker-compose.prod.yml down

# Torna alla directory degli script
cd "$SCRIPT_DIR"

if [ $? -eq 0 ]; then
    echo ""
    echo "=============================================="
    echo "  APPLICAZIONE FERMATA CON SUCCESSO!"
    echo "=============================================="
    echo ""
    echo "Per riavviare usa: ./start.sh"
    echo "Per rebuild completo usa: ./rebuild.sh"
else
    echo ""
    echo "=============================================="
    echo "  ERRORE DURANTE LA FERMATA"
    echo "=============================================="
    echo ""
    echo "Prova a fermare manualmente:"
    echo "   docker-compose -f deployment/docker/docker-compose.prod.yml down --remove-orphans"
    echo ""
    read -p "Premi Invio per uscire..."
    exit 1
fi
