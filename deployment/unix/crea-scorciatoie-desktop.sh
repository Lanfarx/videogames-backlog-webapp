#!/bin/bash

echo "=============================================="
echo "  CREAZIONE SCORCIATOIE DESKTOP"
echo "=============================================="
echo

# Ottieni il percorso della cartella deployment (parent della cartella unix)
DEPLOYMENT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESKTOP_PATH="$HOME/Desktop"

# Verifica che la cartella desktop esista
if [ ! -d "$DESKTOP_PATH" ]; then
    echo "Errore: Cartella Desktop non trovata in $DESKTOP_PATH"
    read -p "Premi Invio per continuare..."
    exit 1
fi

echo "Desktop trovato: $DESKTOP_PATH"
echo "Deployment path: $DEPLOYMENT_PATH"

# Rileva il sistema operativo
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - Crea file .command
    echo
    echo "Sistema operativo rilevato: macOS"
    echo "Creando file .command..."
    
    # Crea scorciatoia per avviare l'app
    echo "Creando scorciatoia 'GameBacklog - Avvia'..."
    cat > "$DESKTOP_PATH/GameBacklog - Avvia.command" << EOF
#!/bin/bash
cd "$DEPLOYMENT_PATH/unix"
./start.sh
EOF

    # Crea scorciatoia per fermare l'app
    echo "Creando scorciatoia 'GameBacklog - Ferma'..."
    cat > "$DESKTOP_PATH/GameBacklog - Ferma.command" << EOF
#!/bin/bash
cd "$DEPLOYMENT_PATH/unix"
./stop.sh
EOF

    # Rendi eseguibili i file
    chmod +x "$DESKTOP_PATH/GameBacklog - Avvia.command"
    chmod +x "$DESKTOP_PATH/GameBacklog - Ferma.command"

    echo "File .command creati e resi eseguibili"

elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux - Crea file .desktop
    echo
    echo "Sistema operativo rilevato: Linux"
    echo "Creando file .desktop..."
    
    # Crea file .desktop per avviare l'app
    echo "Creando scorciatoia 'GameBacklog - Avvia'..."
    cat > "$DESKTOP_PATH/gamebacklog-avvia.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=GameBacklog - Avvia
Comment=Avvia l'applicazione GameBacklog
Exec=gnome-terminal -- bash -c "cd '$DEPLOYMENT_PATH/unix' && ./start.sh"
Icon=applications-games
Terminal=false
Categories=Game;
EOF

    # Crea file .desktop per fermare l'app
    echo "Creando scorciatoia 'GameBacklog - Ferma'..."
    cat > "$DESKTOP_PATH/gamebacklog-ferma.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=GameBacklog - Ferma
Comment=Ferma l'applicazione GameBacklog
Exec=gnome-terminal -- bash -c "cd '$DEPLOYMENT_PATH/unix' && ./stop.sh"
Icon=process-stop
Terminal=false
Categories=System;
EOF

    # Rendi eseguibili i file .desktop
    chmod +x "$DESKTOP_PATH/gamebacklog-avvia.desktop"
    chmod +x "$DESKTOP_PATH/gamebacklog-ferma.desktop"

    # Rendi i file .desktop trusted (per alcune distribuzioni)
    if command -v gio &> /dev/null; then
        gio set "$DESKTOP_PATH/gamebacklog-avvia.desktop" metadata::trusted true 2>/dev/null || true
        gio set "$DESKTOP_PATH/gamebacklog-ferma.desktop" metadata::trusted true 2>/dev/null || true
    fi

    echo "File .desktop creati e resi eseguibili"

else
    echo "Sistema operativo non supportato: $OSTYPE"
    echo "Questo script supporta solo macOS e Linux"
    read -p "Premi Invio per continuare..."
    exit 1
fi

echo
echo "=============================================="
echo "  SCORCIATOIE CREATE CON SUCCESSO!"
echo "=============================================="
echo
echo "Le seguenti scorciatoie sono state create sul desktop:"
echo "  * GameBacklog - Avvia"
echo "  * GameBacklog - Ferma"
echo
echo "ISTRUZIONI:"
echo "1. Fai doppio click su 'GameBacklog - Avvia' per avviare l'app"
echo "2. Attendi che si apra il browser automaticamente"
echo "3. Per fermare l'app, fai doppio click su 'GameBacklog - Ferma'"
echo

if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "NOTA macOS: Al primo utilizzo, macOS potrebbe chiedere conferma per eseguire i file."
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "NOTA Linux: Su alcune distribuzioni potrebbe essere necessario confermare"
    echo "            l'esecuzione dei file .desktop al primo utilizzo."
fi

echo
read -p "Premi Invio per continuare..."
