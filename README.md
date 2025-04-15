# 🎮 Backlog Videoludico 

**Backlog Videoludico** è un'applicazione web che permette agli utenti di gestire il proprio backlog di videogiochi.  
Questa repository contiene il **frontend** sviluppato in **React**, con un'interfaccia moderna, dark mode e componenti UI responsive.  
Il progetto è in fase di sviluppo e prevede l'integrazione con API esterne e un backend realizzato in .NET.

## 🚀 Funzionalità principali (in sviluppo)

- Visualizzazione della propria **libreria di giochi**
- Aggiunta, modifica e rimozione dei giochi dal backlog
- Filtri per **stato**, **piattaforma**, **genere**, **titolo**, ecc.
- Dashboard personale con **statistiche** sui giochi giocati
- Integrazione con **API videoludiche** (es. RAWG.io, Steam)
- Interfaccia responsive e supporto alla **dark mode**

## 🛠️ Tecnologie pianificate di utilizzo

- [React](https://react.dev/)
- [PrimeReact](https://primereact.org/) – libreria UI
- [Lucide](https://lucide.dev/) – icone SVG moderne
- [React Router DOM](https://reactrouter.com/) – routing
- [Axios](https://axios-http.com/) – chiamate API
- [SCSS](https://sass-lang.com/) – stili personalizzati

## 📁 Struttura del progetto

src/ ├── assets/ # Icone, immagini, temi ├── components/ # Componenti riutilizzabili (bottoni, card, ecc.) ├── pages/ # Pagine principali dell'app (Home, Libreria, ecc.) ├── services/ # Gestione chiamate API e interazioni esterne ├── utils/ # Funzioni di utilità e helpers ├── App.jsx # Componente root └── main.jsx # Punto di ingresso dell'app


## ▶️ Avvio del progetto

Assicurati di avere [Node.js](https://nodejs.org/) installato (versione consigliata: 18.x o superiore).

```bash
git clone https://github.com/Lanfarx/videogames-backlog-webapp.git
cd videogames-backlog-webapp
npm install
npm run dev

🔜 Integrazioni future
Backend in .NET con API REST

Salvataggio dati su database NoSQL o relazionale

Autenticazione utente con token JWT

Dashboard con dati sincronizzati lato server

📄 Licenza
Questo progetto è distribuito sotto licenza MIT.
Consulta il file LICENSE per maggiori informazioni.
