# 🎮 Backend - Backlog Videoludico

Backend .NET 8 per l'applicazione di gestione backlog videogiochi.

## 🚀 Avvio Rapido

**Per sviluppo locale, usa Docker (raccomandato):**
```bash
# Dalla root del progetto
cd deployment/windows    # o deployment/unix
start.bat                # o ./start.sh
```

**Per sviluppo backend standalone:**
```bash
cd VideoGamesBacklogBackend
dotnet restore
dotnet run
```

## 🛠️ Stack Tecnologico

### Core Framework
- **[.NET 8](https://dotnet.microsoft.com/)** - Framework principale
- **[ASP.NET Core](https://docs.microsoft.com/aspnet/core)** - Web API framework
- **[C# 12](https://docs.microsoft.com/dotnet/csharp/)** - Linguaggio di programmazione

### Database & ORM
- **[Entity Framework Core](https://docs.microsoft.com/ef/core/)** - ORM per database
- **[PostgreSQL](https://www.postgresql.org/)** - Database principale
- **[Npgsql](https://www.npgsql.org/)** - Driver PostgreSQL per .NET

### Autenticazione & Sicurezza
- **[ASP.NET Core Identity](https://docs.microsoft.com/aspnet/core/security/authentication/identity)** - Sistema di identità
- **[JWT Bearer](https://jwt.io/)** - Token-based authentication
- **[Microsoft.IdentityModel.Tokens](https://www.nuget.org/packages/Microsoft.IdentityModel.Tokens/)** - JWT handling

### API & Documentation
- **[Swagger/OpenAPI](https://swagger.io/)** - Documentazione API automatica
- **[Swashbuckle.AspNetCore](https://github.com/domaindrivendev/Swashbuckle.AspNetCore)** - Swagger per .NET

### External Integrations
- **[Steam Web API](https://steamcommunity.com/dev)** - Integrazione Steam
- **[RAWG API](https://rawg.io/apidocs)** - Database videogiochi

## 📁 Struttura del Progetto

```
VideoGamesBacklogBackend/
├── Controllers/                # API Controllers
│   ├── AuthController.cs      # Autenticazione e registrazione
│   ├── GamesController.cs     # Gestione giochi
│   ├── ProfileController.cs   # Gestione profili utente
│   ├── FriendshipController.cs # Sistema amicizie
│   ├── ActivityController.cs  # Timeline attività
│   ├── WishlistController.cs  # Lista desideri
│   ├── SteamController.cs     # Integrazione Steam
│   └── HealthController.cs    # Health check endpoint
├── Models/                    # Entity Models
│   ├── User.cs               # Modello utente
│   ├── Game.cs               # Modello gioco
│   ├── UserGame.cs           # Relazione utente-gioco
│   ├── Friendship.cs         # Modello amicizia
│   ├── Activity.cs           # Modello attività
│   ├── GameReview.cs         # Recensioni giochi
│   └── Notification.cs       # Sistema notifiche
├── Services/                 # Business Logic
│   ├── AuthService.cs        # Logica autenticazione
│   ├── GameService.cs        # Logica gestione giochi
│   ├── ProfileService.cs     # Logica profili
│   ├── FriendshipService.cs  # Logica amicizie
│   ├── ActivityService.cs    # Logica timeline
│   ├── WishlistService.cs    # Logica wishlist
│   ├── NotificationService.cs # Logica notifiche
│   └── EmailService.cs       # Servizio email (futuro)
├── Data/                     # Database Context
│   └── AppDbContext.cs       # Entity Framework DbContext
├── Dto/                      # Data Transfer Objects
│   ├── GameDto.cs            # DTO per giochi
│   ├── UserDto.cs            # DTO per utenti
│   ├── ActivityDto.cs        # DTO per attività
│   └── PaginatedGamesDto.cs  # DTO per paginazione
├── Interfaces/               # Service Interfaces
│   ├── IAuthService.cs       # Interface autenticazione
│   ├── IGameService.cs       # Interface giochi
│   ├── IProfileService.cs    # Interface profili
│   └── IActivityService.cs   # Interface attività
├── Helpers/                  # Utility Classes
│   ├── JwtSettings.cs        # Configurazione JWT
│   ├── EmailSettings.cs      # Configurazione email
│   └── GameTitleMatcher.cs   # Utility matching titoli
├── Migrations/               # Database Migrations
│   └── [timestamp]_*.cs      # Migration files
├── Properties/               # Project Properties
├── Program.cs                # Entry point e configurazione
├── appsettings.json          # Configurazione base
└── *.csproj                  # Project file
```

## ⚙️ Configurazione

### Variabili d'Ambiente
Il backend legge configurazioni dal file `.env` nella root del progetto:

```env
# Database (obbligatorio per produzione)
DATABASE_URL=your_postgresql_connection_string

# API Keys (opzionali)
STEAM_API_KEY=your_steam_api_key

# JWT (automatico se non specificato)
JWT_SECRET=auto_generated_secret
JWT_ISSUER=BacklogVideoludico
JWT_AUDIENCE=BacklogVideoludico

# Email (futuro)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email
EMAIL_PASSWORD=your_password
```

### Database Connection
#### Sviluppo Locale
```json
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=videogamesbacklog;Username=postgres;Password=postgres"
  }
}
```

#### Produzione (Database Cloud)
```env
# .env
DATABASE_URL=Host=your-host.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=your-password;SSL Mode=Require
```

## 🔧 Comandi Disponibili

### Sviluppo
```bash
dotnet restore                 # Ripristina dipendenze NuGet
dotnet build                   # Compila il progetto
dotnet run                     # Avvia il server (porta 5000)
dotnet watch run               # Avvia con hot reload
```

### Database
```bash
dotnet ef migrations add <MigrationName>     # Crea nuova migration
dotnet ef database update                    # Applica migrations
dotnet ef migrations list                    # Lista migrations
dotnet ef database drop                      # Elimina database (attenzione!)
```

### Testing
```bash
dotnet test                    # Esegue test suite (futuro)
dotnet test --coverage         # Test con coverage (futuro)
```

### Package Management
```bash
dotnet add package <PackageName>             # Aggiunge pacchetto NuGet
dotnet remove package <PackageName>          # Rimuove pacchetto NuGet
dotnet list package                          # Lista pacchetti installati
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Registrazione utente
- `POST /api/auth/login` - Login utente
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout utente

### Games Management
- `GET /api/games` - Lista giochi utente (con filtri)
- `POST /api/games` - Aggiunge nuovo gioco
- `PUT /api/games/{id}` - Aggiorna gioco esistente
- `DELETE /api/games/{id}` - Rimuove gioco
- `GET /api/games/{id}` - Dettagli gioco specifico
- `PUT /api/games/{id}/status` - Aggiorna stato gioco
- `PUT /api/games/{id}/playtime` - Aggiorna ore di gioco
- `PUT /api/games/{id}/review` - Aggiunge/aggiorna recensione

### Social Features
- `GET /api/users/profile` - Profilo utente corrente
- `PUT /api/users/profile` - Aggiorna profilo
- `GET /api/users/{id}/profile` - Profilo utente pubblico
- `POST /api/friendships/request` - Invia richiesta amicizia
- `PUT /api/friendships/{id}/accept` - Accetta richiesta amicizia
- `DELETE /api/friendships/{id}` - Rimuove amicizia
- `GET /api/activities` - Timeline attività
- `POST /api/activities/{id}/react` - Reagisce ad attività

### Steam Integration
- `POST /api/steam/import` - Importa libreria Steam
- `GET /api/steam/profile/{steamId}` - Info profilo Steam
- `POST /api/steam/connect` - Collega account Steam

### System
- `GET /api/health` - Health check endpoint
- `GET /swagger` - Documentazione API interattiva

## 🗃️ Modelli di Dati

### User (Utente)
```csharp
public class User : IdentityUser
{
    public string DisplayName { get; set; }
    public string Bio { get; set; }
    public string AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsPublic { get; set; }
    public string SteamId { get; set; }
    
    // Navigation properties
    public ICollection<UserGame> UserGames { get; set; }
    public ICollection<Friendship> SentFriendships { get; set; }
    public ICollection<Friendship> ReceivedFriendships { get; set; }
}
```

### Game (Gioco)
```csharp
public class Game
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string CoverImageUrl { get; set; }
    public string Developer { get; set; }
    public string Publisher { get; set; }
    public DateTime? ReleaseDate { get; set; }
    public string Platform { get; set; }
    public string Genres { get; set; }
    public int? RawgGameId { get; set; }
    public int? SteamAppId { get; set; }
    
    // Navigation properties
    public ICollection<UserGame> UserGames { get; set; }
}
```

### UserGame (Relazione Utente-Gioco)
```csharp
public class UserGame
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public int GameId { get; set; }
    public GameStatus Status { get; set; }  // Backlog, InProgress, Completed, etc.
    public int? PlaytimeHours { get; set; }
    public int? Rating { get; set; }  // 1-10
    public string Notes { get; set; }
    public DateTime AddedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    
    // Navigation properties
    public User User { get; set; }
    public Game Game { get; set; }
}
```

### GameStatus (Enum)
```csharp
public enum GameStatus
{
    Backlog = 0,      // Da giocare
    InProgress = 1,   // In corso
    Completed = 2,    // Completato
    Dropped = 3,      // Abbandonato
    Platinum = 4,     // Platino/100%
    OnHold = 5        // In pausa
}
```

## 🔐 Autenticazione & Autorizzazione

### JWT Configuration
```csharp
// Program.cs
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret))
        };
    });
```

### Authorization Policies
```csharp
// Protecting endpoints
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    // Solo utenti autenticati possono accedere
}
```

## 🌐 CORS Configuration

```csharp
// Program.cs
services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")  // Frontend React
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

## 📊 Logging e Monitoring

### Structured Logging
```csharp
// Configurazione logging
services.AddLogging(builder =>
{
    builder.AddConsole();
    builder.AddDebug();
});
```

### Health Checks
```csharp
// Health check endpoint
[HttpGet("health")]
public IActionResult Health()
{
    return Ok(new { 
        Status = "OK", 
        Timestamp = DateTime.UtcNow,
        Version = "1.0.0" 
    });
}
```

## 🔧 Sviluppo e Debug

### Development Tools
- **Visual Studio 2022** o **Visual Studio Code** con C# extension
- **Postman** o **Insomnia** per test API
- **pgAdmin** per gestione database PostgreSQL

### Hot Reload
```bash
dotnet watch run               # Auto-restart su modifiche file
```

### Swagger UI
Durante lo sviluppo, accedi alla documentazione API interattiva:
- **URL**: http://localhost:5000/swagger
- **Features**: Test endpoint, schema documentation, try-it-out

## 🐳 Containerizzazione

### Dockerfile
```dockerfile
# deployment/docker/Dockerfile.backend
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY VideoGamesBacklogBackend/ .
RUN dotnet restore
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "VideoGamesBacklogBackend.dll"]
```

### Docker Compose
Il backend è configurato per funzionare con Docker Compose:
```yaml
# deployment/docker/docker-compose.prod.yml
services:
  backend:
    build:
      context: ../..
      dockerfile: deployment/docker/Dockerfile.backend
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SteamApiKey=${STEAM_API_KEY}
    ports:
      - "5000:80"
```

## 🧪 Testing (Futuro)

### Framework di Test
- **xUnit** - Framework di test principale
- **Moq** - Mocking framework
- **FluentAssertions** - Assertion library avanzata

### Tipologie di Test
- **Unit Tests** - Test singole unità di codice
- **Integration Tests** - Test integrazione componenti
- **API Tests** - Test endpoint API

## 🚀 Performance e Scalabilità

### Ottimizzazioni Implementate
- **Entity Framework Query Optimization** - Include/Select ottimizzati
- **Async/Await Pattern** - Operazioni non-bloccanti
- **Connection Pooling** - Pool connessioni database
- **Response Caching** - Cache header appropriati

### Metriche
- **Response Time**: < 200ms per endpoint semplici
- **Database Queries**: Ottimizzate con Include appropriati
- **Memory Usage**: Monitoraggio heap e GC

## 🔗 Integrazioni External API

### Steam Web API
```csharp
public async Task<SteamLibraryResponse> GetSteamLibraryAsync(string steamId)
{
    var url = $"https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/";
    var response = await httpClient.GetAsync($"{url}?key={steamApiKey}&steamid={steamId}&include_appinfo=1");
    return await response.Content.ReadFromJsonAsync<SteamLibraryResponse>();
}
```

### RAWG API Integration
```csharp
public async Task<RawgGameResponse> SearchGamesAsync(string query)
{
    var url = $"https://api.rawg.io/api/games";
    var response = await httpClient.GetAsync($"{url}?key={rawgApiKey}&search={query}");
    return await response.Content.ReadFromJsonAsync<RawgGameResponse>();
}
```

## 🛡️ Sicurezza

### Implementazioni di Sicurezza
- **HTTPS Enforcement** - Redirect automatico a HTTPS
- **JWT Token Validation** - Validazione rigorosa token
- **Input Validation** - Validazione input con Data Annotations
- **SQL Injection Protection** - Entity Framework protegge automaticamente
- **CORS Policy** - Configurazione restrittiva per frontend

### Data Protection
```csharp
// Hashing password con ASP.NET Identity
services.AddDefaultIdentity<User>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
});
```

---

## 🆘 Supporto Sviluppo

Per problemi di sviluppo backend:

1. **Verifica .NET SDK**: `dotnet --version` (richiede .NET 8+)
2. **Database connectivity**: Controlla connection string in `.env`
3. **API logs**: Controlla console output per errori
4. **Swagger docs**: Usa http://localhost:5000/swagger per test API

**Happy coding! 🚀**
