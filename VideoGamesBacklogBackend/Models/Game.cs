using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VideoGamesBacklogBackend.Models
{
    public enum GameStatus
    {
        [System.ComponentModel.DataAnnotations.Display(Name = "not-started")]
        NotStarted,
        [System.ComponentModel.DataAnnotations.Display(Name = "in-progress")]
        InProgress,
        [System.ComponentModel.DataAnnotations.Display(Name = "completed")]
        Completed,
        [System.ComponentModel.DataAnnotations.Display(Name = "abandoned")]
        Abandoned,
        [System.ComponentModel.DataAnnotations.Display(Name = "platinum")]
        Platinum
    }

    public class Game
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;
        [Required]
        public string Platform { get; set; } = string.Empty;
        public int ReleaseYear { get; set; }
        public string[] Genres { get; set; } = Array.Empty<string>();

        [Required]
        [Column(TypeName = "varchar(20)")]
        public GameStatus Status { get; set; } = GameStatus.NotStarted;

        public string? CoverImage { get; set; }
        public decimal Price { get; set; }

        // Inizializza la data di acquisto alla data attuale (formato ISO)
        public string? PurchaseDate { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd");

        public string? Developer { get; set; }
        public string? Publisher { get; set; }
        public string? CompletionDate { get; set; }
        public string? PlatinumDate { get; set; }
        public int HoursPlayed { get; set; }
        public int Metacritic { get; set; }

        // Inizializza il rating a 0
        public int Rating { get; set; } = 0;

        public string? Notes { get; set; }
        public GameReview? Review { get; set; }
        public List<GameComment> Comments { get; set; } = new List<GameComment>();

        // Foreign key per l'utente proprietario
        [ForeignKey("User")]
        public int UserId { get; set; }
        public User? User { get; set; }

        // Relazione uno-a-molti: un gioco ha molte attività
        public List<Activity> Activities { get; set; } = new List<Activity>();
    }

    [Owned]
    public class GameReview
    {
        public string Text { get; set; } = string.Empty;
        public int Gameplay { get; set; }
        public int Graphics { get; set; }
        public int Story { get; set; }
        public int Sound { get; set; }
        public string Date { get; set; } = string.Empty;
        public bool? IsPublic { get; set; }
    }

    public class GameComment
    {
        [Key]
        public int Id { get; set; }
        public string Date { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;

        // Foreign key verso Game
        [ForeignKey("Game")]
        public int GameId { get; set; }
        public Game? Game { get; set; }
    }
}
