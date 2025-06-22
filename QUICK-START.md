# 🚀 QUICK START - Backlog Videoludico

Guida rapida per avviare l'applicazione sul tuo computer.

## 📋 Prerequisiti

### 1. Installa Docker Desktop
- Scarica da [docker.com](https://www.docker.com/products/docker-desktop/)
- Installa e avvia Docker Desktop
- Aspetta che sia completamente caricato (icona verde)

## 🎯 Avvio Rapido (Raccomandato)

### Windows
1. **Avvia**: Fai doppio clic su `deployment/windows/start.bat`
2. **Scorciatoie**: Esegui `deployment/windows/crea-scorciatoie-desktop.bat` (opzionale)

### Mac/Linux
1. **Avvia**: Esegui `./deployment/unix/start.sh` dal terminale
2. **Scorciatoie**: Esegui `./deployment/unix/crea-scorciatoie-desktop.sh` (opzionale)

### Come Funzionano gli Script
- **Primo avvio**: Build completa automatica (5-10 minuti)
- **Avvii successivi**: Rapidi (30 secondi) se le immagini esistono
- **Stop**: Usa `stop.bat`/`stop.sh` per fermare tutto
- **Rebuild**: Usa `rebuild.bat`/`rebuild.sh` per ricostruire da zero

🌐 **L'app si aprirà automaticamente su**: http://localhost:3000/landing

## ⚙️ Configurazione Avanzata

Se vuoi personalizzare l'applicazione, configura le API keys:

2. **RAWG API Key** (per ricerca giochi):
   - Vai su: https://rawg.io/apidocs
   - Registrati gratuitamente e ottieni la chiave
   - Inserisci nel file `frontend/.env`: `REACT_APP_RAWG_API_KEY=tua_chiave_qui`

> ⚠️ **Importante**: Senza queste API keys alcune funzionalità saranno limitate, ma l'app funzionerà comunque!

### 3. API Keys (Dettaglio)

L'app funziona anche **senza** le API keys, ma con limitazioni:

### ❌ Senza Steam API Key:
- Non puoi importare automaticamente la tua libreria Steam
- Devi aggiungere ogni gioco manualmente

### ❌ Senza RAWG API Key:
- Ricerca giochi limitata al database locale
### 1. Configura le API Keys (Opzionale)

**Per funzionalità aggiuntive**, configura il file `.env` nella root del progetto:

```bash
cp .env.example .env
```

Modifica il file `.env` con le tue API keys:
- **STEAM_API_KEY**: Per importare libreria Steam (opzionale)
- **REACT_APP_RAWG_API_KEY**: Per ricerca giochi migliorata (opzionale)

🔑 **Per ottenere le API keys**:

1. **Steam API Key** (per importare libreria Steam):
   - Vai su: https://steamcommunity.com/dev/apikey
   - Inserisci: `STEAM_API_KEY=tua_chiave_qui`

2. **RAWG API Key** (per database giochi migliorato):
   - Vai su: https://rawg.io/apidocs
   - Crea account gratuito
   - Inserisci: `REACT_APP_RAWG_API_KEY=tua_chiave_qui`

### 🚫 Cosa Succede Senza API Keys?

**Senza RAWG API Key**:
- Funziona comunque perfettamente!
- Meno informazioni automatiche sui giochi (cover, descrizioni, etc.)
- Dovrai inserire manualmente i dettagli dei giochi

**Senza Steam API Key**:
- Non puoi importare automaticamente la libreria Steam
- Puoi comunque aggiungere giochi manualmente

### ✅ Funzionalità Sempre Disponibili:
- Aggiunta manuale di giochi al backlog
- Gestione stati (Completato, In corso, Da giocare, etc.)
- Note personali sui giochi
- Statistiche del backlog
- Sistema sociale completo

## 🚀 Metodi di Avvio

### 🎯 METODO SEMPLICE (Raccomandato)

**Windows:**
```bash
cd deployment/windows
start.bat                              # Avvio intelligente
crea-scorciatoie-desktop.bat          # Crea scorciatoie (una volta)
```

**Mac/Linux:**
```bash
cd deployment/unix
./start.sh                             # Avvio intelligente
./crea-scorciatoie-desktop.sh         # Crea scorciatoie (una volta)
```

### � SCRIPT DISPONIBILI

| Azione | Windows | Mac/Linux | Descrizione |
|--------|---------|-----------|-------------|
| **Avvio** | `start.bat` | `./start.sh` | Avvio rapido o build se necessario |
| **Stop** | `stop.bat` | `./stop.sh` | Ferma tutti i container |
| **Rebuild** | `rebuild.bat` | `./rebuild.sh` | Ricostruisce tutto da zero |
| **Scorciatoie** | `crea-scorciatoie-desktop.bat` | `./crea-scorciatoie-desktop.sh` | Crea scorciatoie desktop |

### ⚡ Come Funziona l'Avvio Intelligente

- **Prima volta**: Build completa (5-10 minuti)
- **Avvii successivi**: Rapidi (30 secondi) 
- **Detecta automaticamente** se serve ricostruire
- **Apre automaticamente** il browser su http://localhost:3000/landing
chmod +x *.sh     # Solo la prima volta
./start.sh
```

**Prima volta**: Ci vogliono 3-5 minuti per scaricare tutto  
**Volte successive**: ~30 secondi

## 🌐 Accesso

Con le scorciatoie desktop, il browser si apre automaticamente!

Altrimenti vai manualmente su:
- **App**: http://localhost:3000
- **API**: http://localhost:5000

## 🛑 Fermare l'App

### Con Scorciatoie Desktop
Doppio click su **"Ferma Backlog Videoludico"** sul desktop

### Metodo Manuale
Nella cartella deployment:

### Windows
```bash
cd deployment/windows
stop.bat           # Oppure stop.ps1  
```

### Mac/Linux
```bash
cd deployment/unix
./stop.sh
```

## 🔧 Comandi Utili

### Vedere i Log
```bash
# Windows
cd deployment/windows
logs.bat

# Mac/Linux  
cd deployment/unix
./start.sh --logs
```

### Stato Container
```bash
docker ps
```

### Riavvio Completo
```bash
# Windows
cd deployment/windows
stop.bat
start.bat

# Mac/Linux
cd deployment/unix
./stop.sh
./start.sh
```

## 🚨 Problemi Comuni

### "Database connection failed"
- Verifica che `DATABASE_URL` sia corretto
- Controlla che il database cloud sia attivo
- Prova a ricreare il database

### "Porta già in uso"
- Chiudi altre app che usano porte 3000 o 5000
- Su Windows: `netstat -ano | findstr :3000`
- Su Mac/Linux: `lsof -i :3000`

### "Docker non risponde"
- Riavvia Docker Desktop
- Aspetta che sia completamente caricato
- Riprova il comando

### App lenta al primo avvio
- È normale, sta configurando tutto
- Controlla i log: `docker-compose logs -f`
- Se è bloccato, riavvia i container

## 📱 Primo Uso

1. Vai su http://localhost:3000
2. **Registrati** con email e password
3. **Completa il profilo** con le tue info
4. **Aggiungi il tuo primo gioco** dalla libreria

## 🎮 Funzionalità Principali

- **📚 Library**: Gestisci i tuoi giochi
- **📊 Dashboard**: Vedi le statistiche  
- **👥 Friends**: Aggiungi amici e vedi le loro attività
- **🔍 Catalog**: Cerca nuovi giochi da aggiungere
- **⚙️ Settings**: Personalizza l'app

---

## 🆘 Supporto

Se hai problemi:
1. Controlla che Docker sia avviato
2. Verifica il file `.env`
3. Guarda i log per errori
4. Riavvia i container

**Buon divertimento! 🎮**
