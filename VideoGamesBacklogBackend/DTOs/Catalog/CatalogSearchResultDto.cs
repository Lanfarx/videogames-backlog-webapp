using System.Text.Json.Serialization;

namespace VideoGamesBacklogBackend.DTOs.Catalog;

public class CatalogSearchResultDto
{
    [JsonPropertyName("count")]
    public int Count { get; set; }

    [JsonPropertyName("results")]
    public List<CatalogGameDto> Results { get; set; } = [];
}
