# 🎮 Frontend - Backlog Videoludico

Frontend React TypeScript per l'applicazione di gestione backlog videogiochi.

## 🚀 Avvio Rapido

**Per sviluppo locale, usa Docker (raccomandato):**
```bash
# Dalla root del progetto
cd deployment/windows    # o deployment/unix
start.bat                # o ./start.sh
```

**Per sviluppo frontend standalone:**
```bash
cd frontend
npm install
npm start
```

## 🛠️ Stack Tecnologico

### Core
- **[React 19.1.0](https://react.dev/)** - Framework UI reattivo
- **[TypeScript 4.9.5](https://www.typescriptlang.org/)** - Type safety
- **[Create React App 5.0.1](https://create-react-app.dev/)** - Build tool

### Styling & UI
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Lucide React](https://lucide.dev/)** - Icone moderne e minimali
- **[PostCSS](https://postcss.org/)** - Processore CSS avanzato

### State Management & Routing
- **[Redux Toolkit 2.8.2](https://redux-toolkit.js.org/)** - Gestione stato globale
- **[React Router DOM 7.5.2](https://reactrouter.com/)** - Routing SPA
- **[React Redux 9.2.0](https://react-redux.js.org/)** - Connessione React-Redux

### HTTP & Data
- **[Axios 1.9.0](https://axios-http.com/)** - Client HTTP per API

## 📁 Struttura del Progetto

```
frontend/
├── public/
│   ├── index.html              # Template HTML principale
│   ├── manifest.json           # PWA manifest
│   └── placeholder.svg         # Placeholder assets
├── src/
│   ├── components/             # Componenti riutilizzabili
│   ├── pages/                 # Pagine principali dell'app
│   ├── store/                 # Redux store e services
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions
│   ├── config/                # App configuration
│   ├── styles/                # CSS files
│   ├── App.tsx                # Root component
│   └── index.tsx              # Entry point
├── build/                     # Build output (generato)
├── package.json               # Dependencies e scripts
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
└── tsconfig.json              # TypeScript configuration
```

## 🔧 Script Disponibili

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
