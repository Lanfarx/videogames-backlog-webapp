namespace VideoGamesBacklogBackend.Models.auth
{
    public class RegisterModel
    {
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Tags { get; set; } // piattaforma preferita e genere preferito, separati da virgola
    }
}
