namespace VideoGamesBacklogBackend.Dto
{    public class WishlistDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? CoverImage { get; set; }
        public int ReleaseYear { get; set; }
        public string[] Genres { get; set; } = Array.Empty<string>();
        public int Metacritic { get; set; }
        public string AddedDate { get; set; } = string.Empty;
        public int RawgId { get; set; }
        public string? Notes { get; set; }
        public int UserId { get; set; }
    }

    public class AddToWishlistDto
    {
        public string Title { get; set; } = string.Empty;
        public string? CoverImage { get; set; }
        public int ReleaseYear { get; set; }
        public string[] Genres { get; set; } = Array.Empty<string>();
        public int Metacritic { get; set; }
        public int RawgId { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateWishlistNotesDto
    {
        public string? Notes { get; set; }
    }
}
