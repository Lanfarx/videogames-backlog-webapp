# 🚀 QUICK START - Backlog Videoludico

Guida rapida per avviare l'applicazione sul tuo computer.

## 📋 Prerequisiti

### 1. Installa Docker Desktop
- Scarica da [docker.com](https://www.docker.com/products/docker-desktop/)
- Installa e avvia Docker Desktop
- Aspetta che sia completamente caricato (icona verde)

## ⚙️ Configurazione

### 1. Scarica il Progetto
```bash
git clone <url-repository>
cd videogames-backlog-webapp
```

### 2. Configura le Tue API Keys

**IMPORTANTE**: È necessario configurare sia il backend che il frontend:

#### A. Configurazione Backend
```bash
cp .env.example .env
```

Modifica il file `.env` nella **root del progetto** con le tue API keys:
- **STEAM_API_KEY**: Per importare libreria Steam (opzionale)

#### B. Configurazione Frontend (OBBLIGATORIA)
```bash
cd frontend
cp .env.example .env  
```

Modifica il file `frontend/.env` con:
- **REACT_APP_API_URL**: URL del backend (default: http://localhost:5000)
- **REACT_APP_RAWG_API_KEY**: Per ricerca giochi (opzionale ma raccomandato)

> ⚠️ **NOTA IMPORTANTE**: Il file `frontend/.env` è **necessario** per il corretto funzionamento! Il frontend deve avere la sua configurazione separata.

Il database e la sicurezza sono già **preconfigurati** nel backend.

**🔑 Per ottenere le API keys**:

1. **Steam API Key** (per importare libreria Steam):
   - Vai su: https://steamcommunity.com/dev/apikey
   - Inserisci la chiave nel file `.env` della root: `STEAM_API_KEY=tua_chiave_qui`

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
- Meno informazioni automatiche sui giochi (cover, descrizioni, etc.)
- Dovrai inserire manualmente i dettagli dei giochi

### ✅ Funzionalità Sempre Disponibili:
- Aggiunta manuale di giochi al backlog
- Gestione stati (Completato, In corso, Da giocare, etc.)
- Note personali sui giochi
- Statistiche del backlog

## 🚀 Avvio

### 🖥️ SUPER FACILE (Windows - Raccomandato)

**Setup una volta sola:**
```bash
cd deployment/windows
crea-scorciatoie-desktop.bat
```

**Uso quotidiano:**
1. **Doppio click** su "GameBacklog - Avvia" (desktop)
2. **Attendi 10 secondi** - si apre automaticamente nel browser
3. **Per fermare**: doppio click su "GameBacklog - Ferma" (desktop)

### 🍎🐧 SUPER FACILE (Mac/Linux - Raccomandato)

**Setup una volta sola:**
```bash
cd deployment/unix
chmod +x crea-scorciatoie-desktop.sh
./crea-scorciatoie-desktop.sh
```

**Uso quotidiano:**
1. **Doppio click** su "GameBacklog - Avvia" (desktop)
2. **Attendi 10 secondi** - si apre automaticamente nel browser
3. **Per fermare**: doppio click su "GameBacklog - Ferma" (desktop)

### 📂 METODO MANUALE

### Windows
```bash
cd deployment/windows
start.bat          # File batch semplice (raccomandato)
start.ps1          # PowerShell (più informazioni)
```

### Mac/Linux
```bash
cd deployment/unix
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
