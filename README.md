# 🎮 Backlog Videoludico 

**Backlog Videoludico** è un'applicazione web completa che permette agli utenti di gestire il proprio backlog di videogiochi con funzionalità social integrate.  

Il progetto è composto da:
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: .NET 8 + PostgreSQL + JWT Authentication  
- **Deployment**: Docker containerizzato per facile distribuzione

## 🚀 Quick Start

### Avvio Rapido con Script

**Windows (Raccomandato):**
1. **Avvia l'applicazione**: Esegui `deployment/windows/start.bat`
   - Avvio rapido se le immagini esistono
   - Build automatica se necessario
2. **Crea scorciatoie desktop**: Esegui `deployment/windows/crea-scorciatoie-desktop.bat`
   - Crea 2 scorciatoie: "GameBacklog - Avvia" e "GameBacklog - Ferma"

**Mac/Linux:**
1. **Avvia l'applicazione**: Esegui `deployment/unix/start.sh`
2. **Crea scorciatoie desktop**: Esegui `deployment/unix/crea-scorciatoie-desktop.sh`

### Script Disponibili

| Script | Windows | Mac/Linux | Descrizione |
|--------|---------|-----------|-------------|
| **Avvio** | `start.bat` | `start.sh` | Avvio intelligente (rapido se già costruito) |
| **Stop** | `stop.bat` | `stop.sh` | Ferma tutti i container |
| **Rebuild** | `rebuild.bat` | `rebuild.sh` | Ricostruisce tutto da zero |
| **Scorciatoie** | `crea-scorciatoie-desktop.bat` | `crea-scorciatoie-desktop.sh` | Crea scorciatoie desktop |

### Setup Manuale

Per istruzioni dettagliate di setup manuale, leggi il file [QUICK-START.md](./QUICK-START.md).

## ✨ Funzionalità implementate

### 🎯 Gestione Libreria
- **Gestione completa** della libreria di giochi con CRUD operations
- **Stati personalizzabili**: Backlog, In Corso, Completato, Abbandonato, Platino
- **Filtri avanzati** per stato, piattaforma, genere, anno, valutazione, ecc
- **Ricerca intelligente** con integrazione API RAWG per dati automatici
- **Sincronizzazione Steam** per importare automaticamente i giochi
- **Sistema di commenti** e appunti personali per ogni gioco

### 📊 Dashboard e Statistiche
- **Dashboard personalizzata** con statistiche dettagliate
- **Grafici interattivi** per distribuzione per stato, piattaforme, generi
- **Tracking delle ore** di gioco e progressi
- **Timeline delle attività** con cronologia completa

### 👥 Sistema Social
- **Sistema di amicizie** con richieste e gestione contatti
- **Profili pubblici** con privacy settings configurabili
- **Timeline sociale** per vedere le attività degli amici
- **Sistema di reazioni** emoji alle attività
- **Commenti** alle recensioni e attività

### 🔐 Autenticazione e Sicurezza
- **Autenticazione JWT** completa con registrazione e login
- **Gestione profili** con avatar, bio e preferenze personalizzate
- **Sistema di privacy** granulare per controllo visibilità
- **Notifiche** in tempo reale per interazioni sociali

### 🎨 Interfaccia Utente
- **Design moderno** e responsive con dark/light mode
- **Componenti UI** avanzati e custom components riutilizzabili
- **Animazioni fluide** e transizioni smooth
- **Esperienza mobile-first** ottimizzata per tutti i dispositivi

## 🛠️ Stack Tecnologico

