using System.Globalization;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using VideoGamesBacklogBackend.Common.Configuration;
using VideoGamesBacklogBackend.DTOs.Catalog;
using VideoGamesBacklogBackend.Interfaces.Catalog;

namespace VideoGamesBacklogBackend.Services.Catalog;

public class CatalogService(
    HttpClient httpClient,
    IMemoryCache cache,
    IOptions<RawgSettings> rawgSettings,
    ILogger<CatalogService> logger)
    : ICatalogService
{
    private static readonly TimeSpan SearchCacheTtl = TimeSpan.FromHours(1);
    private static readonly TimeSpan CatalogCacheTtl = TimeSpan.FromHours(1);
    private static readonly TimeSpan DetailsCacheTtl = TimeSpan.FromHours(24);
    private static readonly TimeSpan SimilarCacheTtl = TimeSpan.FromHours(24);

    private readonly string _apiKey = rawgSettings.Value.ApiKey;
    private readonly string _baseUrl = string.IsNullOrWhiteSpace(rawgSettings.Value.BaseUrl)
        ? "https://api.rawg.io/api"
        : rawgSettings.Value.BaseUrl.TrimEnd('/');

    public async Task<CatalogSearchResultDto> SearchGamesAsync(string query, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return new CatalogSearchResultDto();
        }

        var cacheKey = $"catalog_search_{query.Trim().ToLowerInvariant()}";
        if (cache.TryGetValue(cacheKey, out CatalogSearchResultDto? cachedResult) && cachedResult != null)
        {
            return cachedResult;
        }

        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            logger.LogWarning("RAWG API key is not configured in RawgSettings. Please configure RAWG_API_KEY.");
            return new CatalogSearchResultDto();
        }

        try
        {
            var url = $"{_baseUrl}/games?key={Uri.EscapeDataString(_apiKey)}&search={Uri.EscapeDataString(query)}";
            var response = await httpClient.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("RAWG search failed with status {StatusCode} for query {Query}", response.StatusCode, query);
                return new CatalogSearchResultDto();
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

            var root = doc.RootElement;
            var count = root.TryGetProperty("count", out var countProp) ? countProp.GetInt32() : 0;
            var games = new List<CatalogGameDto>();

            if (root.TryGetProperty("results", out var resultsProp) && resultsProp.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in resultsProp.EnumerateArray())
                {
                    var mapped = MapJsonElementToGameDto(item);
                    if (!string.IsNullOrWhiteSpace(mapped.Title))
                    {
                        games.Add(mapped);
                    }
                }
            }

            var result = new CatalogSearchResultDto
            {
                Count = count,
                Results = games
            };

            cache.Set(cacheKey, result, SearchCacheTtl);
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while searching games on RAWG for query '{Query}'", query);
            return new CatalogSearchResultDto();
        }
    }

    public async Task<CatalogGameDto?> GetGameDetailsAsync(string gameId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(gameId))
        {
            return null;
        }

        var cacheKey = $"catalog_details_{gameId.Trim().ToLowerInvariant()}";
        if (cache.TryGetValue(cacheKey, out CatalogGameDto? cachedGame) && cachedGame != null)
        {
            return cachedGame;
        }

        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            logger.LogWarning("RAWG API key is not configured in RawgSettings. Please configure RAWG_API_KEY.");
            return null;
        }

        try
        {
            var url = $"{_baseUrl}/games/{Uri.EscapeDataString(gameId)}?key={Uri.EscapeDataString(_apiKey)}";
            var response = await httpClient.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("RAWG game details failed with status {StatusCode} for id {GameId}", response.StatusCode, gameId);
                return null;
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

            var gameDto = MapJsonElementToGameDto(doc.RootElement);
            cache.Set(cacheKey, gameDto, DetailsCacheTtl);
            return gameDto;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while fetching game details from RAWG for id '{GameId}'", gameId);
            return null;
        }
    }

    public async Task<CatalogSearchResultDto> GetPaginatedGamesAsync(
        int page,
        int pageSize,
        string? search,
        string? ordering,
        string? platforms,
        CancellationToken cancellationToken = default)
    {
        var safePage = Math.Max(1, page);
        var safePageSize = Math.Clamp(pageSize, 1, 80);
        var cacheKey = $"catalog_page_{safePage}_{safePageSize}_{search ?? ""}_{ordering ?? ""}_{platforms ?? ""}";

        if (cache.TryGetValue(cacheKey, out CatalogSearchResultDto? cachedResult) && cachedResult != null)
        {
            return cachedResult;
        }

        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            logger.LogWarning("RAWG API key is not configured in RawgSettings. Please configure RAWG_API_KEY.");
            return new CatalogSearchResultDto();
        }

        try
        {
            var queryParams = new List<string>
            {
                $"key={Uri.EscapeDataString(_apiKey)}",
                $"page={safePage}",
                $"page_size={safePageSize}"
            };

            if (!string.IsNullOrWhiteSpace(search))
                queryParams.Add($"search={Uri.EscapeDataString(search)}");

            if (!string.IsNullOrWhiteSpace(ordering))
                queryParams.Add($"ordering={Uri.EscapeDataString(ordering)}");

            if (!string.IsNullOrWhiteSpace(platforms))
                queryParams.Add($"platforms={Uri.EscapeDataString(platforms)}");

            var url = $"{_baseUrl}/games?{string.Join("&", queryParams)}";
            var response = await httpClient.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("RAWG paginated games failed with status {StatusCode}", response.StatusCode);
                return new CatalogSearchResultDto();
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

            var root = doc.RootElement;
            var count = root.TryGetProperty("count", out var countProp) ? countProp.GetInt32() : 0;
            var games = new List<CatalogGameDto>();

            if (root.TryGetProperty("results", out var resultsProp) && resultsProp.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in resultsProp.EnumerateArray())
                {
                    var mapped = MapJsonElementToGameDto(item);
                    if (!string.IsNullOrWhiteSpace(mapped.Title))
                    {
                        games.Add(mapped);
                    }
                }
            }

            var result = new CatalogSearchResultDto
            {
                Count = count,
                Results = games
            };

            cache.Set(cacheKey, result, CatalogCacheTtl);
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while fetching paginated games from RAWG");
            return new CatalogSearchResultDto();
        }
    }

    public async Task<List<CatalogGameDto>> GetSimilarGamesAsync(
        List<int> genreIds,
        int excludeId,
        int count,
        int? metacritic,
        CancellationToken cancellationToken = default)
    {
        var targetCount = Math.Clamp(count, 1, 20);
        var genresParam = string.Join(",", genreIds ?? []);
        var cacheKey = $"catalog_similar_{genresParam}_{excludeId}_{targetCount}_{metacritic ?? 0}";

        if (cache.TryGetValue(cacheKey, out List<CatalogGameDto>? cachedSimilar) && cachedSimilar != null)
        {
            return cachedSimilar;
        }

        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            logger.LogWarning("RAWG API key is not configured in RawgSettings. Please configure RAWG_API_KEY.");
            return [];
        }

        try
        {
            var queryParams = new List<string>
            {
                $"key={Uri.EscapeDataString(_apiKey)}",
                "exclude_additions=true",
                "ordering=-rating,-metacritic,-released",
                $"page_size={Math.Min(40, targetCount * 3)}",
                "platforms=1,4,7,18,22,186,187",
                $"dates=2000-01-01,{DateTime.UtcNow:yyyy-MM-dd}"
            };

            if (!string.IsNullOrWhiteSpace(genresParam))
            {
                queryParams.Add($"genres={Uri.EscapeDataString(genresParam)}");
            }

            if (metacritic.HasValue && metacritic.Value > 0)
            {
                var range = metacritic.Value > 80 ? 15 : metacritic.Value > 60 ? 20 : 25;
                var minMeta = Math.Max(0, metacritic.Value - range);
                var maxMeta = Math.Min(100, metacritic.Value + range);
                queryParams.Add($"metacritic={minMeta},{maxMeta}");
            }
            else
            {
                queryParams.Add("metacritic=60,100");
            }

            var url = $"{_baseUrl}/games?{string.Join("&", queryParams)}";
            var response = await httpClient.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("RAWG similar games failed with status {StatusCode}", response.StatusCode);
                return [];
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

            var root = doc.RootElement;
            var candidates = new List<CatalogGameDto>();

            if (root.TryGetProperty("results", out var resultsProp) && resultsProp.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in resultsProp.EnumerateArray())
                {
                    var mapped = MapJsonElementToGameDto(item);
                    var titleLower = mapped.Title.ToLowerInvariant();

                    if (mapped.Id != excludeId &&
                        !string.IsNullOrWhiteSpace(mapped.Title) &&
                        !string.IsNullOrWhiteSpace(mapped.CoverImage) &&
                        mapped.CoverImage != "/placeholder.svg" &&
                        mapped.ReleaseYear.HasValue &&
                        mapped.Rating >= 3.0 &&
                        mapped.RatingsCount >= 5 &&
                        !titleLower.Contains("dlc") &&
                        !titleLower.Contains("expansion") &&
                        !titleLower.Contains("season pass"))
                    {
                        candidates.Add(mapped);
                    }
                }
            }

            var sorted = candidates
                .OrderByDescending(g => CalculateSimilarityScore(g, metacritic))
                .Take(targetCount)
                .ToList();

            cache.Set(cacheKey, sorted, SimilarCacheTtl);
            return sorted;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while fetching similar games from RAWG");
            return [];
        }
    }

    private static double CalculateSimilarityScore(CatalogGameDto game, int? originalMetacritic)
    {
        double score = game.Rating * 10.0;
        score += Math.Log10(game.RatingsCount + 1) * 5.0;

        if (originalMetacritic.HasValue && originalMetacritic.Value > 0 && game.Metacritic > 0)
        {
            var metacriticDiff = Math.Abs(game.Metacritic - originalMetacritic.Value);
            score += Math.Max(0, 20 - metacriticDiff);
        }
        else if (game.Metacritic > 0)
        {
            score += game.Metacritic * 0.2;
        }

        if (game.ReleaseYear.HasValue)
        {
            var currentYear = DateTime.UtcNow.Year;
            var yearDiff = Math.Abs(currentYear - game.ReleaseYear.Value);
            if (yearDiff <= 3) score += 10.0;
            else if (yearDiff > 10) score -= 5.0;
        }

        return score;
    }

    private static CatalogGameDto MapJsonElementToGameDto(JsonElement element)
    {
        var dto = new CatalogGameDto();

        if (element.TryGetProperty("id", out var idProp) && idProp.TryGetInt32(out var id))
            dto.Id = id;

        if (element.TryGetProperty("name", out var nameProp))
            dto.Title = nameProp.GetString() ?? string.Empty;

        // Recupero descrizione: preferisci description_raw se presente (prive di tag HTML)
        if (element.TryGetProperty("description_raw", out var descRawProp) && !string.IsNullOrWhiteSpace(descRawProp.GetString()))
            dto.Description = descRawProp.GetString()!;
        else if (element.TryGetProperty("description", out var descProp) && !string.IsNullOrWhiteSpace(descProp.GetString()))
            dto.Description = descProp.GetString()!;
        else
            dto.Description = "Nessuna descrizione disponibile.";

        if (element.TryGetProperty("background_image", out var bgProp) && !string.IsNullOrWhiteSpace(bgProp.GetString()))
            dto.CoverImage = bgProp.GetString()!;
        else
            dto.CoverImage = "/placeholder.svg";

        if (element.TryGetProperty("developers", out var devsProp) && devsProp.ValueKind == JsonValueKind.Array && devsProp.GetArrayLength() > 0)
        {
            var firstDev = devsProp[0];
            if (firstDev.TryGetProperty("name", out var devName))
                dto.Developer = devName.GetString() ?? "Sconosciuto";
        }

        if (element.TryGetProperty("publishers", out var pubsProp) && pubsProp.ValueKind == JsonValueKind.Array && pubsProp.GetArrayLength() > 0)
        {
            var firstPub = pubsProp[0];
            if (firstPub.TryGetProperty("name", out var pubName))
                dto.Publisher = pubName.GetString() ?? "Sconosciuto";
        }

        if (element.TryGetProperty("released", out var relProp) && !string.IsNullOrWhiteSpace(relProp.GetString()))
        {
            if (DateTime.TryParse(relProp.GetString(), CultureInfo.InvariantCulture, DateTimeStyles.None, out var relDate))
                dto.ReleaseYear = relDate.Year;
        }

        if (element.TryGetProperty("genres", out var genresProp) && genresProp.ValueKind == JsonValueKind.Array)
        {
            foreach (var g in genresProp.EnumerateArray())
            {
                if (g.TryGetProperty("name", out var gName) && !string.IsNullOrWhiteSpace(gName.GetString()))
                    dto.Genres.Add(gName.GetString()!);
            }
        }

        if (element.TryGetProperty("metacritic", out var metaProp) && metaProp.ValueKind == JsonValueKind.Number && metaProp.TryGetInt32(out var meta))
            dto.Metacritic = meta > 0 ? meta : 0;

        if (element.TryGetProperty("rating", out var ratingProp) && ratingProp.ValueKind == JsonValueKind.Number && ratingProp.TryGetDouble(out var rating))
            dto.Rating = rating;

        if (element.TryGetProperty("platforms", out var platformsProp) && platformsProp.ValueKind == JsonValueKind.Array)
        {
            foreach (var p in platformsProp.EnumerateArray())
            {
                if (p.TryGetProperty("platform", out var innerPlatform) && innerPlatform.TryGetProperty("name", out var pName) && !string.IsNullOrWhiteSpace(pName.GetString()))
                    dto.Platforms.Add(pName.GetString()!);
            }
        }

        if (element.TryGetProperty("ratings_count", out var ratingsCountProp) && ratingsCountProp.ValueKind == JsonValueKind.Number && ratingsCountProp.TryGetInt32(out var ratingsCount))
            dto.RatingsCount = ratingsCount;

        return dto;
    }
}
