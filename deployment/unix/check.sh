#!/bin/bash
# Script per verificare la configurazione

echo "🔍 Verifica Configurazione Backlog Videoludico"
echo "=============================================="

# Verifica Docker
echo "📦 Verifica Docker..."
if docker --version > /dev/null 2>&1; then
    echo "✅ Docker installato: $(docker --version)"
else
    echo "❌ Docker non trovato. Installa Docker Desktop."
    exit 1
fi

if docker info > /dev/null 2>&1; then
    echo "✅ Docker in esecuzione"
else
    echo "❌ Docker non in esecuzione. Avvia Docker Desktop."
    exit 1
fi

# Verifica file .env
echo ""
echo "⚙️  Verifica configurazione..."
if [ -f "../.env" ]; then
    echo "✅ File .env trovato"
    
    # Controlla variabili obbligatorie
    if grep -q "DATABASE_URL=postgresql://" "../.env" && ! grep -q "username:password@host" "../.env"; then
        echo "✅ DATABASE_URL configurato"
    else
        echo "⚠️  DATABASE_URL non configurato correttamente"
    fi
    
    if grep -q "JWT_SECRET=" "../.env" && ! grep -q "your_super_secret" "../.env"; then
        echo "✅ JWT_SECRET configurato"
    else
        echo "⚠️  JWT_SECRET non configurato"
    fi
    
else
    echo "❌ File .env non trovato. Copia .env.example in .env"
    exit 1
fi

# Verifica file Docker
echo ""
echo "🐳 Verifica file Docker..."
files=("docker-compose.prod.yml" "Dockerfile.backend" "Dockerfile.frontend")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file trovato"
    else
        echo "❌ $file mancante"
    fi
done

echo ""
echo "🎯 Verifica completata!"
echo ""
echo "Se tutto è ✅, puoi avviare l'app con:"
echo "  ./start.sh    (Mac/Linux)"
echo "  start.bat     (Windows)"
