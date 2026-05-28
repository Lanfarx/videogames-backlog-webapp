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

namespace VideoGamesBacklogBackend.Services.Steam;

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
            r => r?.Response.Games ?? []);

    public async Task<List<RecentlyPlayedGame>> GetRecentlyPlayedGamesAsync(string steamId) =>
        await CallSteamApiAsync<RecentlyPlayedGamesResponse, List<RecentlyPlayedGame>>(
            "GetRecentlyPlayedGames",
            steamId,
            "count=0",
            r => r?.Response.Games ?? []);

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
        var existingGamesTitles = await context.Games
            .AsNoTracking()
            .Where(g => g.UserId == userId)
            .Select(g => g.NormalizedTitle)
            .ToListAsync();

        var newGamesCount = 0;
        var debugInfo = new List<string>();
        const int gamesWithImages = 0;

        debugInfo.Add($"Steam games to process: {steamGames.Count}");
        debugInfo.Add($"Existing games in database: {existingGamesTitles.Count}");

        foreach (var game in from steamGame in steamGames let normalizedTitle = GameTitleMatcher.GetFullyNormalizedTitle(steamGame.Name) 
                 where !existingGamesTitles.Contains(normalizedTitle) let hoursPlayed = (int)Math.Round(steamGame.PlaytimeForever / 60.0) select new CreateGameDto
                 {
                     Title = steamGame.Name,
                     Platform = "Steam",
                     HoursPlayed = hoursPlayed,
                     Status = hoursPlayed > 0 ? "InProgress" : "NotStarted",
                     PurchaseDate = DateOnly.FromDateTime(DateTime.UtcNow)
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

    private class SyncContext
    {
        public int UserId { get; init; }
        public int UpdatedCount { get; set; }
        public int StatusChangedCount { get; set; }
        public int NewGamesAdded { get; set; }
        public List<string> MatchedGames { get; } = [];
        public List<UpdatedGameInfo> UpdatedGamesInfo { get; } = [];
        public List<string> DebugInfo { get; init; } = [];
    }

    private async Task<SteamSyncResponse> UpdateGameHours(List<SteamGame> steamGames, int userId, string steamId)
    {
        var existingGamesCount = await context.Games
            .Where(g => g.UserId == userId && g.Platform == "Steam")
            .CountAsync();

        // Delay per evitare rate limiting di Steam
        await Task.Delay(1000);

        var recentlyPlayedGames = await GetRecentlyPlayedGamesAsync(steamId);
        
        var syncContext = new SyncContext
        {
            UserId = userId,
            DebugInfo =
            [
                $"Steam games found: {steamGames.Count}",
                $"Recently played games found: {recentlyPlayedGames.Count}",
                $"Existing database games: {existingGamesCount}"
            ]
        };

        // Elabora SOLO i giochi giocati di recente
        foreach (var recentGame in recentlyPlayedGames)
        {
            var normalizedTitle = GameTitleMatcher.GetFullyNormalizedTitle(recentGame.Name);
            var existingGame = await context.Games
                .FirstOrDefaultAsync(g => g.UserId == userId && g.Platform == "Steam" && g.NormalizedTitle == normalizedTitle);

            if (existingGame != null)
            {
                await ProcessExistingGameAsync(syncContext, existingGame, recentGame);
            }
            else
            {
                await ProcessNewGameAsync(syncContext, recentGame);
            }
        }

        syncContext.DebugInfo.Add($"Recently played games processed: {recentlyPlayedGames.Count}");
        syncContext.DebugInfo.Add($"Games matched and updated: {syncContext.UpdatedCount}");
        syncContext.DebugInfo.Add($"New recently played games added: {syncContext.NewGamesAdded}");
        syncContext.DebugInfo.Add($"Status changes (NotStarted → InProgress): {syncContext.StatusChangedCount}");
        syncContext.DebugInfo.Add("Only recently played games are processed - owned games ignored unless recently played");

        syncContext.DebugInfo.AddRange(syncContext.MatchedGames);

        var totalProcessed = syncContext.UpdatedCount + syncContext.NewGamesAdded;
        var message = $"{syncContext.UpdatedCount} giochi aggiornati con le ore di Steam";

        if (syncContext.NewGamesAdded > 0)
        {
            message += $", {syncContext.NewGamesAdded} nuovi giochi aggiunti dai recently played";
        }

        if (syncContext.StatusChangedCount > 0)
        {
            message += $" ({syncContext.StatusChangedCount} cambiati a 'In corso')";
        }

        return new SteamSyncResponse
        {
            Message = message,
            Count = totalProcessed,
            UpdatedGames = syncContext.UpdatedGamesInfo,
            DebugInfo = string.Join("; ", syncContext.DebugInfo)
        };
    }

    private async Task ProcessExistingGameAsync(SyncContext syncContext, Game existingGame, RecentlyPlayedGame recentGame)
    {
        var totalHours = (int)Math.Round(recentGame.PlaytimeForever / 60.0);
        var recentHours = (int)Math.Round(recentGame.Playtime2Weeks / 60.0);
        var wasNotStarted = existingGame.Status == GameStatus.NotStarted;

        if (existingGame.HoursPlayed != totalHours)
        {
            var hoursDifference = totalHours - existingGame.HoursPlayed;
            var previousHours = existingGame.HoursPlayed;
            var previousStatus = existingGame.Status.ToString();

            syncContext.DebugInfo.Add(
                $"{recentGame.Name}: Ore totali: {totalHours}, Incremento: {hoursDifference}h, Ore recenti: {recentHours}h");

            var updatedGame = await gameService.UpdateGamePlaytimeAsync(syncContext.UserId, existingGame.Id, totalHours);

            if (updatedGame == null) return;
            var statusChanged = wasNotStarted && totalHours > 0;
            if (statusChanged)
            {
                syncContext.StatusChangedCount++;
            }

            syncContext.UpdatedGamesInfo.Add(new UpdatedGameInfo
            {
                GameTitle = existingGame.Title,
                PreviousHours = previousHours,
                NewHours = totalHours,
                HoursAdded = hoursDifference,
                StatusChanged = statusChanged,
                PreviousStatus = previousStatus,
                NewStatus = updatedGame.Status
            });

            syncContext.UpdatedCount++;
            syncContext.MatchedGames.Add($"{recentGame.Name} -> {existingGame.Title} (Ore: {totalHours})" +
                             (statusChanged ? " [STATO: Da iniziare → In corso]" : ""));
        }
        else
        {
            syncContext.DebugInfo.Add($"{recentGame.Name} già aggiornato con le ore corrette: {totalHours}");
            syncContext.MatchedGames.Add(
                $"{recentGame.Name} -> {existingGame.Title} (Ore: {totalHours}) [NESSUN CAMBIAMENTO]");
        }
    }

    private async Task ProcessNewGameAsync(SyncContext syncContext, RecentlyPlayedGame recentGame)
    {
        var totalHours = (int)Math.Round(recentGame.PlaytimeForever / 60.0);
        var recentHours = (int)Math.Round(recentGame.Playtime2Weeks / 60.0);

        var isProbablyFreeToPlay = totalHours == 0 && recentHours > 0;

        if (!isProbablyFreeToPlay)
        {
            syncContext.DebugInfo.Add(
                $"{recentGame.Name} (Owned/Family Share): Ore totali: {totalHours}, Ore recenti: {recentHours}h - AGGIUNTO");

            try
            {
                var newGame = new CreateGameDto
                {
                    Title = recentGame.Name,
                    Platform = "Steam",
                    HoursPlayed = totalHours,
                    Status = totalHours > 0 ? "InProgress" : "NotStarted",
                    PurchaseDate = DateOnly.FromDateTime(DateTime.UtcNow)
                };

                var addedGame = await gameService.AddGameAsync(syncContext.UserId, newGame);

                syncContext.NewGamesAdded++;
                syncContext.DebugInfo.Add($"{recentGame.Name} AGGIUNTO CORRETTAMENTE con ID: {addedGame.Id}");

                syncContext.UpdatedGamesInfo.Add(new UpdatedGameInfo
                {
                    GameTitle = addedGame.Title,
                    PreviousHours = 0,
                    NewHours = totalHours,
                    HoursAdded = totalHours,
                    StatusChanged = totalHours > 0,
                    PreviousStatus = "Non presente",
                    NewStatus = addedGame.Status
                });

                syncContext.MatchedGames.Add($"{recentGame.Name} [NUOVO GIOCO AGGIUNTO] (Ore: {totalHours})" +
                                 (totalHours > 0
                                     ? " [STATO: Nuovo → In corso]"
                                     : " [STATO: Nuovo → Da iniziare]"));
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Errore nell'aggiunta del gioco Steam {GameName}", recentGame.Name);
                syncContext.DebugInfo.Add($"{recentGame.Name} ERRORE nell'aggiunta: {ex.Message}");
            }
        }
        else
        {
            syncContext.DebugInfo.Add(
                $"{recentGame.Name} IGNORATO (probabilmente free-to-play): Ore totali: {totalHours}, Ore recenti: {recentHours}h");
        }
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