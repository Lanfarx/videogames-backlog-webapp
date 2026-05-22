using JetBrains.Annotations;
namespace VideoGamesBacklogBackend.DTOs.Games;

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class GameDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Platform { get; set; }
    public int ReleaseYear { get; set; }
    public string[] Genres { get; set; } = [];
    public string Status { get; set; } = string.Empty;
    public string? CoverImage { get; set; }
    public decimal? Price { get; set; }
    public string? PurchaseDate { get; set; }
    public string? Developer { get; set; }
    public string? Publisher { get; set; }
    public string? CompletionDate { get; set; }
    public string? PlatinumDate { get; set; }
    public int HoursPlayed { get; set; }
    public int? Metacritic { get; set; }
    public decimal Rating { get; set; }
    public double? HltbMainExtra { get; set; }
    public double? HltbCompletionist { get; set; }
    public string? Notes { get; set; }
    public GameReviewDto? Review { get; set; }
    public List<GameCommentDto> Comments { get; set; } = [];
    public int UserId { get; set; }
}

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class GameReviewDto
{
    public string Text { get; set; } = string.Empty;
    public decimal Gameplay { get; set; }
    public decimal Graphics { get; set; }
    public decimal Story { get; set; }
    public decimal Sound { get; set; }
    public string Date { get; set; } = string.Empty;
    public bool? IsPublic { get; set; }
}