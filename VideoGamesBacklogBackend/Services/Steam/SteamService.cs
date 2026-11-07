using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using VideoGamesBacklogBackend.Common.Configuration;
using VideoGamesBacklogBackend.DTOs.Games;
using VideoGamesBacklogBackend.DTOs.Steam;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.Infrastructure.Data;
using VideoGamesBacklogBackend.Interfaces.Catalog;
using VideoGamesBacklogBackend.Interfaces.Games;
using VideoGamesBacklogBackend.Interfaces.Steam;
using GameTitleMatcher = VideoGamesBacklogBackend.Common.Helpers.GameTitleMatcher;

namespace VideoGamesBacklogBackend.Services.Steam;

public class SteamService(
    HttpClient httpClient,
    AppDbContext context,
    IOptions<SteamSettings> steamSettings,
    IGameService gameService,
    ICatalogService catalogService)
    : ISteamService
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    // shortcut: massimo giochi arricchiti da RAWG per sync (fino a 2 chiamate ciascuno), alzare se la sync resta veloce
    private const int MaxRawgEnrichPerSync = 10;

    private readonly string _steamApiKey = steamSettings.Value.ApiKey;

    public async Task<List<SteamGame>> GetSteamGamesAsync(string steamId, CancellationToken cancellationToken = default) =>
        await CallSteamApiAsync<SteamGamesResponse, List<SteamGame>>(
            "GetOwnedGames",
            steamId,
            "include_appinfo=1&include_played_free_games=0&include_free_sub=0",
            r => r?.Response.Games ?? [], cancellationToken);

    public async Task<List<RecentlyPlayedGame>> GetRecentlyPlayedGamesAsync(string steamId, CancellationToken cancellationToken = default) =>
        await CallSteamApiAsync<RecentlyPlayedGamesResponse, List<RecentlyPlayedGame>>(
            "GetRecentlyPlayedGames",
            steamId,
            "count=0",
            r => r?.Response.Games ?? [], cancellationToken);

    public async Task<SteamSyncResponse> SyncSteamGamesAsync(string steamId, string syncType, int userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var steamGames = await GetSteamGamesAsync(steamId, cancellationToken);

            return syncType switch
            {
                "initial_load" => await InitialLoadSteamGames(steamGames, userId, cancellationToken),
                "update_hours" => await UpdateGameHours(steamGames, userId, steamId, cancellationToken),
                _ => throw new ArgumentException("Tipo di sincronizzazione non valido")
            };
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("Limite di richieste Steam raggiunto"))
        {
            throw new Exception(
                "Steam API: troppe richieste. Riprova tra 5-10 minuti. Questo limite protegge i server Steam da sovraccarico.", ex);
        }
    }

    private async Task<SteamSyncResponse> InitialLoadSteamGames(List<SteamGame> steamGames, int userId, CancellationToken cancellationToken)
    {
        // Tracciati: ai giochi già presenti abbinati per titolo viene associato l'AppID
        var existingGames = await context.Games
            .Where(g => g.UserId == userId)
            .ToListAsync(cancellationToken);

        var debugInfo = new List<string>
        {
            $"Steam games to process: {steamGames.Count}",
            $"Existing games in database: {existingGames.Count}"
        };

        var excludedAppIds = await GetExcludedAppIdsAsync(userId, cancellationToken);
        var newGames = new List<CreateGameDto>();
        foreach (var steamGame in steamGames)
        {
            var existingGame = FindMatchingGame(existingGames, steamGame);
            if (existingGame != null)
            {
                existingGame.SteamAppId ??= steamGame.Appid;
            }
            else if (!excludedAppIds.Contains(steamGame.Appid))
            {
                newGames.Add(NewSteamGameDto(steamGame));
            }
        }

        await context.SaveChangesAsync(cancellationToken);

        var newGamesCount = newGames.Count > 0
            ? (await gameService.AddGamesBulkAsync(userId, newGames)).Count
            : 0;

        debugInfo.Add($"New games added: {newGamesCount}");

        return new SteamSyncResponse
        {
            Message = $"{newGamesCount} giochi aggiunti dalla libreria Steam",
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
        public List<CreateGameDto> GamesToAdd { get; } = [];
        public List<(int GameId, int HoursPlayed)> GamesToUpdate { get; } = [];
        public HashSet<int> ExcludedAppIds { get; init; } = [];
    }

    private async Task<SteamSyncResponse> UpdateGameHours(List<SteamGame> steamGames, int userId, string steamId, CancellationToken cancellationToken)
    {
        var existingGamesCount = await context.Games
            .Where(g => g.UserId == userId && g.Platform == "Steam")
            .CountAsync(cancellationToken);

        var recentlyPlayedGames = await GetRecentlyPlayedGamesAsync(steamId, cancellationToken);
        
        var syncContext = new SyncContext
        {
            UserId = userId,
            ExcludedAppIds = [.. await GetExcludedAppIdsAsync(userId, cancellationToken)],
            DebugInfo =
            [
                $"Steam games found: {steamGames.Count}",
                $"Recently played games found: {recentlyPlayedGames.Count}",
                $"Existing database games: {existingGamesCount}"
            ]
        };

        var normalizedTitles = recentlyPlayedGames
            .Select(g => GameTitleMatcher.GetFullyNormalizedTitle(g.Name))
            .ToList();
        var appIds = recentlyPlayedGames.Select(g => (int?)g.Appid).ToList();

        var existingGames = await context.Games
            .Where(g => g.UserId == userId && g.Platform == "Steam" &&
                        (appIds.Contains(g.SteamAppId) || normalizedTitles.Contains(g.NormalizedTitle)))
            .ToListAsync(cancellationToken);

        // Elabora SOLO i giochi giocati di recente
        foreach (var recentGame in recentlyPlayedGames)
        {
            var existingGame = FindMatchingGame(existingGames, recentGame);

            if (existingGame != null)
            {
                existingGame.SteamAppId ??= recentGame.Appid;
                ProcessExistingGame(syncContext, existingGame, recentGame);
            }
            else
            {
                ProcessNewGame(syncContext, recentGame);
            }
        }

        if (syncContext.GamesToUpdate.Count > 0)
        {
            await gameService.UpdateGamesPlaytimeBulkAsync(userId, syncContext.GamesToUpdate);
        }

        if (syncContext.GamesToAdd.Count > 0)
        {
            await gameService.AddGamesBulkAsync(userId, syncContext.GamesToAdd);
        }

        var enrichedCount = await EnrichMissingDataAsync(userId, syncContext.DebugInfo, cancellationToken);
        await context.SaveChangesAsync(cancellationToken); // AppID associati e dati RAWG

        syncContext.DebugInfo.Add($"Recently played games processed: {recentlyPlayedGames.Count}");
        syncContext.DebugInfo.Add($"Games matched and updated: {syncContext.UpdatedCount}");
        syncContext.DebugInfo.Add($"New recently played games added: {syncContext.NewGamesAdded}");
        syncContext.DebugInfo.Add($"Status changes (NotStarted → InProgress): {syncContext.StatusChangedCount}");
        syncContext.DebugInfo.Add("Only recently played games are processed - owned games ignored unless recently played");

        syncContext.DebugInfo.AddRange(syncContext.MatchedGames);

        var totalProcessed = syncContext.UpdatedCount + syncContext.NewGamesAdded + enrichedCount;
        var message = $"{syncContext.UpdatedCount} giochi aggiornati con le ore di Steam";

        if (syncContext.NewGamesAdded > 0)
        {
            message += $", {syncContext.NewGamesAdded} nuovi giochi aggiunti dai recently played";
        }

        if (syncContext.StatusChangedCount > 0)
        {
            message += $" ({syncContext.StatusChangedCount} cambiati a 'In corso')";
        }

        if (enrichedCount > 0)
        {
            message += $", dati mancanti completati per {enrichedCount} giochi";
        }

        return new SteamSyncResponse
        {
            Message = message,
            Count = totalProcessed,
            UpdatedGames = syncContext.UpdatedGamesInfo,
            DebugInfo = string.Join("; ", syncContext.DebugInfo)
        };
    }

    private void ProcessExistingGame(SyncContext syncContext, Game existingGame, RecentlyPlayedGame recentGame)
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

            syncContext.GamesToUpdate.Add((existingGame.Id, totalHours));

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
                NewStatus = statusChanged ? GameStatus.InProgress.ToString() : previousStatus
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

    private static void ProcessNewGame(SyncContext syncContext, RecentlyPlayedGame recentGame)
    {
        if (syncContext.ExcludedAppIds.Contains(recentGame.Appid))
        {
            syncContext.DebugInfo.Add($"{recentGame.Name} IGNORATO (eliminato in passato dalla libreria)");
            return;
        }

        var newGame = NewSteamGameDto(recentGame);
        syncContext.GamesToAdd.Add(newGame);
        syncContext.NewGamesAdded++;

        syncContext.UpdatedGamesInfo.Add(new UpdatedGameInfo
        {
            GameTitle = newGame.Title,
            PreviousHours = 0,
            NewHours = newGame.HoursPlayed,
            HoursAdded = newGame.HoursPlayed,
            StatusChanged = newGame.HoursPlayed > 0,
            PreviousStatus = "Non presente",
            NewStatus = newGame.Status
        });

        syncContext.MatchedGames.Add($"{recentGame.Name} [NUOVO GIOCO AGGIUNTO] (Ore: {newGame.HoursPlayed})");
    }

    private Task<int[]> GetExcludedAppIdsAsync(int userId, CancellationToken cancellationToken) =>
        context.Users.Where(u => u.Id == userId).Select(u => u.ExcludedSteamAppIds).FirstAsync(cancellationToken);

    // Prima l'AppID; il titolo solo per i giochi non ancora associati a Steam
    private static Game? FindMatchingGame(List<Game> games, SteamGame steamGame)
    {
        var normalizedTitle = GameTitleMatcher.GetFullyNormalizedTitle(steamGame.Name);
        return games.FirstOrDefault(g => g.SteamAppId == steamGame.Appid)
            ?? games.FirstOrDefault(g => g.SteamAppId == null && g.NormalizedTitle == normalizedTitle);
    }

    private static CreateGameDto NewSteamGameDto(SteamGame steamGame)
    {
        var hours = (int)Math.Round(steamGame.PlaytimeForever / 60.0);
        return new CreateGameDto
        {
            Title = steamGame.Name,
            Platform = "Steam",
            SteamAppId = steamGame.Appid,
            CoverImage = $"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{steamGame.Appid}/header.jpg",
            HoursPlayed = hours,
            Status = hours > 0 ? "InProgress" : "NotStarted",
            PurchaseDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };
    }

    /// <summary>
    /// Come il pulsante "Aggiorna dati mancanti" della pagina gioco, ma solo sui giochi Steam mai arricchiti
    /// (Developer vuoto) e solo con un risultato RAWG dallo stesso titolo normalizzato: senza conferma umana
    /// un dato sbagliato è peggio di uno mancante.
    /// </summary>
    private async Task<int> EnrichMissingDataAsync(int userId, List<string> debugInfo, CancellationToken cancellationToken)
    {
        var games = await context.Games
            .Where(g => g.UserId == userId && g.Platform == "Steam" && (g.Developer == null || g.Developer == ""))
            .OrderBy(g => g.Id)
            .Take(MaxRawgEnrichPerSync)
            .ToListAsync(cancellationToken);

        var enriched = 0;
        foreach (var game in games)
        {
            var search = await catalogService.SearchGamesAsync(game.Title, cancellationToken);
            var match = search.Results.FirstOrDefault(r => GameTitleMatcher.GetFullyNormalizedTitle(r.Title) == game.NormalizedTitle);
            if (match == null)
            {
                // Non riprovare a ogni sync: resta il pulsante manuale nella pagina del gioco
                game.Developer = "Sconosciuto";
                debugInfo.Add($"{game.Title}: nessuna corrispondenza RAWG");
                continue;
            }

            var details = await catalogService.GetGameDetailsAsync(match.Id.ToString(), cancellationToken);
            if (details == null) continue; // errore RAWG temporaneo: si riprova alla prossima sync

            game.Developer = details.Developer;
            if (string.IsNullOrEmpty(game.Publisher)) game.Publisher = details.Publisher;
            if (string.IsNullOrEmpty(game.CoverImage) && details.CoverImage != "/placeholder.svg") game.CoverImage = details.CoverImage;
            if (game.ReleaseYear == 0 && details.ReleaseYear is > 0) game.ReleaseYear = details.ReleaseYear.Value;
            if (game.Genres.Length == 0) game.Genres = [.. details.Genres];
            if ((game.Metacritic is null or 0) && details.Metacritic > 0) game.Metacritic = details.Metacritic;
            enriched++;
        }

        return enriched;
    }

    /// <summary>
    /// Costruisce l'URL e invoca la Steam API.
    /// </summary>
    private async Task<TResult> CallSteamApiAsync<TResponse, TResult>(
        string method, string steamId, string extraParams, Func<TResponse?, TResult> extractor, CancellationToken cancellationToken)
    {
        var url = $"https://api.steampowered.com/IPlayerService/{method}/v1/?key={_steamApiKey}&steamid={steamId}&{extraParams}";
        return await FetchSteamApiAsync(url, extractor, cancellationToken);
    }

    /// <summary>
    /// Centralizza le chiamate HTTP alla Steam API con gestione errori e rate limiting.
    /// </summary>
    private async Task<TResult> FetchSteamApiAsync<TResponse, TResult>(
        string url, Func<TResponse?, TResult> extractor, CancellationToken cancellationToken)
    {
        try
        {
            var response = await httpClient.GetStringAsync(url, cancellationToken);
            var steamResponse = JsonSerializer.Deserialize<TResponse>(response, JsonOptions);
            return extractor(steamResponse);
        }
        catch (HttpRequestException ex) when (ex.Message.Contains("429") || ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
        {
            throw new InvalidOperationException(
                "Limite di richieste Steam raggiunto. Riprova tra qualche minuto.", ex);
        }
    }
}