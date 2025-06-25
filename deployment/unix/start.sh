#!/bin/bash
# Script di avvio rapido per Mac/Linux - Versione Migliorata

echo "=============================================="
echo "  GAMEBACKLOG - AVVIO RAPIDO"
echo "=============================================="
echo

# Funzione per controllare se una porta è in uso
check_port() {
    local port=$1
    if command -v lsof > /dev/null; then
        lsof -i :$port > /dev/null 2>&1
    elif command -v netstat > /dev/null; then
        netstat -an | grep ":$port " > /dev/null 2>&1
    else
        # Fallback usando nc se disponibile
        if command -v nc > /dev/null; then
            nc -z localhost $port > /dev/null 2>&1
        else
            return 1 # Non possiamo controllare, assumiamo sia libera
        fi
    fi
}

# Controlla le porte richieste
echo "[INFO] Controllo disponibilità porte..."
FRONTEND_PORT=3000
BACKEND_PORT=5000

if check_port $FRONTEND_PORT; then
    echo "[WARNING] Porta $FRONTEND_PORT già in uso!"
    echo "[INFO] Processo sulla porta $FRONTEND_PORT:"
    if command -v lsof > /dev/null; then
        lsof -i :$FRONTEND_PORT
    fi
    echo ""
    echo "Opzioni:"
    echo "1. Termina il processo e continua"
    echo "2. Usa porta alternativa (3001)"
    echo "3. Esci"
    read -p "Scegli un'opzione (1-3): " choice
    
    case $choice in
        1)
            echo "[INFO] Tentativo di liberare la porta $FRONTEND_PORT..."
            if command -v lsof > /dev/null; then
                PID=$(lsof -t -i :$FRONTEND_PORT)
                if [ ! -z "$PID" ]; then
                    kill -9 $PID 2>/dev/null
                    sleep 2
                    if check_port $FRONTEND_PORT; then
                        echo "[ERROR] Impossibile liberare la porta $FRONTEND_PORT"
                        exit 1
                    else
                        echo "[SUCCESS] Porta $FRONTEND_PORT liberata"
                    fi
                fi
            fi
            ;;
        2)
            FRONTEND_PORT=3001
            echo "[INFO] Usando porta alternativa: $FRONTEND_PORT"
            ;;
        3)
            echo "[INFO] Uscita..."
            exit 0
            ;;
        *)
            echo "[ERROR] Opzione non valida"
            exit 1
            ;;
    esac
fi

if check_port $BACKEND_PORT; then
    echo "[WARNING] Porta $BACKEND_PORT già in uso!"
    echo "[INFO] Processo sulla porta $BACKEND_PORT:"
    if command -v lsof > /dev/null; then
        lsof -i :$BACKEND_PORT
    fi
    echo ""
    echo "Opzioni:"
    echo "1. Termina il processo e continua"
    echo "2. Usa porta alternativa (5001)"
    echo "3. Esci"
    read -p "Scegli un'opzione (1-3): " choice
    
    case $choice in
        1)
            echo "[INFO] Tentativo di liberare la porta $BACKEND_PORT..."
            if command -v lsof > /dev/null; then
                PID=$(lsof -t -i :$BACKEND_PORT)
                if [ ! -z "$PID" ]; then
                    kill -9 $PID 2>/dev/null
                    sleep 2
                    if check_port $BACKEND_PORT; then
                        echo "[ERROR] Impossibile liberare la porta $BACKEND_PORT"
                        exit 1
                    else
                        echo "[SUCCESS] Porta $BACKEND_PORT liberata"
                    fi
                fi
            fi
            ;;
        2)
            BACKEND_PORT=5001
            echo "[INFO] Usando porta alternativa: $BACKEND_PORT"
            ;;
        3)
            echo "[INFO] Uscita..."
            exit 0
            ;;
        *)
            echo "[ERROR] Opzione non valida"
            exit 1
            ;;
    esac
fi

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

# Crea un file docker-compose temporaneo con le porte corrette
TEMP_COMPOSE="$ROOT_DIR/docker-compose.temp.yml"
cp "$ROOT_DIR/deployment/docker/docker-compose.prod.yml" "$TEMP_COMPOSE"

