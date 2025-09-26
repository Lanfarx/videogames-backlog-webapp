using VideoGamesBacklogBackend.Models;
using VideoGamesBacklogBackend.Data;
using VideoGamesBacklogBackend.Helpers;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using VideoGamesBacklogBackend.Interfaces;
using System.Security.Claims;

namespace VideoGamesBacklogBackend.Services
{    public interface ISteamService
    {
        Task<List<SteamGame>> GetSteamGamesAsync(string steamId);
        Task<List<RecentlyPlayedGame>> GetRecentlyPlayedGamesAsync(string steamId);
        Task<SteamSyncResponse> SyncSteamGamesAsync(string steamId, string syncType, int userId);
    }

    public class SteamService : ISteamService
    {
        private readonly HttpClient _httpClient;
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IGameService _gameService;
        private readonly string _steamApiKey;         
        public SteamService(HttpClient httpClient, AppDbContext context, IConfiguration configuration, IGameService gameService)
        {
            _httpClient = httpClient;
            _context = context;
            _configuration = configuration;
            _gameService = gameService;
            // Prova prima dalla configurazione, poi dalle variabili ambiente
            _steamApiKey = _configuration["SteamApiKey"]
                          ?? Environment.GetEnvironmentVariable("STEAM_API_KEY")
                          ?? throw new ArgumentException("Steam API Key non configurata né in appsettings né in variabili ambiente");
        }        public async Task<List<SteamGame>> GetSteamGamesAsync(string steamId)
        {
            try
            {
                // Esclude esplicitamente i giochi free-to-play con include_played_free_games=0
                // e include_free_sub=0 per maggiore sicurezza
                var url = $"https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key={_steamApiKey}&steamid={steamId}&include_appinfo=1&include_played_free_games=0&include_free_sub=0";

                var response = await _httpClient.GetStringAsync(url);
                var steamResponse = JsonSerializer.Deserialize<SteamGamesResponse>(response, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return steamResponse?.response?.games ?? new List<SteamGame>();
            }
            catch (HttpRequestException ex) when (ex.Message.Contains("429"))
            {
                throw new Exception("Limite di richieste Steam raggiunto. Riprova tra qualche minuto. Steam ha dei limiti rigidi sulle chiamate API per prevenire abusi.");
            }
            catch (Exception ex)
            {
                throw new Exception($"Errore nel recupero dei giochi Steam: {ex.Message}");
            }
        }        public async Task<List<RecentlyPlayedGame>> GetRecentlyPlayedGamesAsync(string steamId)
        {
            try
            {
                var url = $"https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key={_steamApiKey}&steamid={steamId}&count=0";
                
                var response = await _httpClient.GetStringAsync(url);
                var steamResponse = JsonSerializer.Deserialize<RecentlyPlayedGamesResponse>(response, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return steamResponse?.response?.games ?? new List<RecentlyPlayedGame>();
            }
            catch (HttpRequestException ex) when (ex.Message.Contains("429"))
            {
                throw new Exception("Limite di richieste Steam raggiunto. Riprova tra qualche minuto. Steam ha dei limiti rigidi sulle chiamate API per prevenire abusi.");
            }
            catch (Exception ex)
            {
                throw new Exception($"Errore nel recupero dei giochi giocati di recente: {ex.Message}");
            }
        }        public async Task<SteamSyncResponse> SyncSteamGamesAsync(string steamId, string syncType, int userId)
        {
            try
            {
                var steamGames = await GetSteamGamesAsync(steamId);

                if (syncType == "initial_load")
                {
                    return await InitialLoadSteamGames(steamGames, userId);
                }
                else if (syncType == "update_hours")
                {
                    return await UpdateGameHours(steamGames, userId, steamId);
                }
                else
                {
                    throw new ArgumentException("Tipo di sincronizzazione non valido");
                }
            }
            catch (Exception ex) when (ex.Message.Contains("Limite di richieste Steam raggiunto"))
            {
                // Rilancia l'errore di rate limiting con un messaggio più chiaro
                throw new Exception("Steam API: troppe richieste. Riprova tra 5-10 minuti. Questo limite protegge i server Steam da sovraccarico.");
            }
            catch (Exception ex)
            {
                // Per altri errori, mantieni il messaggio originale
                throw;
            }
        }private async Task<SteamSyncResponse> InitialLoadSteamGames(List<SteamGame> steamGames, int userId)
        {
            var existingGames = await _context.Games
                .Where(g => g.UserId == userId)
                .Select(g => g.Title.ToLower())
                .ToListAsync();

            var newGamesCount = 0;
            var debugInfo = new List<string>();
            var gamesWithImages = 0;

            debugInfo.Add($"Steam games to process: {steamGames.Count}");
            debugInfo.Add($"Existing games in database: {existingGames.Count}");

            // Crea un ClaimsPrincipal per l'utente per usare il GameService
            var userClaims = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            }));

