using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace VideoGamesBacklogBackend.Models
{
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
        public List<ActivityReaction> Reactions { get; set; } = new List<ActivityReaction>();
        [JsonIgnore]
        public List<ActivityComment> ActivityComments { get; set; } = new List<ActivityComment>();
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

    public class ActivityComment
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Text { get; set; } = string.Empty;
        [Required]
        public string Date { get; set; } = string.Empty;
        [ForeignKey("Activity")]
        public int ActivityId { get; set; }
        [JsonIgnore]
        public Activity? Activity { get; set; }
        [ForeignKey("Author")]
        public int AuthorId { get; set; }
        [JsonIgnore]
        public User? Author { get; set; }
    }
}
