# 🐳 Deployment Scripts

Script per gestire facilmente il deployment dell'applicazione.

## � Struttura Organizzata

```
deployment/
├── windows/          # Script e scorciatoie per Windows
│   ├── start.bat
│   ├── start.ps1
│   ├── stop.bat
│   ├── stop.ps1
│   ├── logs.bat
│   └── crea-scorciatoie-desktop.bat
├── unix/             # Script per Mac/Linux
│   ├── start.sh
│   ├── stop.sh
│   ├── check.sh
│   └── crea-scorciatoie-desktop.sh
└── docker/           # File Docker
    ├── docker-compose.yml
    ├── docker-compose.prod.yml
    ├── Dockerfile.backend
    ├── Dockerfile.frontend
    ├── nginx.conf
    └── .dockerignore
```

## �🚀 Avvio Rapido

### 🖥️ SCORCIATOIE DESKTOP (Windows)
**Metodo più semplice per Windows:**

1. **Prima configurazione (una volta sola):**
   ```bash
   cd windows
   crea-scorciatoie-desktop.bat
   ```

2. **Utilizzo quotidiano:**
   - Fai doppio click su **"GameBacklog - Avvia"** sul desktop
   - L'app si avvia automaticamente e si apre nel browser
   - Per fermare: doppio click su **"GameBacklog - Ferma"**

### 🍎🐧 SCORCIATOIE DESKTOP (Mac/Linux)
**Metodo più semplice per Mac/Linux:**

1. **Prima configurazione (una volta sola):**
   ```bash
   cd unix
   chmod +x crea-scorciatoie-desktop.sh
   ./crea-scorciatoie-desktop.sh
   ```

2. **Utilizzo quotidiano:**
   - Doppio click su **"GameBacklog - Avvia"** sul desktop
   - L'app si avvia automaticamente e si apre nel browser
   - Per fermare: doppio click su **"GameBacklog - Ferma"**

### 📂 METODO MANUALE

### Windows
```powershell
cd windows
start.bat          # Semplice (raccomandato)
start.ps1          # Con più informazioni
```

### Mac/Linux
```bash
cd unix
chmod +x *.sh      # Solo la prima volta
./start.sh
```

## 🔍 Verifica Configurazione

Prima del primo avvio, verifica che tutto sia configurato:

### Mac/Linux
```bash
cd unix
./check.sh
```

### Windows
Controlla manualmente:
1. Docker Desktop avviato
2. File `.env` configurato nella cartella principale
3. Database cloud attivo

## 🛑 Fermare l'App

### Windows
```powershell
cd windows
stop.bat
# oppure
stop.ps1
```

### Mac/Linux
```bash
cd unix
./stop.sh
```

## 📋 Vedere i Log

### Windows
```powershell
cd windows
logs.bat
```

### Mac/Linux
```bash
cd unix
./start.sh --logs
```

## 📁 File di Configurazione

- `docker/docker-compose.yml` - Sviluppo locale con database PostgreSQL
- `docker/docker-compose.prod.yml` - Produzione con database cloud
- `docker/Dockerfile.backend` - Immagine Docker per .NET backend
- `docker/Dockerfile.frontend` - Immagine Docker per React frontend
- `docker/nginx.conf` - Configurazione web server per frontend

## 🔧 Comandi Manuali

### Build e Avvio
```bash
docker-compose -f docker/docker-compose.prod.yml up -d --build
```

### Vedere i Log
```bash
docker-compose -f docker/docker-compose.prod.yml logs -f
```

### Riavvio Completo
```bash
docker-compose -f docker/docker-compose.prod.yml down
docker-compose -f docker/docker-compose.prod.yml up -d --build
```

### Pulizia Sistema
```bash
docker system prune -a
```

## ⚠️ Prerequisiti

1. **Docker Desktop** installato e avviato
2. **File .env** configurato nella cartella principale
3. **Database cloud** configurato (Supabase/Neon/Railway)

Vedi [QUICK-START.md](../QUICK-START.md) per istruzioni dettagliate.
