// ReSharper disable EntityFramework.ModelValidation.UnlimitedStringLength
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace VideoGamesBacklogBackend.Entities;

public enum ActivityType
{
    Played,
    Completed,
    Added,
    Rated,
    Platinum,
    Abandoned
}

public class Activity
{
    public int Id { get; set; }
    public ActivityType Type { get; set; }

    [ForeignKey("Game")]
    public int GameId { get; set; }
    [JsonIgnore]
    public Game? Game { get; set; }

    public string GameTitle { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? AdditionalInfo { get; set; }

    [JsonIgnore]
    public List<ActivityReaction> Reactions { get; set; } = [];
    [JsonIgnore]
    public List<ActivityComment> ActivityComments { get; set; } = [];
}

public class ActivityReaction
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(10)]
    public string Emoji { get; set; } = string.Empty;

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("Activity")]
    public int ActivityId { get; set; }
    [JsonIgnore]
    public Activity? Activity { get; set; }

    [ForeignKey("User")]
    public int UserId { get; set; }
    [JsonIgnore]
    
    public User? User { get; set; }
}

/// <summary>
/// Commento di un utente su un'attività nel diario.
/// </summary>
public class ActivityComment : BaseComment
{
    [ForeignKey("Activity")]
    public int ActivityId { get; set; }
    [JsonIgnore]
    public Activity? Activity { get; set; }

    [ForeignKey("Author")]
    public int AuthorId { get; set; }
    [JsonIgnore]
    public User? Author { get; set; }
}