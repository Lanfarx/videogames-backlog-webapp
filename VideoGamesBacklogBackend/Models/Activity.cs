using System;
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
        public ActivityType Type { get; set; } // Enum per il tipo di attività
                                             
        [ForeignKey("Game")]
        public int GameId { get; set; }
        [JsonIgnore]
        public Game? Game { get; set; }
        public string GameTitle { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? AdditionalInfo { get; set; }
    }
}
