using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using System.Net;
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
    // shortcut: massimo giochi mai controllati per achievement a sync (1 chiamata ciascuno), alzare se la sync resta veloce
    private const int MaxNewAchievementChecksPerSync = 100;
    // shortcut: massimo giochi senza AppID cercati sullo store per sync (1 chiamata ciascuno)
    private const int MaxAppIdLookupsPerSync = 100;
    private const int AbandonAfterDays = 30;
    private const int RecentlyPlayedDays = 14;

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

    /// <summary>
    /// Aggiorna ore, ultima sessione, stato e achievement dei giochi Steam già in libreria. Non aggiunge giochi:
    /// quelli nuovi passano dalla lista "Da importare".
    /// </summary>
    public async Task<SteamSyncResponse> SyncSteamGamesAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await GetUserWithSteamIdAsync(userId, cancellationToken);
        var owned = await GetSteamGamesAsync(user.SteamId!, cancellationToken);
        // I posseduti escludono i F2P: i giocati di recente coprono quelli già in libreria
        var recent = await GetRecentlyPlayedGamesAsync(user.SteamId!, cancellationToken);
        var ownedIds = owned.Select(o => o.Appid).ToHashSet();
        var steamGames = owned.Concat(recent.Where(r => !ownedIds.Contains(r.Appid))).ToList();
        var byAppId = steamGames.ToDictionary(g => g.Appid);
        var byExactTitle = steamGames.GroupBy(g => g.Name, StringComparer.OrdinalIgnoreCase).ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);
        // La normalizzazione toglie "Remastered", "HD", ecc.: un titolo normalizzato condiviso da più giochi Steam non identifica nessuno
        var byUniqueTitle = steamGames.GroupBy(g => GameTitleMatcher.GetFullyNormalizedTitle(g.Name)).Where(g => g.Count() == 1).ToDictionary(g => g.Key, g => g.First());

        var library = await context.Games
            .Where(g => g.UserId == userId && g.Platform == "Steam")
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        // Stato di partenza di ogni gioco: il riepilogo si calcola alla fine confrontandolo con lo stato finale.
        // Matched = trovato tra posseduti o recenti; gli altri (es. Family Sharing non recente) ricevono solo gli achievement
        var tracked = new List<(Game Game, int PreviousHours, GameStatus PreviousStatus, bool Played, bool Matched)>();
        var hourUpdates = new List<(int GameId, int HoursPlayed)>();

        foreach (var game in library)
        {
            // Il titolo esatto vince anche sull'AppID salvato: corregge gli AppID associati per errore da un titolo normalizzato ambiguo
            var steamGame = byExactTitle.GetValueOrDefault(game.Title)
                ?? (game.SteamAppId is int appId ? byAppId.GetValueOrDefault(appId) : byUniqueTitle.GetValueOrDefault(game.NormalizedTitle));
            if (steamGame == null)
            {
                tracked.Add((game, game.HoursPlayed, game.Status, false, false));
                continue;
            }
            if (game.SteamAppId is int oldAppId && oldAppId != steamGame.Appid)
            {
                game.AchievementsUnlocked = game.AchievementsTotal = null; // erano quelli dell'altro gioco: si ricontrollano
            }

            var hours = ToHours(steamGame.PlaytimeForever);
            var lastPlayed = ToDate(steamGame.RtimeLastPlayed);
            // Anche una sessione breve, che non sposta le ore arrotondate, conta come giocato
            var played = hours > game.HoursPlayed || lastPlayed > game.LastPlayedAt;
            tracked.Add((game, game.HoursPlayed, game.Status, played, true));
            game.SteamAppId = steamGame.Appid;
            // I giochi solo nei "giocati di recente" non hanno rtime: se le ore sono salite, la sessione è recente
            game.LastPlayedAt = lastPlayed ?? (played ? now : game.LastPlayedAt);
            if (hours != game.HoursPlayed) hourUpdates.Add((game.Id, hours));
        }

        if (hourUpdates.Count > 0)
        {
            // Salva anche AppID e ultima sessione: stesso DbContext
            await gameService.UpdateGamesPlaytimeBulkAsync(userId, hourUpdates, ActivitySource.Steam);
        }

        await FindMissingAppIdsAsync(library, cancellationToken);
        var warning = await UpdateAchievementsAsync(user.SteamId!,
            tracked.Where(t => t.Game.SteamAppId != null).Select(t => (t.Game, t.Played)).ToList(), cancellationToken);
        var statusChanges = tracked
            .Select(t => (t.Game, Next: NextStatus(t.Game, t.Played, now), t.Matched))
            // Dei giochi non trovati Steam non dice né ore né ultima sessione: per loro vale solo il Platino
            .Where(c => c.Next != null && c.Next != c.Game.Status && (c.Matched || c.Next == GameStatus.Platinum))
            .GroupBy(c => c.Next!.Value);
        foreach (var group in statusChanges) // al più uno per stato: un salvataggio ciascuno, non uno per gioco
            await gameService.UpdateGamesStatusBulkAsync(userId, [.. group.Select(c => c.Game.Id)], group.Key.ToString(), ActivitySource.Steam);

        var updatedGames = tracked
            .Where(t => t.Game.HoursPlayed != t.PreviousHours || t.Game.Status != t.PreviousStatus)
            .Select(t => new UpdatedGameInfo
            {
                GameTitle = t.Game.Title,
                PreviousHours = t.PreviousHours,
                NewHours = t.Game.HoursPlayed,
                HoursAdded = t.Game.HoursPlayed - t.PreviousHours,
                StatusChanged = t.Game.Status != t.PreviousStatus,
                PreviousStatus = t.PreviousStatus.ToString(),
                NewStatus = t.Game.Status.ToString()
            })
            .ToList();
        var statusChangesCount = updatedGames.Count(u => u.StatusChanged);

        var enrichedCount = await EnrichMissingDataAsync(userId, cancellationToken);
        user.LastSteamSyncAt = now;
        await context.SaveChangesAsync(cancellationToken);

        var pendingCount = (await BuildCandidatesAsync(owned, userId, false, cancellationToken))
            .Count(c => c.LastPlayedAt >= now.AddDays(-RecentlyPlayedDays));

        var message = $"{hourUpdates.Count} giochi aggiornati con le ore di Steam";
        if (statusChangesCount > 0) message += $", {statusChangesCount} cambi di stato";
        if (enrichedCount > 0) message += $", dati mancanti completati per {enrichedCount} giochi";

        return new SteamSyncResponse
        {
            Message = message,
            Count = updatedGames.Count + enrichedCount,
            UpdatedGames = updatedGames,
            PendingCount = pendingCount,
            Warning = warning
        };
    }

    public async Task<List<SteamCandidateDto>> GetCandidatesAsync(int userId, bool ignored, CancellationToken cancellationToken = default)
    {
        var user = await GetUserWithSteamIdAsync(userId, cancellationToken);
        var owned = await GetSteamGamesAsync(user.SteamId!, cancellationToken);
        return await BuildCandidatesAsync(owned, userId, ignored, cancellationToken);
    }

    public async Task<int> ImportGamesAsync(int userId, List<SteamImportItem> items, CancellationToken cancellationToken = default)
    {
        // Nome, ore e ultima sessione vengono da Steam, non dal client: si importano solo candidati veri
        var candidates = (await GetCandidatesAsync(userId, false, cancellationToken)).ToDictionary(c => c.AppId);
        var games = items
            .Where(i => candidates.ContainsKey(i.AppId))
            .Select(i =>
            {
                var c = candidates[i.AppId];
                return new CreateGameDto
                {
                    Title = c.Name,
                    Platform = "Steam",
                    SteamAppId = c.AppId,
                    CoverImage = c.CoverImage,
                    HoursPlayed = c.HoursPlayed,
                    LastPlayedAt = c.LastPlayedAt,
                    Status = Enum.TryParse<GameStatus>(i.Status, out var status) && Enum.IsDefined(status) ? status.ToString() : c.SuggestedStatus,
                    PurchaseDate = null // Steam non espone la data d'acquisto
                };
            })
            .ToList();

        return games.Count > 0 ? (await gameService.AddGamesBulkAsync(userId, games, ActivitySource.Steam)).Count : 0;
    }

    public async Task SetIgnoredAsync(int userId, List<int> appIds, bool ignored, CancellationToken cancellationToken = default)
    {
        var user = await context.Users.FirstAsync(u => u.Id == userId, cancellationToken);
        user.ExcludedSteamAppIds = ignored
            ? [.. user.ExcludedSteamAppIds.Union(appIds)]
            : [.. user.ExcludedSteamAppIds.Except(appIds)];
        await context.SaveChangesAsync(cancellationToken);
    }

    // Posseduti meno libreria (per AppID o titolo, come la deduplica di AddGamesBulkAsync), separati tra ignorati e no
    private async Task<List<SteamCandidateDto>> BuildCandidatesAsync(List<SteamGame> owned, int userId, bool ignored, CancellationToken cancellationToken)
    {
        var library = await context.Games
            .Where(g => g.UserId == userId)
            .Select(g => new { g.SteamAppId, g.NormalizedTitle })
            .ToListAsync(cancellationToken);
        var appIds = library.Select(g => g.SteamAppId).ToHashSet();
        // Per titolo solo i giochi senza AppID: altrimenti Oblivion Remastered in libreria nasconderebbe Oblivion
        var titles = library.Where(g => g.SteamAppId == null).Select(g => g.NormalizedTitle).ToHashSet();
        var excluded = (await context.Users.Where(u => u.Id == userId).Select(u => u.ExcludedSteamAppIds).FirstAsync(cancellationToken)).ToHashSet();
        var now = DateTime.UtcNow;

        return owned
            .Where(s => excluded.Contains(s.Appid) == ignored
                        && !appIds.Contains(s.Appid)
                        && !titles.Contains(GameTitleMatcher.GetFullyNormalizedTitle(s.Name)))
            .Select(s =>
            {
                var hours = ToHours(s.PlaytimeForever);
                var lastPlayed = ToDate(s.RtimeLastPlayed);
                return new SteamCandidateDto
                {
                    AppId = s.Appid,
                    Name = s.Name,
                    CoverImage = $"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{s.Appid}/header.jpg",
                    HoursPlayed = hours,
                    LastPlayedAt = lastPlayed,
                    SuggestedStatus = (hours == 0 ? GameStatus.NotStarted
                        : lastPlayed >= now.AddDays(-AbandonAfterDays) ? GameStatus.InProgress
                        : GameStatus.Abandoned).ToString()
                };
            })
            .OrderByDescending(c => c.LastPlayedAt)
            .ThenBy(c => c.Name)
            .ToList();
    }

    /// <summary>
    /// Regole di stato automatiche dei giochi Steam: Platino al 100% degli achievement ha la precedenza,
    /// poi abbandono dopo 30 giorni senza sessioni e ripresa alla sessione successiva. Completato non si tocca.
    /// </summary>
    internal static GameStatus? NextStatus(Game game, bool playedSinceLastSync, DateTime now)
    {
        if (game.AchievementsTotal > 0 && game.AchievementsUnlocked == game.AchievementsTotal)
            return GameStatus.Platinum;
        return game.Status switch
        {
            GameStatus.Abandoned when playedSinceLastSync => GameStatus.InProgress,
            GameStatus.InProgress when game.LastPlayedAt < now.AddDays(-AbandonAfterDays) => GameStatus.Abandoned,
            _ => null
        };
    }

    /// <summary>
    /// Achievement dei giochi appena giocati, più qualche gioco mai controllato. Restituisce un avviso se Steam rifiuta
    /// (dettagli di gioco del profilo privati o limite di richieste): si riprova alla prossima sync.
    /// </summary>
    // Sequenziale di proposito: poche chiamate a sync, e in parallelo si rischia il limite di richieste Steam
    private async Task<string?> UpdateAchievementsAsync(string steamId, List<(Game Game, bool Played)> games, CancellationToken cancellationToken)
    {
        var toCheck = games
            .Where(g => g.Game.AchievementsTotal == null && !g.Played)
            .Take(MaxNewAchievementChecksPerSync)
            .Concat(games.Where(g => g.Played && g.Game.AchievementsTotal != 0))
            .Select(g => g.Game);

        foreach (var game in toCheck)
        {
            var url = $"https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key={_steamApiKey}&steamid={steamId}&appid={game.SteamAppId}";
            using var response = await httpClient.GetAsync(url, cancellationToken);
            if (response.StatusCode == HttpStatusCode.BadRequest)
            {
                // "Requested app has no stats": il gioco non ha achievement, non si richiede più
                game.AchievementsUnlocked = game.AchievementsTotal = 0;
                continue;
            }

            if (!response.IsSuccessStatusCode)
            {
                return response.StatusCode == HttpStatusCode.Forbidden
                    ? "Achievement non letti: rendi pubblici i dettagli di gioco del profilo Steam"
                    : $"Achievement non letti (Steam ha risposto {(int)response.StatusCode}), si riprova alla prossima sincronizzazione";
            }

            var stats = JsonSerializer.Deserialize<PlayerAchievementsResponse>(
                await response.Content.ReadAsStringAsync(cancellationToken), JsonOptions);
            var achievements = stats?.Playerstats.Achievements ?? [];
            game.AchievementsTotal = achievements.Count;
            game.AchievementsUnlocked = achievements.Count(a => a.Achieved == 1);
            // Platino: la data è quella dell'ultimo sblocco, non quella della sync (il cambio di stato la conserva)
            if (game.AchievementsTotal > 0 && game.AchievementsUnlocked == game.AchievementsTotal
                && ToDate(achievements.Max(a => a.Unlocktime)) is DateTime lastUnlock)
                game.PlatinumDate ??= DateOnly.FromDateTime(lastUnlock);
        }

        return null;
    }

    /// <summary>
    /// AppID dei giochi Steam in libreria che la sync non trova (es. Family Sharing non giocati di recente), cercati per
    /// titolo esatto sullo store, così se ne leggono gli achievement.
    /// </summary>
    private async Task FindMissingAppIdsAsync(List<Game> games, CancellationToken cancellationToken)
    {
        foreach (var game in games.Where(g => g.SteamAppId == null && g.AchievementsTotal == null).Take(MaxAppIdLookupsPerSync))
        {
            // shortcut: storesearch è l'endpoint della ricerca dello store, non documentato; se smette di funzionare resta il gioco senza AppID
            var url = $"https://store.steampowered.com/api/storesearch/?term={Uri.EscapeDataString(game.Title)}&l=english&cc=US";
            using var response = await httpClient.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode) return; // si riprova alla prossima sync

            var search = JsonSerializer.Deserialize<StoreSearchResponse>(await response.Content.ReadAsStringAsync(cancellationToken), JsonOptions);
            var items = search?.Items ?? [];
            // Titolo esatto, altrimenti il normalizzato solo se non è ambiguo (stessa regola dell'abbinamento della sync)
            var sameNormalized = items.Where(i => GameTitleMatcher.GetFullyNormalizedTitle(i.Name) == game.NormalizedTitle).ToList();
            var match = items.FirstOrDefault(i => string.Equals(i.Name, game.Title, StringComparison.OrdinalIgnoreCase))
                ?? (sameNormalized.Count == 1 ? sameNormalized[0] : null);
            if (match != null) game.SteamAppId = match.Id;
            // Nessuna corrispondenza sicura: come un gioco senza achievement, non si ritenta a ogni sync
            else game.AchievementsUnlocked = game.AchievementsTotal = 0;
        }
    }

    private async Task<User> GetUserWithSteamIdAsync(int userId, CancellationToken cancellationToken)
    {
        var user = await context.Users.FirstAsync(u => u.Id == userId, cancellationToken);
        return string.IsNullOrEmpty(user.SteamId)
            ? throw new ArgumentException("Collega il tuo account Steam nelle impostazioni.")
            : user;
    }

    private static int ToHours(int minutes) => (int)Math.Round(minutes / 60.0);

    private static DateTime? ToDate(long unixSeconds) =>
        unixSeconds > 0 ? DateTimeOffset.FromUnixTimeSeconds(unixSeconds).UtcDateTime : null;

    /// <summary>
    /// Come il pulsante "Aggiorna dati mancanti" della pagina gioco, ma solo sui giochi Steam mai arricchiti
    /// (Developer vuoto) e solo con un risultato RAWG dallo stesso titolo normalizzato: senza conferma umana
    /// un dato sbagliato è peggio di uno mancante.
    /// </summary>
    private async Task<int> EnrichMissingDataAsync(int userId, CancellationToken cancellationToken)
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
            var match = search.Results.FirstOrDefault(r => string.Equals(r.Title, game.Title, StringComparison.OrdinalIgnoreCase))
                ?? search.Results.FirstOrDefault(r => GameTitleMatcher.GetFullyNormalizedTitle(r.Title) == game.NormalizedTitle);
            if (match == null)
            {
                // Non riprovare a ogni sync: resta il pulsante manuale nella pagina del gioco
                game.Developer = "Sconosciuto";
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
        try
        {
            var response = await httpClient.GetStringAsync(url, cancellationToken);
            return extractor(JsonSerializer.Deserialize<TResponse>(response, JsonOptions));
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.TooManyRequests)
        {
            throw new InvalidOperationException(
                "Steam API: troppe richieste. Riprova tra 5-10 minuti. Questo limite protegge i server Steam da sovraccarico.", ex);
        }
    }
}
