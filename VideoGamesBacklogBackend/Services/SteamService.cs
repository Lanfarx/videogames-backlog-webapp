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
        }     
           public async Task<List<SteamGame>> GetSteamGamesAsync(string steamId)
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
            catch (Exception ex)
            {
                throw new Exception($"Errore nel recupero dei giochi Steam: {ex.Message}");
            }
        }

        public async Task<List<RecentlyPlayedGame>> GetRecentlyPlayedGamesAsync(string steamId)
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
            catch (Exception ex)
            {
                throw new Exception($"Errore nel recupero dei giochi giocati di recente: {ex.Message}");
            }
        }     
        public async Task<SteamSyncResponse> SyncSteamGamesAsync(string steamId, string syncType, int userId)
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
        }        private async Task<SteamSyncResponse> InitialLoadSteamGames(List<SteamGame> steamGames, int userId)
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
            };
        }private async Task<SteamSyncResponse> UpdateGameHours(List<SteamGame> steamGames, int userId, string steamId)
        {
            var existingGames = await _context.Games
                .Where(g => g.UserId == userId && g.Platform == "Steam")
                .ToListAsync();

            // Ottieni anche i giochi giocati di recente per la validazione
            var recentlyPlayedGames = await GetRecentlyPlayedGamesAsync(steamId);            var updatedCount = 0;
            var statusChangedCount = 0;
            var newGamesAdded = 0;
            var matchedGames = new List<string>();
            var unmatched = new List<string>();
            var updatedGamesInfo = new List<UpdatedGameInfo>();
            var debugInfo = new List<string>();

            debugInfo.Add($"Steam games found: {steamGames.Count}");
            debugInfo.Add($"Recently played games found: {recentlyPlayedGames.Count}");
            debugInfo.Add($"Existing database games: {existingGames.Count}");

            // Crea un ClaimsPrincipal per l'utente per usare il GameService
            var userClaims = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            }));

            // Prima elabora i giochi posseduti (owned games)
            foreach (var steamGame in steamGames)
            {
                var existingGame = FindMatchingGame(existingGames, steamGame.name);

                if (existingGame != null)
                {
                    var newHours = (int)Math.Round(steamGame.playtime_forever / 60.0);
                    var wasNotStarted = existingGame.Status == GameStatus.NotStarted;                  if (existingGame.HoursPlayed != newHours)
                    {
                        // Informazioni di debug sui giochi recenti (solo per logging)
                        var recentGame = recentlyPlayedGames.FirstOrDefault(rg => rg.appid == steamGame.appid);
                        var hoursDifference = newHours - existingGame.HoursPlayed;
                        var recentHours = recentGame != null ? (int)Math.Round(recentGame.playtime_2weeks / 60.0) : 0;
                        var previousHours = existingGame.HoursPlayed;
                        var previousStatus = existingGame.Status.ToString();

                        if (recentGame != null)
                        {
                            debugInfo.Add($"{steamGame.name}: Ore totali: {newHours}, Incremento: {hoursDifference}h, Ultime 2 settimane: {recentHours}h");
                        }
                        else
                        {
                            debugInfo.Add($"{steamGame.name}: Ore totali: {newHours}, Incremento: {hoursDifference}h (non presente nei recenti)");
                        }

                        // Usa il GameService che gestisce automaticamente controlli di stato e attività
                        // Non impostare prezzi automaticamente per i giochi Steam
                        var updatedGame = await _gameService.UpdateGamePlaytimeAsync(userClaims, existingGame.Id, newHours);
                        
                        if (updatedGame != null)
                        {
                            // Controlla se lo stato è cambiato
                            var statusChanged = wasNotStarted && newHours > 0;
                            if (statusChanged)
                            {
                                statusChangedCount++;
                            }

                            // Aggiungi alle informazioni strutturate
                            updatedGamesInfo.Add(new UpdatedGameInfo
                            {
                                GameTitle = existingGame.Title,
                                PreviousHours = previousHours,
                                NewHours = newHours,
                                HoursAdded = hoursDifference,
                                StatusChanged = statusChanged,
                                PreviousStatus = previousStatus,
                                NewStatus = updatedGame.Status.ToString()
                            });
                            
                            updatedCount++;
                        }
                    }
                    
                    matchedGames.Add($"{steamGame.name} -> {existingGame.Title} (Ore: {newHours})" + 
                                   (wasNotStarted && newHours > 0 ? " [STATO: Da iniziare → In corso]" : ""));
                }
                else
                {
                    unmatched.Add(steamGame.name);
                }
            }

            // Poi elabora i giochi giocati di recente che potrebbero non essere nei posseduti
            foreach (var recentGame in recentlyPlayedGames)
            {
                // Verifica se questo gioco è già stato elaborato nei posseduti
                var alreadyProcessed = steamGames.Any(sg => sg.appid == recentGame.appid);
                
                if (!alreadyProcessed)
                {
                    var existingGame = FindMatchingGame(existingGames, recentGame.name);
                      if (existingGame != null)
                    {
                        var totalHours = (int)Math.Round(recentGame.playtime_forever / 60.0);
                        var recentHours = (int)Math.Round(recentGame.playtime_2weeks / 60.0);
                        var wasNotStarted = existingGame.Status == GameStatus.NotStarted;
                          if (existingGame.HoursPlayed != totalHours)
                        {
                            var hoursDifference = totalHours - existingGame.HoursPlayed;
                            var previousHours = existingGame.HoursPlayed;
                            var previousStatus = existingGame.Status.ToString();
                            
                            debugInfo.Add($"{recentGame.name} (Solo Recent): Ore totali: {totalHours}, Ore recenti: {recentHours}h");
                            
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
                                matchedGames.Add($"{recentGame.name} -> {existingGame.Title} (Ore: {totalHours}) [RECENT ONLY]" + 
                                               (statusChanged ? " [STATO: Da iniziare → In corso]" : ""));
                            }
                        }
                    }                    else
                    {
                        // Gioco non presente nel database ma giocato di recente
                        // Lo aggiungiamo automaticamente usando GameService
                        var totalHours = (int)Math.Round(recentGame.playtime_forever / 60.0);
                        var recentHours = (int)Math.Round(recentGame.playtime_2weeks / 60.0);
                        
                        debugInfo.Add($"{recentGame.name} (Nuovo da Recent): Ore totali: {totalHours}, Ore recenti: {recentHours}h - AGGIUNTO");
                          
                        var newGame = new Game
                        {
                            Title = recentGame.name,
                            Platform = "Steam",
                            HoursPlayed = totalHours,
                            Status = totalHours > 0 ? GameStatus.InProgress : GameStatus.NotStarted,
                            UserId = userId,
                            PurchaseDate = DateTime.UtcNow.ToString("yyyy-MM-dd")
                        };

                        // Usa GameService per aggiungere il gioco e creare automaticamente l'attività
                        var addedGame = await _gameService.AddGameAsync(userClaims, newGame);

                        newGamesAdded++;
                        
                        // Aggiungi alle informazioni strutturate
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
                }
            }            debugInfo.Add($"Games matched and updated: {updatedCount}");
            debugInfo.Add($"New games added from recently played: {newGamesAdded}");
            debugInfo.Add($"Status changes (NotStarted → InProgress): {statusChangedCount}");
            debugInfo.Add($"Unmatched games: {unmatched.Count}");
            
            if (unmatched.Any())
            {
                debugInfo.Add("UNMATCHED GAMES:");
                debugInfo.AddRange(unmatched.Take(10)); // Mostra solo i primi 10 per evitare troppo output
                if (unmatched.Count > 10)
                {
                    debugInfo.Add($"... e altri {unmatched.Count - 10} giochi non trovati");
                }
            }
            
            debugInfo.AddRange(matchedGames);            var totalProcessed = updatedCount + newGamesAdded;
            var message = $"{updatedCount} giochi aggiornati con le ore di Steam";
            
            if (newGamesAdded > 0)
            {
                message += $", {newGamesAdded} nuovi giochi aggiunti";
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
