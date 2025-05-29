using System;

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
        public int GameId { get; set; }
        public Game? Game { get; set; } // Navigation property verso il gioco
        public string GameTitle { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? AdditionalInfo { get; set; }
        // Non serve più UserId/User: l'attività è collegata al gioco, che è collegato all'utente
    }
}
