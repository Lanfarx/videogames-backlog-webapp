namespace VideoGamesBacklogBackend.DTOs.Catalog;

public class CatalogSearchResultDto
{
    public int Count { get; set; }
    public List<CatalogGameDto> Results { get; set; } = [];
}
