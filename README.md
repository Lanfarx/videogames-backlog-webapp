# 🎮 Backlog Videoludico 

**Backlog Videoludico** è un'applicazione web completa che permette agli utenti di gestire il proprio backlog di videogiochi con funzionalità social integrate.  
Il progetto è composto da un **frontend** sviluppato in **React TypeScript** e un **backend** realizzato in **.NET 8**, offrendo un'esperienza utente moderna e completa per la gestione della propria libreria videoludica.

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
│   │   │   ├── auth/                # Componenti autenticazione
│   │   │   ├── dashboard/           # Grafici e statistiche
│   │   │   ├── friends/             # Sistema social
│   │   │   ├── game/                # Gestione giochi
│   │   │   ├── library/             # Vista libreria
│   │   │   ├── layout/              # Layout e navigazione
│   │   │   └── ui/                  # Componenti UI base
│   │   ├── pages/                   # Pagine principali
│   │   ├── store/                   # Redux store e slices
│   │   ├── services/                # API services
│   │   ├── types/                   # TypeScript definitions
│   │   ├── utils/                   # Utility functions
│   │   └── styles/                  # Stili globali
│   ├── package.json
│   └── tailwind.config.js
├── VideoGamesBacklogBackend/         # .NET 8 Backend
│   ├── Controllers/                 # API Controllers
│   ├── Models/                      # Entity Models
│   ├── Services/                    # Business Logic
│   ├── Data/                        # DbContext e configurazioni
│   ├── Dto/                         # Data Transfer Objects
│   ├── Interfaces/                  # Service interfaces
│   ├── Helpers/                     # Utility classes
│   ├── Migrations/                  # Database migrations
│   └── Program.cs                   # Entry point
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

### Activity (Attività)
- **Timeline**: Cronologia automatica delle azioni utente
- **Tipi**: Added, Started, Completed, Platnum, Rated
- **Social**: Reazioni emoji e commenti degli amici
- **Privacy**: Controllo visibilità per profili pubblici/privati

### Sistema Social
- **Friendship**: Gestione completa amicizie con stati
- **Notifications**: Sistema notifiche real-time
- **Community**: Recensioni pubbliche e interazioni

## ⚙️ Configurazione e Setup

### Prerequisiti
- **Node.js** 18.x o superiore
- **.NET 8 SDK**
- **PostgreSQL** 13+ 
- **Account Steam** (opzionale, per integrazione)
- **API Key RAWG** (per ricerca giochi automatica)

### Setup Frontend
```bash
cd frontend
npm install
npm start  # Avvia development server su http://localhost:3000
```

### Setup Backend
```bash
cd VideoGamesBacklogBackend
dotnet restore
dotnet ef database update  # Applica migrations al database
dotnet run  # Avvia API server su https://localhost:5001
```

