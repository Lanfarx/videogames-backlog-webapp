using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using VideoGamesBacklogBackend.Common.Configuration;
using VideoGamesBacklogBackend.DTOs.Games;
using VideoGamesBacklogBackend.DTOs.Steam;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.Infrastructure.Data;
using VideoGamesBacklogBackend.Interfaces.Games;
using VideoGamesBacklogBackend.Interfaces.Steam;
using GameTitleMatcher = VideoGamesBacklogBackend.Common.Helpers.GameTitleMatcher;

namespace VideoGamesBacklogBackend.Services.Steam
{
    public class SteamService(
        HttpClient httpClient,
        AppDbContext context,
        IOptions<SteamSettings> steamSettings,
        IGameService gameService,
        ILogger<SteamService> logger)
        : ISteamService
    {
        private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

        private readonly string _steamApiKey = steamSettings.Value.ApiKey;

        public async Task<List<SteamGame>> GetSteamGamesAsync(string steamId) =>
            await CallSteamApiAsync<SteamGamesResponse, List<SteamGame>>(
                "GetOwnedGames",
                steamId,
                "include_appinfo=1&include_played_free_games=0&include_free_sub=0",
                r => r?.response?.games ?? []);

        public async Task<List<RecentlyPlayedGame>> GetRecentlyPlayedGamesAsync(string steamId) =>
            await CallSteamApiAsync<RecentlyPlayedGamesResponse, List<RecentlyPlayedGame>>(
                "GetRecentlyPlayedGames",
                steamId,
                "count=0",
                r => r?.response?.games ?? []);

        public async Task<SteamSyncResponse> SyncSteamGamesAsync(string steamId, string syncType, int userId)
        {
            try
            {
                var steamGames = await GetSteamGamesAsync(steamId);

                return syncType switch
                {
                    "initial_load" => await InitialLoadSteamGames(steamGames, userId),
                    "update_hours" => await UpdateGameHours(steamGames, userId, steamId),
                    _ => throw new ArgumentException("Tipo di sincronizzazione non valido")
                };
            }
            catch (Exception ex) when (ex.Message.Contains("Limite di richieste Steam raggiunto"))
            {
                throw new Exception(
                    "Steam API: troppe richieste. Riprova tra 5-10 minuti. Questo limite protegge i server Steam da sovraccarico.");
            }
        }

        private async Task<SteamSyncResponse> InitialLoadSteamGames(List<SteamGame> steamGames, int userId)
        {
            var existingGames = await context.Games
                .Where(g => g.UserId == userId)
                .Select(g => g.Title.ToLower())
                .ToListAsync();

            var newGamesCount = 0;
            var debugInfo = new List<string>();
            const int gamesWithImages = 0;

            debugInfo.Add($"Steam games to process: {steamGames.Count}");
            debugInfo.Add($"Existing games in database: {existingGames.Count}");

            foreach (var game in from steamGame in steamGames
                     let normalizedTitle = steamGame.name.ToLower()
                     let hoursPlayed = (int)Math.Round(steamGame.playtime_forever / 60.0)
                     where !existingGames.Contains(normalizedTitle)
                     select new CreateGameDto
                     {
                         Title = steamGame.name,
                         Platform = "Steam",
                         HoursPlayed = hoursPlayed,
                         Status = hoursPlayed > 0 ? "InProgress" : "NotStarted",
                         PurchaseDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                     })
            {
                await gameService.AddGameAsync(userId, game);
                newGamesCount++;
            }

            debugInfo.Add($"New games added: {newGamesCount}");
            debugInfo.Add($"Games with cover images: {gamesWithImages}");

            return new SteamSyncResponse
            {
                Message = $"{newGamesCount} giochi aggiunti dalla libreria Steam ({gamesWithImages} con immagini)",
                Count = newGamesCount,
                UpdatedGames = [],
                DebugInfo = string.Join("; ", debugInfo)
            };
        }

        private async Task<SteamSyncResponse> UpdateGameHours(List<SteamGame> steamGames, int userId, string steamId)
        {
            var existingGames = await context.Games
                .Where(g => g.UserId == userId && g.Platform == "Steam")
                .ToListAsync();

            // Delay per evitare rate limiting di Steam
            await Task.Delay(1500);

            var recentlyPlayedGames = await GetRecentlyPlayedGamesAsync(steamId);
            var updatedCount = 0;
            var statusChangedCount = 0;
            var newGamesAdded = 0;
            var matchedGames = new List<string>();
            var updatedGamesInfo = new List<UpdatedGameInfo>();
            var debugInfo = new List<string>
            {
                $"Steam games found: {steamGames.Count}",
                $"Recently played games found: {recentlyPlayedGames.Count}",
                $"Existing database games: {existingGames.Count}"
            };

            // Elabora SOLO i giochi giocati di recente
            foreach (var recentGame in recentlyPlayedGames)
            {
                var existingGame = GameTitleMatcher.FindMatchingGame(existingGames, g => g.Title, recentGame.name);

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

                        debugInfo.Add(
                            $"{recentGame.name}: Ore totali: {totalHours}, Incremento: {hoursDifference}h, Ore recenti: {recentHours}h");

                        var updatedGame =
                            await gameService.UpdateGamePlaytimeAsync(userId, existingGame.Id, totalHours);

                        if (updatedGame == null) continue;
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
                    else
                    {
                        debugInfo.Add($"{recentGame.name} già aggiornato con le ore corrette: {totalHours}");
                        matchedGames.Add(
                            $"{recentGame.name} -> {existingGame.Title} (Ore: {totalHours}) [NESSUN CAMBIAMENTO]");
                    }
                }
                else
                {
                    // Gioco non presente nel database ma giocato di recente
                    var totalHours = (int)Math.Round(recentGame.playtime_forever / 60.0);
                    var recentHours = (int)Math.Round(recentGame.playtime_2weeks / 60.0);

                    // Euristica per determinare se è probabilmente free-to-play
                    var isProbablyFreeToPlay = (totalHours == 0 && recentHours > 0);

                    if (!isProbablyFreeToPlay)
                    {
                        debugInfo.Add(
                            $"{recentGame.name} (Owned/Family Share): Ore totali: {totalHours}, Ore recenti: {recentHours}h - AGGIUNTO");

                        try
                        {
                            var newGame = new CreateGameDto
                            {
                                Title = recentGame.name,
                                Platform = "Steam",
                                HoursPlayed = totalHours,
                                Status = totalHours > 0 ? "InProgress" : "NotStarted",
                                PurchaseDate = DateTime.UtcNow.ToString("yyyy-MM-dd")
                            };

                            var addedGame = await gameService.AddGameAsync(userId, newGame);

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
                                             (totalHours > 0
                                                 ? " [STATO: Nuovo → In corso]"
                                                 : " [STATO: Nuovo → Da iniziare]"));
                        }
                        catch (Exception ex)
                        {
                            logger.LogWarning(ex, "Errore nell'aggiunta del gioco Steam {GameName}", recentGame.name);
                            debugInfo.Add($"{recentGame.name} ERRORE nell'aggiunta: {ex.Message}");
                        }
                    }
                    else
                    {
                        debugInfo.Add(
                            $"{recentGame.name} IGNORATO (probabilmente free-to-play): Ore totali: {totalHours}, Ore recenti: {recentHours}h");
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
        }

        /// <summary>
        /// Costruisce l'URL e invoca la Steam API.
        /// </summary>
        private async Task<TResult> CallSteamApiAsync<TResponse, TResult>(
            string method, string steamId, string extraParams, Func<TResponse?, TResult> extractor)
        {
            var url = $"https://api.steampowered.com/IPlayerService/{method}/v1/?key={_steamApiKey}&steamid={steamId}&{extraParams}";
            return await FetchSteamApiAsync(url, extractor);
        }

        /// <summary>
        /// Centralizza le chiamate HTTP alla Steam API con gestione errori e rate limiting.
        /// </summary>
        private async Task<TResult> FetchSteamApiAsync<TResponse, TResult>(
            string url, Func<TResponse?, TResult> extractor)
        {
            try
            {
                var response = await httpClient.GetStringAsync(url);
                var steamResponse = JsonSerializer.Deserialize<TResponse>(response, JsonOptions);
                return extractor(steamResponse);
            }
            catch (HttpRequestException ex) when (ex.Message.Contains("429"))
            {
                throw new InvalidOperationException(
                    "Limite di richieste Steam raggiunto. Riprova tra qualche minuto.", ex);
            }
        }
    }
}