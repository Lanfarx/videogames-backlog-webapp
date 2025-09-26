# 🚀 QUICK START - Backlog Videoludico

Guida completa per avviare l'applicazione sul tuo computer in pochi minuti.

## 📋 Prerequisiti Obbligatori

### 1. Docker Desktop
- **Scarica**: [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
- **Installa** e **avvia** Docker Desktop
- **Aspetta** che sia completamente caricato (icona verde)
- **Verifica**: Il logo Docker deve essere visibile nella system tray

### 2. Spazio su Disco
- **Minimo**: 2GB liberi per le immagini Docker
- **Raccomandato**: 5GB per eventuali ricostruzioni

### 3. Porte di Rete
- **Porta 3000**: Frontend (React)
- **Porta 5000**: Backend (.NET)
- Se occupate, l'app ti avviserà come liberarle

## 🎯 Avvio Rapido (Raccomandato)

### ⚡ Metodo Scorciatoie Desktop

**Windows:**
1. **Prima configurazione** (solo una volta):
   ```cmd
   cd deployment\windows
   crea-scorciatoie-desktop.bat
   ```
2. **Uso quotidiano**: Doppio click su **"GameBacklog - Avvia"** sul desktop

**Mac/Linux:**
1. **Prima configurazione** (solo una volta):
   ```bash
   cd deployment/unix
   chmod +x *.sh
   ./crea-scorciatoie-desktop.sh
   ```
2. **Uso quotidiano**: Doppio click su **"GameBacklog - Avvia"** sul desktop

### 🖱️ Metodo Manuale

**Windows:**
```cmd
cd deployment\windows
start.bat
```

**Mac/Linux:**
```bash
cd deployment/unix
./start.sh
```

### ⏱️ Tempi di Avvio
- **Prima volta**: 5-10 minuti (build completa)
- **Volte successive**: 30 secondi (avvio rapido)
- **Auto-detecta**: Se serve ricostruire le immagini
## ⚙️ Configurazione File .env (Opzionale)

L'app **funziona perfettamente senza configurazioni**, ma puoi personalizzarla:

### 1. Crea il File di Configurazione
```bash
# Nella root del progetto
cp .env.example .env
```

### 2. Configura API Keys (Opzionale)

**Per funzionalità aggiuntive**, modifica il file `.env`:

```env
# =============================================================================
# CONFIGURAZIONE BACKEND - BACKLOG VIDEOLUDICO  
# =============================================================================

# -----------------------------------------------------------------------------
# DATABASE (Automatico per sviluppo locale)
# -----------------------------------------------------------------------------
# Lascia vuoto per database locale PostgreSQL automatico
# Configura solo per deployment condiviso con database cloud
DATABASE_URL=

# -----------------------------------------------------------------------------
# API KEYS (Opzionali - migliorano l'esperienza)
# -----------------------------------------------------------------------------
# Steam Web API - per importare libreria Steam
STEAM_API_KEY=

# RAWG API - per database videogiochi completo
REACT_APP_RAWG_API_KEY=

# -----------------------------------------------------------------------------
# CONFIGURAZIONE APPLICAZIONE (Non modificare)
# -----------------------------------------------------------------------------
BACKEND_PORT=5000
```

### 3. Come Ottenere le API Keys

#### 🎮 Steam API Key (per importazione libreria)
1. Vai su: https://steamcommunity.com/dev/apikey
2. Accedi con il tuo account Steam
3. Inserisci un dominio qualsiasi (es: `localhost`)
4. Copia la chiave e incollala in: `STEAM_API_KEY=tua_chiave_qui`

#### 🎯 RAWG API Key (per ricerca giochi migliorata)
1. Vai su: https://rawg.io/apidocs
2. Crea un account gratuito
3. Ottieni la API key gratuita
4. Copia la chiave e incollala in: `REACT_APP_RAWG_API_KEY=tua_chiave_qui`

### 🚫 Funzionalità Senza API Keys

**✅ Sempre Disponibili (senza API keys):**
- ✅ Sistema di registrazione e login
- ✅ Aggiunta manuale giochi al backlog
- ✅ Gestione stati (Completato, In corso, Backlog, etc.)
- ✅ Note e recensioni personali
- ✅ Dashboard con statistiche complete
- ✅ Sistema sociale (amici, attività, reazioni)
- ✅ Timeline e notifiche
- ✅ Tutte le funzionalità core dell'applicazione

**🔑 Con RAWG API Key:**
- ➕ Ricerca automatica giochi nel catalogo mondiale
- ➕ Copertine e immagini automatiche
- ➕ Informazioni dettagliate (generi, sviluppatori, anno)
- ➕ Suggerimenti di giochi correlati

**🎮 Con Steam API Key:**
- ➕ Importazione automatica libreria Steam
- ➕ Sincronizzazione ore di gioco Steam
- ➕ Collegamento achievement (in sviluppo)

## 🚀 Script di Avvio

### 📁 Script Disponibili

| **Azione** | **Windows** | **Mac/Linux** | **Descrizione** |
|------------|-------------|---------------|-----------------|
| **🚀 Avvio** | `start.bat` | `./start.sh` | Avvio intelligente (rapido o build se necessario) |
| **🛑 Stop** | `stop.bat` | `./stop.sh` | Ferma tutti i container Docker |
| **🔧 Rebuild** | `rebuild.bat` | `./rebuild.sh` | Ricostruisce tutto da zero (per aggiornamenti) |
| **🖥️ Scorciatoie** | `crea-scorciatoie-desktop.bat` | `./crea-scorciatoie-desktop.sh` | Crea scorciatoie desktop (una volta) |

### ⚡ Come Funziona l'Avvio Intelligente

Gli script sono **smart** e ottimizzano automaticamente l'avvio:

1. **Controlli preliminari**:
   - ✅ Docker Desktop è avviato?
   - ✅ File `.env` esiste?
   - ✅ Porte 3000 e 5000 libere?

2. **Detecta immagini Docker**:
   - 🏃‍♂️ **Immagini esistenti**: Avvio rapido (30 sec)
   - 🔨 **Immagini mancanti**: Build automatica (5-10 min)

3. **Avvio automatico**:
   - 🌐 Avvia i container Docker
   - ⏳ Aspetta che i servizi siano pronti
   - 🌐 Apre automaticamente il browser

4. **Risultato finale**:
   - **Frontend**: http://localhost:3000/landing
   - **Backend API**: http://localhost:5000/swagger

## 🌐 Accesso all'Applicazione

### 🎯 URL Principali
- **🏠 Homepage**: http://localhost:3000/landing
- **📱 App Principale**: http://localhost:3000/dashboard
- **🔧 API Docs**: http://localhost:5000/swagger
- **💾 Database**: Interno ai container (PostgreSQL)

### 🕐 Tempi di Attesa
- **Primo avvio**: 5-10 minuti (download + build)
- **Avvii successivi**: 30 secondi
- **Pronto quando**: Il browser si apre automaticamente

## 🛑 Fermare l'Applicazione

### 🖥️ Con Scorciatoie Desktop
- **Doppio click** su **"GameBacklog - Ferma"** sul desktop
- Tutto si ferma automaticamente

### 📁 Metodo Manuale

**Windows:**
```cmd
cd deployment\windows
stop.bat
```

**Mac/Linux:**
```bash
cd deployment/unix
./stop.sh
```

### � Verifica che Tutto sia Fermo
```bash
# Controlla che i container siano fermati
docker ps

# Dovrebbe mostrare una lista vuota o senza container 'videogames-*'
```

## �🔧 Comandi Utili per Diagnosi

### 📊 Stato Container
```bash
# Vedi tutti i container in esecuzione
docker ps

# Vedi anche quelli fermati
docker ps -a
```

### 📋 Log dell'Applicazione

**Windows:**
```cmd
cd deployment\windows
# Non ancora implementato - usa Docker Desktop per i log
```

**Mac/Linux:**
```bash
cd deployment/unix
./start.sh --logs
```

**Manuale (tutti i sistemi):**
```bash
# Log in tempo reale
docker-compose -f deployment/docker/docker-compose.prod.yml logs -f

# Log solo backend
docker logs videogames-backend-prod

# Log solo frontend  
docker logs videogames-frontend-prod
```

### 🧹 Pulizia Sistema (Se Necessaria)
```bash
# Rimuovi container fermati
docker container prune

# Rimuovi immagini non utilizzate
docker image prune

# Pulizia completa (ATTENZIONE: rimuove tutto)
docker system prune -a
```

## 🚨 Risoluzione Problemi Comuni

### ❌ "Docker non è in esecuzione"
**Problema**: Script si ferma con errore Docker
**Soluzione**:
1. Apri Docker Desktop
2. Aspetta che si carichi completamente (icona verde)
3. Riprova il comando di avvio

### ❌ "File .env non trovato"  
**Problema**: Script non trova il file di configurazione
**Soluzione**:
```bash
# Nella root del progetto
cp .env.example .env
```

### ❌ "Porta già in uso" (Error port 3000/5000)
**Problema**: Un'altra app usa le porte dell'applicazione
**Soluzione Windows**:
```cmd
# Trova cosa usa la porta 3000
netstat -ano | findstr :3000
# Termina il processo (sostituisci PID con il numero trovato)
taskkill /PID <numero_PID> /F
```

**Soluzione Mac/Linux**:
```bash
# Trova cosa usa la porta 3000
lsof -i :3000
# Termina il processo
kill -9 <PID>
```

### ❌ "Database connection failed"
**Problema**: Backend non si connette al database
**Diagnosi**:
1. Controlla il file `.env` nella root
2. Verifica che `DATABASE_URL` sia vuoto (per sviluppo locale)
3. Se usi database cloud, verifica la connection string

**Soluzione**:
```bash
# Per sviluppo locale, assicurati che DATABASE_URL sia vuoto
DATABASE_URL=

# Riavvia tutto
stop.bat    # o stop.sh
start.bat   # o start.sh
```

### ❌ Build fallisce con errori di rete
**Problema**: Download di pacchetti fallisce
**Soluzione**:
```bash
# Pulisci cache Docker
docker system prune -f

# Riprova con rebuild completo
rebuild.bat  # o rebuild.sh
```

### ❌ App lenta o non risponde
**Problema**: L'app è molto lenta al primo avvio
**Diagnosi**: È normale per il primo avvio (5-10 minuti)
**Soluzione**:
1. Aspetta pazientemente (controlla i log)
2. Se fermo da >15 minuti, riavvia i container

### ❌ Browser non si apre automaticamente
**Problema**: Script completa ma browser non si apre
**Soluzione**: Vai manualmente su http://localhost:3000/landing

### 🔍 Come Controllare se Funziona Tutto

**1. Controlla i container:**
```bash
docker ps
# Dovresti vedere:
# videogames-backend-prod (porta 5000)
# videogames-frontend-prod (porta 3000)
```

**2. Testa gli endpoint:**
- **Frontend**: http://localhost:3000/landing → Dovrebbe caricare la homepage
- **Backend**: http://localhost:5000/health → Dovrebbe restituire "OK"
- **API Docs**: http://localhost:5000/swagger → Documentazione API

**3. Controlla i log per errori:**
```bash
# Windows: Usa Docker Desktop → Container → Logs
# Mac/Linux: 
docker logs videogames-backend-prod
docker logs videogames-frontend-prod
```

### 🆘 Riavvio Completo di Emergenza

Se nulla funziona, riavvio completo:

```bash
# 1. Ferma tutto
docker-compose -f deployment/docker/docker-compose.prod.yml down

# 2. Rimuovi container e volumi
docker container prune -f
docker volume prune -f

# 3. Ricostruisci tutto
rebuild.bat  # o rebuild.sh
```

## 📱 Primo Utilizzo dell'App

### 🚀 Accesso Iniziale
1. **Apri il browser** su http://localhost:3000/landing (automatico con gli script)
2. **Registrazione**: Crea il tuo account con email e password
3. **Verifica email**: Non necessaria (sistema locale)
4. **Login**: Accedi con le credenziali create

### ⚙️ Configurazione Iniziale Profilo
1. **Completa il profilo**:
   - Avatar (opzionale)
   - Nome visualizzato
   - Bio personale (opzionale)
   - Impostazioni privacy

2. **Configura preferenze**:
   - Dark/Light mode
   - Lingua interfaccia
   - Notifiche

### 🎮 Prime Azioni Raccomandate

**1. Aggiungi il tuo primo gioco:**
- Vai nella sezione **"Libreria"**
- Click su **"Aggiungi Gioco"**
- Cerca per titolo (RAWG API se configurata) o aggiungi manualmente
- Imposta stato: Backlog, In Corso, Completato, etc.

**2. Importa da Steam (se configurato):**
- Vai in **"Impostazioni"** → **"Integrazioni"**
- Collega account Steam
- Importa automaticamente la tua libreria

**3. Esplora le funzionalità:**
- **📊 Dashboard**: Vedi statistiche del tuo backlog
- **👥 Social**: Aggiungi amici e vedi le loro attività
- **🔍 Catalogo**: Scopri nuovi giochi da aggiungere
- **📈 Statistiche**: Analizza le tue abitudini di gioco

### 🎯 Funzionalità Chiave da Provare

- **Stati personalizzati**: Backlog → In Corso → Completato → Platino
- **Ore di gioco**: Traccia il tempo dedicato a ogni gioco
- **Recensioni**: Aggiungi voti e commenti personali
- **Timeline sociale**: Vedi cosa fanno i tuoi amici
- **Notifiche**: Ricevi aggiornamenti su attività social

## 🔗 URL di Riferimento Rapido

| **Funzione** | **URL** | **Descrizione** |
|--------------|---------|-----------------|
| 🏠 **Homepage** | http://localhost:3000/landing | Pagina di benvenuto |
| 📱 **Dashboard** | http://localhost:3000/dashboard | Pannello principale utente |
| 📚 **Libreria** | http://localhost:3000/library | Gestione giochi personali |
| 👥 **Social** | http://localhost:3000/social | Timeline amici e attività |
| 🔍 **Catalogo** | http://localhost:3000/catalog | Ricerca nuovi giochi |
| ⚙️ **Impostazioni** | http://localhost:3000/settings | Configurazione account |
| 🔧 **API Docs** | http://localhost:5000/swagger | Documentazione tecnica API |
| 💊 **Health Check** | http://localhost:5000/health | Stato servizi backend |

---

## 🆘 Supporto e Problemi

### 🔍 Prima di Chiedere Aiuto
1. **Controlla i prerequisiti**: Docker Desktop avviato?
2. **Verifica lo stato**: `docker ps` mostra i container?
3. **Leggi i log**: Ci sono errori evidenti?
4. **Riavvio completo**: Prova `stop.bat` + `start.bat`

### 📞 Come Segnalare un Problema
1. **Descrivi** cosa stavi facendo
2. **Copia** eventuali messaggi di errore
3. **Includi** output di `docker ps` e `docker logs`
4. **Specifica** il tuo sistema operativo

### 🎮 Happy Gaming!

L'app è pronta! Inizia a organizzare il tuo backlog e condividi la passione per i videogiochi con i tuoi amici.

**Divertiti e buon gaming! 🚀🎮**
