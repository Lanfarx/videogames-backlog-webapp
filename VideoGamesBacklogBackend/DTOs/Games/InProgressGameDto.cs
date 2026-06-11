namespace VideoGamesBacklogBackend.DTOs.Games;

public class InProgressGameDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? CoverImage { get; set; }
    public string? Platform { get; set; }
    public int HoursPlayed { get; set; }
    public decimal Rating { get; set; }
    public string[]? Genres { get; set; }
}
