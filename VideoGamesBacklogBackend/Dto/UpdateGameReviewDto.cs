namespace VideoGamesBacklogBackend.Dto
{
    public class UpdateGameReviewDto
    {
        public string? Text { get; set; }
        public decimal? Gameplay { get; set; }
        public decimal? Graphics { get; set; }
        public decimal? Story { get; set; }
        public decimal? Sound { get; set; }
        public string? Date { get; set; }
        public bool? IsPublic { get; set; }
    }
}