### Frontend
- **[React 19.1.0](https://react.dev/)** con TypeScript
- **[Tailwind CSS](https://tailwindcss.com/)** per styling moderno
- **[Lucide React](https://lucide.dev/)** per icone moderne
- **[React Router DOM](https://reactrouter.com/)** per routing
- **[Redux Toolkit](https://redux-toolkit.js.org/)** per state management
- **[Axios](https://axios-http.com/)** per chiamate API

### Backend
- **[.NET 8](https://dotnet.microsoft.com/)** con ASP.NET Core
- **[Entity Framework Core](https://docs.microsoft.com/ef/core/)** con PostgreSQL
- **[ASP.NET Identity](https://docs.microsoft.com/aspnet/core/security/authentication/identity)** per autenticazione
- **[JWT Bearer](https://jwt.io/)** per autorizzazione
- **[Swagger/OpenAPI](https://swagger.io/)** per documentazione API

### Database e Infrastruttura
- **[PostgreSQL](https://www.postgresql.org/)** come database principale
- **[Steam Web API](https://steamcommunity.com/dev)** per integrazione Steam
- **[RAWG API](https://rawg.io/apidocs)** per dati sui videogiochi

## 🏗️ Architettura del Progetto

```
videogames-backlog-webapp/
├── frontend/                          # React TypeScript Frontend
│   ├── src/
│   │   ├── components/               # Componenti riutilizzabili
│   │   ├── pages/                    # Pagine principali
│   │   ├── store/                    # Redux store e services
│   │   ├── types/                    # TypeScript definitions
│   │   └── config/                   # Configurazioni
│   └── package.json
├── VideoGamesBacklogBackend/         # .NET 8 Backend API
│   ├── Controllers/                 # API Controllers
│   ├── Models/                      # Entity Models
│   ├── Services/                    # Business Logic
│   ├── Data/                        # DbContext
│   └── Program.cs
├── deployment/                       # Script e configurazioni deployment
│   ├── windows/                      # Script per Windows
│   │   ├── start.bat
│   │   ├── stop.bat
│   │   ├── logs.bat
│   │   └── crea-scorciatoie-desktop.bat
│   ├── unix/                         # Script per Mac/Linux
│   │   ├── start.sh
│   │   ├── stop.sh
│   │   ├── check.sh
│   │   └── crea-scorciatoie-desktop.sh
│   └── docker/                       # File Docker
│       ├── docker-compose.yml       # Sviluppo locale
│       ├── docker-compose.prod.yml  # Produzione
│       ├── Dockerfile.backend
│       ├── Dockerfile.frontend
│       └── nginx.conf
├── .env.example                     # Template variabili d'ambiente
├── QUICK-START.md                   # Guida avvio rapido
└── README.md
```

## 🗃️ Modelli di Dati Principali

### User (Utente)
- **Autenticazione**: Sistema completo con JWT e ASP.NET Identity
- **Profilo**: Avatar, bio, preferenze, impostazioni privacy
- **Social**: Sistema di amicizie, richieste, blocchi
- **Integrazione**: Collegamento account Steam opzionale

### Game (Gioco)
- **Metadati**: Titolo, sviluppatore, editore, anno, generi, piattaforma
- **Stato**: Backlog, In Corso, Completato, Abbandonato, Platino
- **Tracking**: Ore giocate, data completamento, valutazione metacritic
- **Review**: Sistema di recensioni personali con voti dettagliati
- **Media**: Cover image e informazioni visive

### 📊 Activity (Attività)
- Timeline automatica azioni utente
- Sistema reazioni e commenti
- Controlli privacy granulari

## 🚀 Deployment e Distribuzione

### Containerizzazione
L'applicazione è completamente containerizzata con Docker per garantire:
- **Consistenza** tra ambienti di sviluppo e produzione
- **Facilità di distribuzione** ai tuoi amici
- **Isolamento** delle dipendenze
- **Scalabilità** futura

### Architettura Deployment
```
Frontend (React + Nginx) ←→ Backend (.NET 8) ←→ Database (PostgreSQL Cloud)
     Container :3000           Container :5000        Supabase/Neon/Railway
```

### Database Cloud
Per la distribuzione si raccomanda un database PostgreSQL cloud:
- **Supabase** (raccomandato, free tier generoso)
- **Neon** (ottimo per sviluppo, veloce setup)  
- **Railway** (semplice deploy e gestione)

Questo permette a tutti i tuoi amici di condividere lo stesso database senza configurazioni complesse.

## ⚙️ Setup Rapido

**Per iniziare subito (3 passi):**
```bash
# 1. Prerequisiti
# - Installa Docker Desktop (https://docker.com/products/docker-desktop)
# - Avvialo e aspetta che sia completamente caricato

# 2. Clona il repository
git clone <repo-url>
cd videogames-backlog-webapp

# 3. Configura ambiente (OPZIONALE)
cp .env.example .env
# Modifica .env solo per API keys personali (Steam/RAWG)

# 4. Avvia l'applicazione
# Windows: .\deployment\windows\start.bat
# Mac/Linux: ./deployment/unix/start.sh
```

**L'app si aprirà automaticamente** su http://localhost:3000/landing

### 🚀 Avvio Intelligente
- **Prima volta**: Build automatica completa (5-10 minuti)
- **Volte successive**: Avvio rapido (30 secondi)
- **Auto-detecta** se serve ricostruire le immagini Docker
- **Browser automatico** si apre al termine

## 📁 File di Configurazione

### Configurazione Unica (`.env`)
Il file `.env` nella root del progetto contiene **tutte** le configurazioni necessarie.

**Per iniziare subito** (configurazione minima):
```bash
# Copia il file template
cp .env.example .env
```

Il file `.env` di default è già configurato per funzionare. **Personalizza solo se necessario**:

```env
# DATABASE (già configurato, personalizza solo se necessario)
DATABASE_URL=your_cloud_database_url_here

# API KEYS (opzionali - migliora l'esperienza)
STEAM_API_KEY=la_tua_chiave_steam
REACT_APP_RAWG_API_KEY=la_tua_chiave_rawg

# CONFIGURAZIONE PORTE (non modificare se non necessario)
BACKEND_PORT=5000
```

### 🎯 Database: Configurazione Intelligente
- **Sviluppo locale**: PostgreSQL automatico nei container Docker
- **Produzione/Condivisione**: Configura `DATABASE_URL` per database cloud
- **Primo avvio**: Funziona subito senza configurazioni!

### Cosa Succede Senza API Keys?

**✅ Funziona sempre perfettamente**:
- Gestione completa libreria giochi
- Sistema sociale e recensioni  
- Dashboard e statistiche
- Autenticazione e privacy
- Tutte le funzionalità core

**🔑 Con RAWG API Key**:
- Ricerca automatica giochi con copertine
- Informazioni dettagliate (generi, sviluppatori, etc.)
- Esperienza utente migliorata per l'aggiunta giochi

**🎮 Con Steam API Key**:
- Importazione automatica libreria Steam
- Sincronizzazione achievement (in sviluppo)

## 🚀 Avvio Applicazione

### Metodo Semplice (Raccomandato)

**Windows:**
```bash
cd deployment/windows
start.bat                           # Avvio diretto
crea-scorciatoie-desktop.bat       # Crea scorciatoie (una volta)
```

**Mac/Linux:**
```bash
cd deployment/unix
./start.sh                          # Avvio diretto  
./crea-scorciatoie-desktop.sh      # Crea scorciatoie (una volta)
```

### Accesso all'App
- **Frontend**: http://localhost:3000/landing
- **Backend API**: http://localhost:5000

**Per istruzioni dettagliate:** leggi [QUICK-START.md](./QUICK-START.md)

## 🛠️ Stack Tecnologico

### Frontend
- **React 19** + TypeScript per UI reattiva
- **Tailwind CSS** per styling moderno e responsive
- **Redux Toolkit** per gestione stato globale
- **React Router** per navigazione SPA

### Backend  
- **.NET 8** + ASP.NET Core per API REST
- **Entity Framework Core** per ORM e database
- **PostgreSQL** come database principale
- **JWT Bearer** per autenticazione sicura

### Integrazioni
- **Steam Web API** per importazione libreria
- **RAWG API** per database videogiochi
- **Docker** per containerizzazione

## 📊 Funzionalità Implementate

### 🎯 **Gestione Libreria**
- CRUD completo per gestione giochi personali
- Stati personalizzabili (Backlog, In Corso, Completato, etc.)
- Filtri avanzati e ricerca intelligente  
- Tracking ore di gioco e progressi
- Sistema recensioni e valutazioni

### 👥 **Sistema Social**
- Gestione amicizie con richieste/accettazioni
- Timeline attività con reazioni emoji
- Profili pubblici con controlli privacy
- Commenti e interazioni sociali

### 📈 **Dashboard e Analytics**
- Statistiche dettagliate libreria personale
- Grafici interattivi per distribuzioni
- Cronologia attività e progressi
- Insights su abitudini di gioco

### 🔐 **Autenticazione e Privacy**
- Sistema completo JWT + ASP.NET Identity
- Controlli privacy granulari
- Gestione profilo e preferenze
- Sicurezza HTTPS e protezione dati

## 📱 Design e UX

- **Design moderno** con dark/light mode
- **Mobile-first** completamente responsive  
- **Performance ottimizzate** con lazy loading
- **Animazioni fluide** e micro-interazioni
- **Accessibilità** WCAG compliant

---

## 🎮 Happy Gaming!

*Organizza, traccia e condividi la tua passione per i videogiochi*

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/Lanfarx/videogames-backlog-webapp)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://react.dev/)
[![.NET](https://img.shields.io/badge/.NET-8.0-purple.svg)](https://dotnet.microsoft.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://www.postgresql.org/)

</div>
