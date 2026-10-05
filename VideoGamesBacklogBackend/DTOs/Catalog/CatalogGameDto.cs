using System.Text.Json.Serialization;

namespace VideoGamesBacklogBackend.DTOs.Catalog;

public class CatalogGameDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("Title")]
    public string Title { get; set; } = string.Empty;

    // Supporto camelCase e compatibilità proprietà native RAWG
    [JsonPropertyName("title")]
    public string TitleCamel => Title;

    [JsonPropertyName("name")]
    public string Name => Title;

    [JsonPropertyName("Description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string DescriptionCamel => Description;

    [JsonPropertyName("description_raw")]
    public string DescriptionRaw => Description;

    [JsonPropertyName("CoverImage")]
    public string CoverImage { get; set; } = string.Empty;

    [JsonPropertyName("coverImage")]
    public string CoverImageCamel => CoverImage;

    [JsonPropertyName("background_image")]
    public string BackgroundImage => CoverImage;

    [JsonPropertyName("Developer")]
    public string Developer { get; set; } = "Sconosciuto";

    [JsonPropertyName("Publisher")]
    public string Publisher { get; set; } = "Sconosciuto";

    [JsonPropertyName("ReleaseYear")]
    public int? ReleaseYear { get; set; }

    [JsonPropertyName("releaseYear")]
    public int? ReleaseYearCamel => ReleaseYear;

    [JsonPropertyName("released")]
    public string? Released => ReleaseYear.HasValue ? $"{ReleaseYear}-01-01" : null;

    [JsonPropertyName("Genres")]
    public List<string> Genres { get; set; } = [];

    [JsonPropertyName("genres")]
    public List<string> GenresCamel => Genres;

    [JsonPropertyName("Metacritic")]
    public int Metacritic { get; set; }

    [JsonPropertyName("metacritic")]
    public int MetacriticCamel => Metacritic;

    [JsonPropertyName("Rating")]
    public double Rating { get; set; }

    [JsonPropertyName("rating")]
    public double RatingCamel => Rating;

    [JsonPropertyName("Platforms")]
    public List<string> Platforms { get; set; } = [];

    [JsonPropertyName("platforms")]
    public List<string> PlatformsCamel => Platforms;

    [JsonPropertyName("RatingsCount")]
    public int RatingsCount { get; set; }

    [JsonPropertyName("ratingsCount")]
    public int RatingsCountCamel => RatingsCount;

    [JsonPropertyName("ratings_count")]
    public int RawgRatingsCount => RatingsCount;
}
