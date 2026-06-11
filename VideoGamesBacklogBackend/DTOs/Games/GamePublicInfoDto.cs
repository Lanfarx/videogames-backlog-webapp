using VideoGamesBacklogBackend.DTOs.Games.Update;

namespace VideoGamesBacklogBackend.DTOs.Games;

public class GamePublicInfoDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Platform { get; set; }
    public int ReleaseYear { get; set; }
    public string? CoverImage { get; set; }
    public string? Developer { get; set; }
    public string? Publisher { get; set; }
    public int UserId { get; set; }
    public GamePublicReviewDto? Review { get; set; }
}

public class GamePublicReviewDto
{
    public string? Text { get; set; }
    public decimal? Gameplay { get; set; }
    public decimal? Graphics { get; set; }
    public decimal? Story { get; set; }
    public decimal? Sound { get; set; }
    public DateTime? Date { get; set; }
    public bool? IsPublic { get; set; }
}

