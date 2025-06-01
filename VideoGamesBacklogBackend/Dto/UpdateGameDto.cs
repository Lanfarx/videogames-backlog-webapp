using VideoGamesBacklogBackend.Models;

namespace VideoGamesBacklogBackend.Dto
{
    public class UpdateGameDto
    {
        public string? Title { get; set; }
        public string? Platform { get; set; }
        public int? ReleaseYear { get; set; }
        public string[]? Genres { get; set; }
        public string? CoverImage { get; set; }
        public decimal? Price { get; set; }
        public string? PurchaseDate { get; set; }
        public string? Developer { get; set; }
        public string? Publisher { get; set; }
        public string? CompletionDate { get; set; }
        public string? PlatinumDate { get; set; }
        public int? Metacritic { get; set; }        
        public decimal? Rating { get; set; }
        public string? Notes { get; set; }
        public UpdateGameReviewDto? Review { get; set; }
        public string? Status { get; set; }
        public int? HoursPlayed { get; set; }
    }
}

