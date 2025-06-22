#!/bin/bash
# Script per creare scorciatoie desktop per GameBacklog - Mac/Linux

echo "=============================================="
echo "  GAMEBACKLOG - CREAZIONE SCORCIATOIE"
echo "=============================================="
echo

# Ottieni il percorso assoluto degli script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Determina la directory del desktop in base al sistema operativo
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    DESKTOP_DIR="$HOME/Desktop"
    SHORTCUT_EXT=""
    echo "[INFO] Sistema rilevato: macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    DESKTOP_DIR="$HOME/Desktop"
    SHORTCUT_EXT=".desktop"
    echo "[INFO] Sistema rilevato: Linux"
else
    echo "[ERROR] Sistema operativo non supportato"
    exit 1
fi

# Controlla se la directory Desktop esiste
if [ ! -d "$DESKTOP_DIR" ]; then
    echo "[ERROR] Directory Desktop non trovata: $DESKTOP_DIR"
    exit 1
fi

echo "[INFO] Creazione scorciatoie in: $DESKTOP_DIR"
echo

# Funzione per creare scorciatoia macOS
create_macos_shortcut() {
    local name="$1"
    local script_path="$2"
    local shortcut_path="$DESKTOP_DIR/$name"
    
    cat > "$shortcut_path" << EOF
#!/bin/bash
cd "$SCRIPT_DIR"
./$script_path
EOF
    
    chmod +x "$shortcut_path"
    echo "[CREATE] $name"
}

# Funzione per creare scorciatoia Linux (.desktop)
create_linux_shortcut() {
    local name="$1"
    local script_path="$2"
    local description="$3"
    local shortcut_path="$DESKTOP_DIR/$name$SHORTCUT_EXT"
    
    cat > "$shortcut_path" << EOF
[Desktop Entry]
Name=$name
Comment=$description
Exec=bash -c "cd '$SCRIPT_DIR' && './$script_path'; read -p 'Premi Invio per chiudere...'"
Icon=applications-games
Terminal=true
Type=Application
Categories=Game;
EOF
    
    chmod +x "$shortcut_path"
    echo "[CREATE] $name$SHORTCUT_EXT"
}

# Crea le scorciatoie in base al sistema operativo
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - crea script eseguibili
    create_macos_shortcut "GameBacklog - Avvia" "start.sh"
    create_macos_shortcut "GameBacklog - Ferma" "stop.sh"
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux - crea file .desktop
    create_linux_shortcut "GameBacklog - Avvia" "start.sh" "Avvia l'applicazione GameBacklog"
    create_linux_shortcut "GameBacklog - Ferma" "stop.sh" "Ferma l'applicazione GameBacklog"
fi

echo ""
echo "=============================================="
echo "  SCORCIATOIE CREATE CON SUCCESSO!"
echo "=============================================="
echo ""
echo "Le seguenti scorciatoie sono state create sul Desktop:"
echo ""
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "- GameBacklog - Avvia (avvia l'applicazione)"
    echo "- GameBacklog - Ferma (ferma l'applicazione)"
    echo ""
    echo "Su macOS, fai doppio clic per eseguire."
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "- GameBacklog - Avvia.desktop (avvia l'applicazione)"
    echo "- GameBacklog - Ferma.desktop (ferma l'applicazione)"
    echo ""
    echo "Su Linux, fai doppio clic e seleziona 'Esegui' se richiesto."
fi

echo ""
echo "NOTA: Le scorciatoie funzionano solo se Docker è installato"
echo "      e in esecuzione sul sistema."
echo ""
read -p "Premi Invio per uscire..."
