namespace VideoGamesBacklogBackend.Dto
{
    public class GameCommentDto
    {
        public int Id { get; set; }
        public string Date { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public int GameId { get; set; }
    }

    public class CreateGameCommentDto
    {
        public string Date { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
    }
}