# Sostituisci le porte nel file temporaneo
if [ "$FRONTEND_PORT" != "3000" ] || [ "$BACKEND_PORT" != "5000" ]; then
    echo "[INFO] Configurando porte personalizzate..."
    
    if command -v sed > /dev/null; then
        # Aggiorna le porte nel file temporaneo
        sed -i.bak "s/\"5000:80\"/\"$BACKEND_PORT:80\"/g" "$TEMP_COMPOSE"
        sed -i.bak "s/\"3000:80\"/\"$FRONTEND_PORT:80\"/g" "$TEMP_COMPOSE"
        
        # Aggiorna anche l'URL del backend nel frontend se necessario
        if [ "$BACKEND_PORT" != "5000" ]; then
            sed -i.bak "s/REACT_APP_API_URL=http:\/\/localhost:5000/REACT_APP_API_URL=http:\/\/localhost:$BACKEND_PORT/g" "$TEMP_COMPOSE"
        fi
        
        # Rimuovi i file di backup
        rm -f "$TEMP_COMPOSE.bak"
    fi
fi

# Controlla se le immagini esistono già
FRONTEND_IMAGE=$(docker images -q videogames-backlog-webapp_frontend 2>/dev/null)
BACKEND_IMAGE=$(docker images -q videogames-backlog-webapp_backend 2>/dev/null)

if [ -n "$FRONTEND_IMAGE" ] && [ -n "$BACKEND_IMAGE" ]; then
    echo "[INFO] Immagini Docker trovate. Avvio rapido..."
    echo "[START] Avvio container esistenti..."
    
    # Avvio rapido senza build
    docker-compose --env-file "$ENV_FILE" -f "$TEMP_COMPOSE" down --remove-orphans > /dev/null 2>&1
    docker-compose --env-file "$ENV_FILE" -f "$TEMP_COMPOSE" up -d
else
    echo "[INFO] Immagini Docker non trovate. Eseguo build completa..."
    echo "[BUILD] Building e avvio container..."
    
    # Build completa
    docker-compose --env-file "$ENV_FILE" -f "$TEMP_COMPOSE" down --remove-orphans > /dev/null 2>&1
    docker-compose --env-file "$ENV_FILE" -f "$TEMP_COMPOSE" up -d --build
fi

# Torna alla directory degli script
cd "$SCRIPT_DIR"

if [ $? -eq 0 ]; then
    echo ""
    echo "=============================================="
    echo "  APPLICAZIONE AVVIATA CON SUCCESSO!"
    echo "=============================================="
    echo ""
    echo "Frontend: http://localhost:$FRONTEND_PORT/landing"
    echo "Backend:  http://localhost:$BACKEND_PORT"
    echo ""
    echo "Comandi utili:"
    echo "   Logs:     docker-compose -f \"$TEMP_COMPOSE\" logs -f"
    echo "   Stop:     ./stop.sh"
    echo "   Rebuild:  ./rebuild.sh"
    echo ""
    echo "[BROWSER] Apertura automatica del browser..."
    
    # Apertura browser cross-platform
    if command -v xdg-open > /dev/null; then
        xdg-open "http://localhost:$FRONTEND_PORT/landing" >/dev/null 2>&1
    elif command -v open > /dev/null; then
        open "http://localhost:$FRONTEND_PORT/landing"
    else
        echo "Apri manualmente: http://localhost:$FRONTEND_PORT/landing"
    fi
    
    echo ""
    echo "Buon gaming!"
    
    # Pulizia del file temporaneo
    if [ -f "$TEMP_COMPOSE" ]; then
        rm -f "$TEMP_COMPOSE"
    fi
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
    echo "   - Verifica che le porte $FRONTEND_PORT e $BACKEND_PORT siano libere"
    echo ""
    echo "Debug porte:"
    if command -v lsof > /dev/null; then
        echo "Porte in uso:"
        lsof -i :$FRONTEND_PORT -i :$BACKEND_PORT 2>/dev/null || echo "Nessuna porta in conflitto rilevata"
    fi
    
    # Pulizia del file temporaneo anche in caso di errore
    if [ -f "$TEMP_COMPOSE" ]; then
        rm -f "$TEMP_COMPOSE"
    fi
    
    read -p "Premi Invio per uscire..."
    exit 1
fi
