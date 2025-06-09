using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace VideoGamesBacklogBackend.Models
{    public enum ActivityType
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
        public ActivityType Type { get; set; } // Enum per il tipo di attività
                                             
        [ForeignKey("Game")]
        public int GameId { get; set; }
        [JsonIgnore]
        public Game? Game { get; set; }
        public string GameTitle { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? AdditionalInfo { get; set; }        // Navigation property per le reazioni emoji dell'attività
        [JsonIgnore]
        public List<ActivityReaction> Reactions { get; set; } = new List<ActivityReaction>();

        // Navigation property per i commenti all'attività
        [JsonIgnore]
        public List<ActivityComment> ActivityComments { get; set; } = new List<ActivityComment>();
    }    // Modello per le reazioni emoji alle attività (diary entry)
    public class ActivityReaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(10)]
        public string Emoji { get; set; } = string.Empty; // emoji come "👍", "❤️", "🎮", etc.

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key verso l'attività che ha ricevuto la reazione
        [ForeignKey("Activity")]
        public int ActivityId { get; set; }
        [JsonIgnore]
        public Activity? Activity { get; set; }

        // Foreign key verso l'utente che ha messo la reazione
        [ForeignKey("User")]
        public int UserId { get; set; }
        [JsonIgnore]
        public User? User { get; set; }
    }

    // Modello per i commenti alle attività del diario
    public class ActivityComment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Text { get; set; } = string.Empty;

        [Required]
        public string Date { get; set; } = string.Empty;

        // Foreign key verso l'attività commentata
        [ForeignKey("Activity")]
        public int ActivityId { get; set; }
        [JsonIgnore]
        public Activity? Activity { get; set; }

        // Foreign key verso l'utente che ha scritto il commento
        [ForeignKey("Author")]
        public int AuthorId { get; set; }
        [JsonIgnore]
        public User? Author { get; set; }
    }
}