### Configurazione Database
1. Installa PostgreSQL
2. Crea database `GameBacklogDb`
3. Aggiorna `appsettings.json` con le tue credenziali:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=GameBacklogDb;UserName=tuo_username;Password=tua_password"
  }
}
```

### Variabili d'Ambiente
Crea file `.env.local` nella root del backend:
```env
STEAM_API_KEY=tua_steam_api_key
RAWG_API_KEY=tua_rawg_api_key
JWT_SECRET_KEY=tua_chiave_segreta_jwt
```

## 📱 Caratteristiche dell'Interfaccia

### Design System
- **Color Scheme**: Palette personalizzata con supporto dark/light mode
- **Typography**: Font system con Montserrat e Roboto
- **Responsive**: Mobile-first design con breakpoints ottimizzati
- **Animations**: Transizioni fluide e micro-interazioni

### Componenti Principali
- **GameCard**: Visualizzazione giochi con hover effects e quick actions
- **Dashboard Charts**: Grafici interattivi per statistiche
- **Activity Timeline**: Feed sociale con reazioni e commenti
- **Search & Filter**: Sistema di ricerca avanzata con filtri multipli
- **Profile Management**: Gestione completa profilo e privacy

### Pagine Implementate
- **🏠 Home**: Dashboard personale con statistiche e attività recenti
- **📚 Library**: Gestione completa libreria con filtri e ricerca
- **📊 Dashboard**: Analisi dettagliate e grafici interattivi
- **🗂️ Catalog**: Esplorazione e ricerca nuovi giochi
- **👤 Profile**: Gestione profilo personale e impostazioni
- **👥 Friends**: Sistema sociale con gestione amicizie
- **⚙️ Settings**: Configurazioni app e privacy

## 🔒 Sicurezza e Privacy

### Autenticazione
- **JWT Tokens** con refresh automatico
- **Password hashing** con ASP.NET Identity
- **Rate limiting** su endpoint sensibili
- **HTTPS enforcement** in produzione

### Privacy Controls
- **Profilo privato/pubblico** con controlli granulari
- **Visibilità attività** configurabile per amici/pubblico
- **Gestione amicizie** con richieste e blocchi
- **Dati GDPR-compliant** con possibilità di export/cancellazione

## 🚀 Performance e Scalabilità

### Frontend Optimizations
- **Code splitting** automatico con React Router
- **Lazy loading** per componenti e immagini
- **Memoization** strategica per componenti complessi
- **Bundle optimization** con Webpack

### Backend Architecture
- **Repository Pattern** per data access layer
- **Service Layer** per business logic separation
- **Dependency Injection** nativo .NET
- **Entity Framework** con query optimization
- **Caching** strategico per dati statici

## 🧪 Testing e Quality Assurance

### Frontend Testing
- **Jest** per unit testing
- **React Testing Library** per component testing
- **TypeScript** per type safety
- **ESLint** per code quality

### Backend Testing
- **xUnit** per unit e integration tests
- **Entity Framework InMemory** per test database
- **Swagger** per API documentation e testing

## 📈 Roadmap e Sviluppi Futuri

### v2.0 Pianificato
- **🎮 Gaming Hub**: Integrazione con più piattaforme (Epic, Origin, GOG)
- **🏆 Achievement System**: Sistema trofei e obiettivi personalizzati
- **📱 Mobile App**: App nativa iOS/Android
- **🤖 AI Recommendations**: Suggerimenti personalizzati con ML
- **🎯 Wishlist Advanced**: Tracking prezzi e notifiche offerte
- **📊 Advanced Analytics**: Insights dettagliati su abitudini di gioco

### Funzionalità Community
- **👥 Gaming Groups**: Creazione gruppi tematici
- **🏅 Leaderboards**: Classifiche globali e tra amici
- **🎪 Events**: Organizzazione eventi gaming
- **💬 Chat Integration**: Messaggistica real-time

## ▶️ Avvio Rapido

### Quick Start con Docker (Coming Soon)
```bash
git clone https://github.com/Lanfarx/videogames-backlog-webapp.git
cd videogames-backlog-webapp
docker-compose up  # Avvia frontend + backend + database
```

### Avvio Manuale
```bash
# Frontend
cd frontend && npm install && npm start

# Backend (terminale separato)
cd VideoGamesBacklogBackend && dotnet restore && dotnet run
```

L'applicazione sarà disponibile su:
- **Frontend**: http://localhost:3000
- **Backend API**: https://localhost:5001
- **Swagger UI**: https://localhost:5001/swagger

## 🤝 Contributi

Il progetto è in sviluppo attivo. Per contribuire:

1. **Fork** del repository
2. **Crea branch** per la feature (`git checkout -b feature/amazing-feature`)
3. **Commit** delle modifiche (`git commit -m 'Add amazing feature'`)
4. **Push** del branch (`git push origin feature/amazing-feature`)
5. **Apri Pull Request**

### Linee Guida
- Segui le convenzioni di naming esistenti
- Aggiungi test per nuove funzionalità
- Aggiorna la documentazione se necessario
- Mantieni la compatibilità con l'API esistente

## 📄 Licenza

Questo progetto è distribuito sotto licenza **MIT**.  
Consulta il file [LICENSE](LICENSE) per maggiori informazioni.

## 📞 Supporto e Contatti

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/Lanfarx/videogames-backlog-webapp/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/Lanfarx/videogames-backlog-webapp/discussions)
- **📧 Contatto Diretto**: [Crea un Issue](https://github.com/Lanfarx/videogames-backlog-webapp/issues/new)

---

<div align="center">

**🎮 Happy Gaming! 🎮**

*Organizza, traccia e condividi la tua passione per i videogiochi con questo Backlog Videoludico*

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/Lanfarx/videogames-backlog-webapp)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://react.dev/)
[![.NET](https://img.shields.io/badge/.NET-8.0-purple.svg)](https://dotnet.microsoft.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://www.postgresql.org/)

</div>
