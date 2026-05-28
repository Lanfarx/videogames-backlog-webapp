using JetBrains.Annotations;
namespace VideoGamesBacklogBackend.DTOs.Games.Update;

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class UpdateGameDto
{
    public string? Title { get; set; }
    public string? Platform { get; set; }
    public int? ReleaseYear { get; set; }
    public string[]? Genres { get; set; }
    public string? CoverImage { get; set; }
    public decimal? Price { get; set; }
    public DateOnly? PurchaseDate { get; set; }
    public string? Developer { get; set; }
    public string? Publisher { get; set; }
    public DateOnly? CompletionDate { get; set; }
    public DateOnly? PlatinumDate { get; set; }
    public int? Metacritic { get; set; }        
    public decimal? Rating { get; set; }
    public string? Notes { get; set; }
    public UpdateGameReviewDto? Review { get; set; }
    public string? Status { get; set; }
    public int? HoursPlayed { get; set; }
    public double? HltbMain { get; set; }
    public double? HltbMainExtra { get; set; }
    public double? HltbCompletionist { get; set; }
}