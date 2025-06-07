using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace VideoGamesBacklogBackend.Models
{
    public enum GameStatus
    {
        [System.ComponentModel.DataAnnotations.Display(Name = "NotStarted")]
        NotStarted,
        [System.ComponentModel.DataAnnotations.Display(Name = "InProgress")]
        InProgress,
        [System.ComponentModel.DataAnnotations.Display(Name = "Completed")]
        Completed,
        [System.ComponentModel.DataAnnotations.Display(Name = "Abandoned")]
        Abandoned,
        [System.ComponentModel.DataAnnotations.Display(Name = "Platinum")]
        Platinum
    }

    public class Game
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;
        public string? Platform { get; set; } = string.Empty;
        public int ReleaseYear { get; set; }
        public string[] Genres { get; set; } = Array.Empty<string>();

        [Required]
        [Column(TypeName = "varchar(20)")]
        [JsonConverter(typeof(JsonStringEnumConverter))]
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
        public int Metacritic { get; set; }        // Inizializza il Rating a 0
        public decimal Rating { get; set; } = 0;

        public string? Notes { get; set; }
        public GameReview? Review { get; set; }

        public List<GameComment> Comments { get; set; } = new List<GameComment>();

        // Foreign key per l'utente proprietario
        [ForeignKey("User")]
        public int UserId { get; set; }
        [JsonIgnore] // Evita il loop di serializzazione
        public User? User { get; set; }

        // Relazione uno-a-molti: un gioco ha molte attivit�
        public List<Activity> Activities { get; set; } = new List<Activity>();
    }    
    
    [Owned]
    public class GameReview
    {
        public string Text { get; set; } = string.Empty;
        public decimal Gameplay { get; set; }
        public decimal Graphics { get; set; }
        public decimal Story { get; set; }
        public decimal Sound { get; set; }
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
        [JsonIgnore]
        public Game? Game { get; set; }
    }
}
