using VideoGamesBacklogBackend.DTOs.Catalog;

namespace VideoGamesBacklogBackend.Interfaces.Catalog;

public interface ICatalogService
{
    Task<CatalogSearchResultDto> SearchGamesAsync(string query, CancellationToken cancellationToken = default);
    Task<CatalogGameDto?> GetGameDetailsAsync(string gameId, CancellationToken cancellationToken = default);
    Task<CatalogSearchResultDto> GetPaginatedGamesAsync(int page, int pageSize, string? search, string? ordering, string? platforms, CancellationToken cancellationToken = default);
    Task<List<CatalogGameDto>> GetSimilarGamesAsync(List<int> genreIds, int excludeId, int count, int? metacritic, CancellationToken cancellationToken = default);
}
