using System.Text.Json;
using VideoGamesBacklogBackend.Interfaces;

namespace VideoGamesBacklogBackend.Services
{
    public class RawgService : IRawgService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _baseUrl;

        public RawgService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["RAWG_API_KEY"] ?? 
                     Environment.GetEnvironmentVariable("RAWG_API_KEY") ?? 
                     throw new InvalidOperationException("RAWG API key not found in configuration");
            _baseUrl = "https://api.rawg.io/api";
        }

        public async Task<JsonElement> GetGamesAsync(Dictionary<string, object> parameters)
        {
            var queryParams = new List<string> { $"key={_apiKey}" };

            foreach (var param in parameters)
            {
                if (param.Value != null)
                {
                    queryParams.Add($"{param.Key}={Uri.EscapeDataString(param.Value.ToString()!)}");
                }
            }

            var url = $"{_baseUrl}/games?{string.Join("&", queryParams)}";
            
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(content);
        }

        public async Task<JsonElement> GetGameDetailsAsync(string gameId)
        {
            var url = $"{_baseUrl}/games/{gameId}?key={_apiKey}";
            
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(content);
        }

        public async Task<JsonElement> SearchGamesAsync(string query, string? platforms = null)
        {
            var parameters = new List<string>
            {
                $"key={_apiKey}",
                $"search={Uri.EscapeDataString(query)}"
            };

            if (!string.IsNullOrEmpty(platforms))
                parameters.Add($"platforms={platforms}");

            var url = $"{_baseUrl}/games?{string.Join("&", parameters)}";
            
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(content);
        }

        public async Task<JsonElement> GetPaginatedGamesAsync(
            int page = 1, 
            int pageSize = 20, 
            Dictionary<string, object>? extraParams = null)
        {
            var parameters = new List<string>
            {
                $"key={_apiKey}",
                $"page={page}",
                $"page_size={pageSize}"
            };

            if (extraParams != null)
            {
                foreach (var param in extraParams)
                {
                    if (param.Value != null)
                    {
                        parameters.Add($"{param.Key}={Uri.EscapeDataString(param.Value.ToString()!)}");
                    }
                }
            }

            var url = $"{_baseUrl}/games?{string.Join("&", parameters)}";
            
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(content);
        }

        public async Task<JsonElement> GetSimilarGamesAsync(
            string genreIds,
            int excludeId,
            int count = 4,
            int? metacritic = null)
        {
            var parameters = new List<string>
            {
                $"key={_apiKey}",
                $"genres={genreIds}",
                "exclude_additions=true",
                "ordering=-rating,-metacritic,-released",
                $"page_size={Math.Min(40, count * 3)}",
                "platforms=1,4,7,18,22,186,187",
                $"dates=2000-01-01,{DateTime.Now:yyyy-MM-dd}"
            };

            // Filtro Metacritic più intelligente
            if (metacritic.HasValue && metacritic > 0)
            {
                var range = metacritic > 80 ? 15 : metacritic > 60 ? 20 : 25;
                var minScore = Math.Max(0, metacritic.Value - range);
                var maxScore = Math.Min(100, metacritic.Value + range);
                parameters.Add($"metacritic={minScore},{maxScore}");
            }
            else
            {
                parameters.Add("metacritic=60,100");
            }

            var url = $"{_baseUrl}/games?{string.Join("&", parameters)}";
            
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var jsonElement = JsonSerializer.Deserialize<JsonElement>(content);

            // Filtra e processa i risultati come nel frontend
            if (jsonElement.TryGetProperty("results", out var results))
            {
                var filteredResults = new List<JsonElement>();
                
                foreach (var game in results.EnumerateArray())
                {
                    if (ShouldIncludeGame(game, excludeId))
                    {
                        filteredResults.Add(game);
                    }
                }

                // Prendi solo il numero richiesto
                var limitedResults = filteredResults.Take(count).ToArray();

                // Ricostruisci l'oggetto JSON con i risultati filtrati
                var filteredResponse = JsonSerializer.Serialize(new
                {
                    results = limitedResults
                });

                return JsonSerializer.Deserialize<JsonElement>(filteredResponse);
            }

            return jsonElement;
        }

        private bool ShouldIncludeGame(JsonElement game, int excludeId)
        {
            // Controlla ID
            if (game.TryGetProperty("id", out var id) && id.GetInt32() == excludeId)
                return false;

            // Controlla che abbia nome
            if (!game.TryGetProperty("name", out var name) || string.IsNullOrEmpty(name.GetString()))
                return false;

            // Controlla che abbia immagine
            if (!game.TryGetProperty("background_image", out var bgImage) || string.IsNullOrEmpty(bgImage.GetString()))
                return false;

            // Controlla data di rilascio
            if (!game.TryGetProperty("released", out var released) || string.IsNullOrEmpty(released.GetString()))
                return false;

            // Controlla rating minimo
            if (game.TryGetProperty("rating", out var rating) && rating.GetDouble() < 3.5)
                return false;

            // Controlla numero di recensioni
            if (game.TryGetProperty("ratings_count", out var ratingsCount) && ratingsCount.GetInt32() < 10)
                return false;

            // Filtra DLC e espansioni
            var gameName = name.GetString()?.ToLower() ?? "";
            if (gameName.Contains("dlc") || gameName.Contains("expansion") || gameName.Contains("season pass"))
                return false;

            return true;
        }

        public async Task<JsonElement> GetPlatformsAsync()
        {
            var url = $"{_baseUrl}/platforms?key={_apiKey}";
            
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(content);
        }

        public async Task<JsonElement> GetGenresAsync()
        {
            var url = $"{_baseUrl}/genres?key={_apiKey}";
            
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(content);
        }
    }
}