            foreach (var steamGame in steamGames)
            {
                var normalizedTitle = steamGame.name.ToLower();
                var hoursPlayed = (int)Math.Round(steamGame.playtime_forever / 60.0); 

                if (!existingGames.Contains(normalizedTitle))
                {
                    var game = new Game
                    {
                        Title = steamGame.name,
                        Platform = "Steam",
                        HoursPlayed = hoursPlayed, 
                        Status = hoursPlayed > 0 ? GameStatus.InProgress : GameStatus.NotStarted,
                        UserId = userId,
                        PurchaseDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                    };

                    // Usa GameService per aggiungere il gioco e creare automaticamente l'attività
                    await _gameService.AddGameAsync(userClaims, game);
                    newGamesCount++;
                }
            }

            debugInfo.Add($"New games added: {newGamesCount}");
            debugInfo.Add($"Games with cover images: {gamesWithImages}");

            return new SteamSyncResponse
            {
                Message = $"{newGamesCount} giochi aggiunti dalla libreria Steam ({gamesWithImages} con immagini)",
                Count = newGamesCount,
                UpdatedGames = new List<UpdatedGameInfo>(), // Nessun gioco aggiornato nell'initial load
                DebugInfo = string.Join("; ", debugInfo)
            };        }

        private async Task<SteamSyncResponse> UpdateGameHours(List<SteamGame> steamGames, int userId, string steamId)
        {
            var existingGames = await _context.Games
                .Where(g => g.UserId == userId && g.Platform == "Steam")
                .ToListAsync();

            // Aggiungi un delay per evitare rate limiting di Steam (max 100.000 richieste al giorno)
            await Task.Delay(1500); // 1.5 secondi di delay

            // Ottieni anche i giochi giocati di recente per la validazione
            var recentlyPlayedGames = await GetRecentlyPlayedGamesAsync(steamId); var updatedCount = 0;
            var statusChangedCount = 0;
            var newGamesAdded = 0;
            var matchedGames = new List<string>();
            var unmatched = new List<string>();
            var updatedGamesInfo = new List<UpdatedGameInfo>();
            var debugInfo = new List<string>();

            debugInfo.Add($"Steam games found: {steamGames.Count}");
            debugInfo.Add($"Recently played games found: {recentlyPlayedGames.Count}");
            debugInfo.Add($"Existing database games: {existingGames.Count}");
            
            // Debug specifico per capire se il gioco è presente nei dati Steam
            var chillquariumInSteam = steamGames.FirstOrDefault(g => g.name.ToLower().Contains("chillquarium"));
            if (chillquariumInSteam != null)
            {
                debugInfo.Add($"TROVATO nei Steam games: {chillquariumInSteam.name} (AppID: {chillquariumInSteam.appid}, Ore: {Math.Round(chillquariumInSteam.playtime_forever / 60.0)})");
            }
            
            var chillquariumInRecent = recentlyPlayedGames.FirstOrDefault(g => g.name.ToLower().Contains("chillquarium"));
            if (chillquariumInRecent != null)
            {
                debugInfo.Add($"TROVATO nei Recently Played: {chillquariumInRecent.name} (AppID: {chillquariumInRecent.appid}, Ore: {Math.Round(chillquariumInRecent.playtime_forever / 60.0)})");
            }
            
            var chillquariumInDB = existingGames.FirstOrDefault(g => g.Title.ToLower().Contains("chillquarium"));
            if (chillquariumInDB != null)
            {
                debugInfo.Add($"TROVATO nel DB: {chillquariumInDB.Title} (ID: {chillquariumInDB.Id}, Ore: {chillquariumInDB.HoursPlayed})");
            }
            else
            {
                debugInfo.Add("NON TROVATO nel database");
            }

            // Crea un ClaimsPrincipal per l'utente per usare il GameService
            var userClaims = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            }));

            // Elabora SOLO i giochi giocati di recente
            foreach (var recentGame in recentlyPlayedGames)
            {
                var existingGame = FindMatchingGame(existingGames, recentGame.name);
                
                if (existingGame != null)
                {
                    // Gioco già presente nel database - aggiorna le ore
                    var totalHours = (int)Math.Round(recentGame.playtime_forever / 60.0);
                    var recentHours = (int)Math.Round(recentGame.playtime_2weeks / 60.0);
                    var wasNotStarted = existingGame.Status == GameStatus.NotStarted;
                    
                    if (existingGame.HoursPlayed != totalHours)
                    {
                        var hoursDifference = totalHours - existingGame.HoursPlayed;
                        var previousHours = existingGame.HoursPlayed;
                        var previousStatus = existingGame.Status.ToString();

                        debugInfo.Add($"{recentGame.name}: Ore totali: {totalHours}, Incremento: {hoursDifference}h, Ore recenti: {recentHours}h");

                        var updatedGame = await _gameService.UpdateGamePlaytimeAsync(userClaims, existingGame.Id, totalHours);

                        if (updatedGame != null)
                        {
                            var statusChanged = wasNotStarted && totalHours > 0;
                            if (statusChanged)
                            {
                                statusChangedCount++;
                            }

                            // Aggiungi alle informazioni strutturate
                            updatedGamesInfo.Add(new UpdatedGameInfo
                            {
                                GameTitle = existingGame.Title,
                                PreviousHours = previousHours,
                                NewHours = totalHours,
                                HoursAdded = hoursDifference,
                                StatusChanged = statusChanged,
                                PreviousStatus = previousStatus,
                                NewStatus = updatedGame.Status.ToString()
                            });

                            updatedCount++;
                            matchedGames.Add($"{recentGame.name} -> {existingGame.Title} (Ore: {totalHours})" +
                                           (statusChanged ? " [STATO: Da iniziare → In corso]" : ""));
                        }
                    }
                    else
                    {
                        debugInfo.Add($"{recentGame.name} già aggiornato con le ore corrette: {totalHours}");
                        matchedGames.Add($"{recentGame.name} -> {existingGame.Title} (Ore: {totalHours}) [NESSUN CAMBIAMENTO]");
                    }
                }
                else
                {
                    // Gioco non presente nel database ma giocato di recente
                    var totalHours = (int)Math.Round(recentGame.playtime_forever / 60.0);
                    var recentHours = (int)Math.Round(recentGame.playtime_2weeks / 60.0);

                    // Euristica per determinare se è probabilmente free-to-play
                    var isProbablyFreeToPlay = (totalHours == 0 && recentHours > 0) || 
                                               (totalHours > 0 && totalHours < 1);

                    if (!isProbablyFreeToPlay)
                    {
                        debugInfo.Add($"{recentGame.name} (Owned/Family Share): Ore totali: {totalHours}, Ore recenti: {recentHours}h - AGGIUNTO");

                        try
                        {
                            var newGame = new Game
                            {
                                Title = recentGame.name,
                                Platform = "Steam",
                                HoursPlayed = totalHours,
                                Status = totalHours > 0 ? GameStatus.InProgress : GameStatus.NotStarted,
                                UserId = userId,
                                PurchaseDate = DateTime.UtcNow.ToString("yyyy-MM-dd")
                            };

                            var addedGame = await _gameService.AddGameAsync(userClaims, newGame);

                            if (addedGame != null)
                            {
                                newGamesAdded++;
                                debugInfo.Add($"{recentGame.name} AGGIUNTO CORRETTAMENTE con ID: {addedGame.Id}");

                                updatedGamesInfo.Add(new UpdatedGameInfo
                                {
                                    GameTitle = addedGame.Title,
                                    PreviousHours = 0,
                                    NewHours = totalHours,
                                    HoursAdded = totalHours,
                                    StatusChanged = totalHours > 0,
                                    PreviousStatus = "Non presente",
                                    NewStatus = addedGame.Status.ToString()
                                });

                                matchedGames.Add($"{recentGame.name} [NUOVO GIOCO AGGIUNTO] (Ore: {totalHours})" +
                                               (totalHours > 0 ? " [STATO: Nuovo → In corso]" : " [STATO: Nuovo → Da iniziare]"));
                            }
                            else
                            {
                                debugInfo.Add($"{recentGame.name} ERRORE: GameService ha restituito null");
                            }
                        }
                        catch (Exception ex)
                        {
                            debugInfo.Add($"{recentGame.name} ERRORE nell'aggiunta: {ex.Message}");
                        }
                    }
                    else
                    {
                        debugInfo.Add($"{recentGame.name} IGNORATO (probabilmente free-to-play): Ore totali: {totalHours}, Ore recenti: {recentHours}h");
                    }
                }
            }

            debugInfo.Add($"Recently played games processed: {recentlyPlayedGames.Count}");
            debugInfo.Add($"Games matched and updated: {updatedCount}");
            debugInfo.Add($"New recently played games added: {newGamesAdded}");
            debugInfo.Add($"Status changes (NotStarted → InProgress): {statusChangedCount}");
            debugInfo.Add("Only recently played games are processed - owned games ignored unless recently played");

            debugInfo.AddRange(matchedGames);

            var totalProcessed = updatedCount + newGamesAdded;
            var message = $"{updatedCount} giochi aggiornati con le ore di Steam";

            if (newGamesAdded > 0)
            {
                message += $", {newGamesAdded} nuovi giochi aggiunti dai recently played";
            }

            if (statusChangedCount > 0)
            {
                message += $" ({statusChangedCount} cambiati a 'In corso')";
            }

            return new SteamSyncResponse
            {
                Message = message,
                Count = totalProcessed,
                UpdatedGames = updatedGamesInfo,
                DebugInfo = string.Join("; ", debugInfo)
            };
        }        private Game? FindMatchingGame(List<Game> existingGames, string steamGameName)
        {
            return GameTitleMatcher.FindMatchingGame(existingGames, g => g.Title, steamGameName);
        }
    }
}
