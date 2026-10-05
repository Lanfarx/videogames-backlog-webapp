namespace VideoGamesBacklogBackend.DTOs.Catalog;

public class CatalogGameDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CoverImage { get; set; } = string.Empty;
    public string Developer { get; set; } = "Sconosciuto";
    public string Publisher { get; set; } = "Sconosciuto";
    public int? ReleaseYear { get; set; }
    public List<string> Genres { get; set; } = [];
    public int Metacritic { get; set; }
    public double Rating { get; set; }
    public List<string> Platforms { get; set; } = [];
    public int RatingsCount { get; set; }
}
