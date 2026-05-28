using JetBrains.Annotations;
// ReSharper disable EntityFramework.ModelValidation.UnlimitedStringLength
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace VideoGamesBacklogBackend.Entities;

public enum GameStatus
{
    [Display(Name = "NotStarted")]
    NotStarted,

    [Display(Name = "InProgress")]
    InProgress,

    [Display(Name = "Completed")]
    Completed,

    [Display(Name = "Abandoned")]
    Abandoned,

    [Display(Name = "Platinum")]
    Platinum
}

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class Game : IUserOwnedEntity
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;
    public string NormalizedTitle { get; set; } = string.Empty;
    public string? Platform { get; set; } = string.Empty;
    public int ReleaseYear { get; set; }
    public string[] Genres { get; set; } = [];

    [Required]
    [Column(TypeName = "varchar(20)")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public GameStatus Status { get; set; } = GameStatus.NotStarted;

    public string? CoverImage { get; set; }
    public decimal? Price { get; set; }

    // Inizializza la data di acquisto alla data attuale (formato ISO)
    public DateOnly? PurchaseDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);

    public string? Developer { get; set; }
    public string? Publisher { get; set; }
    public DateOnly? CompletionDate { get; set; }
    public DateOnly? PlatinumDate { get; set; }

    public int HoursPlayed { get; set; }
    public int? Metacritic { get; set; }
    public decimal Rating { get; set; }

    // HowLongToBeat - Tempi stimati di completamento (in ore)
    public double? HltbMainExtra { get; set; }
    public double? HltbCompletionist { get; set; }

    public string? Notes { get; set; }
    public GameReview? Review { get; set; }

    public List<GameComment> Comments { get; set; } = [];

    // Relazione uno-a-molti: un gioco può ricevere molti commenti sulla sua recensione
    public List<ReviewComment> ReviewComments { get; set; } = [];

    // Foreign key per l'utente proprietario (IUserOwnedEntity)
    [ForeignKey("User")]
    public int UserId { get; set; }
    [JsonIgnore]
    public User? User { get; set; }

    // Relazione uno-a-molti: un gioco ha molte attività
    public List<Activity> Activities { get; set; } = [];
}

[Owned]
[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class GameReview
{
    public string Text { get; set; } = string.Empty;
    public decimal Gameplay { get; set; }
    public decimal Graphics { get; set; }
    public decimal Story { get; set; }
    public decimal Sound { get; set; }
    public DateTime? Date { get; set; } = DateTime.UtcNow;
    public bool? IsPublic { get; set; }
}

/// <summary>
/// Commento personale dell'utente su un gioco nella propria libreria.
/// </summary>
[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class GameComment : BaseComment
{
    [ForeignKey("Game")]
    public int GameId { get; set; }
    [JsonIgnore]
    public Game? Game { get; set; }
}

/// <summary>
/// Commento di un utente sulla recensione pubblica di un altro utente.
/// </summary>
[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class ReviewComment : BaseComment
{
    // Foreign key verso la recensione del gioco
    [ForeignKey("ReviewGame")]
    public int ReviewGameId { get; set; }
    [JsonIgnore]
    public Game? ReviewGame { get; set; }

    // Foreign key verso l'utente che ha scritto il commento
    [ForeignKey("Author")]
    public int AuthorId { get; set; }
    [JsonIgnore]
    public User? Author { get; set; }
}