using System.Text.Json;

namespace VideoGamesBacklogBackend.Interfaces
{
    public interface IRawgService
    {
        Task<JsonElement> GetGamesAsync(Dictionary<string, object> parameters);

        Task<JsonElement> GetGameDetailsAsync(string gameId);

        Task<JsonElement> SearchGamesAsync(string query, string? platforms = null);

        Task<JsonElement> GetPaginatedGamesAsync(
            int page = 1, 
            int pageSize = 20, 
            Dictionary<string, object>? extraParams = null
        );

        Task<JsonElement> GetSimilarGamesAsync(
            string genreIds,
            int excludeId,
            int count = 4,
            int? metacritic = null
        );

        Task<JsonElement> GetPlatformsAsync();

        Task<JsonElement> GetGenresAsync();
    }
}