namespace VideoGamesBacklogBackend.Models
{
    public class SteamGame
    {
        public int appid { get; set; }
        public string name { get; set; } = string.Empty;
        public int playtime_forever { get; set; }
        public string? img_icon_url { get; set; }
        public string? img_logo_url { get; set; }
    }

    public class SteamGamesResponse
    {
        public SteamGameData response { get; set; } = new();
    }

    public class SteamGameData
    {
        public int game_count { get; set; }
        public List<SteamGame> games { get; set; } = new();
    }

    public class SteamSyncRequest
    {
        public string SteamId { get; set; } = string.Empty;
        public string SyncType { get; set; } = string.Empty; // "initial_load" o "update_hours"
    }    public class SteamSyncResponse
    {
        public string Message { get; set; } = string.Empty;
        public int Count { get; set; }
        public object? DebugInfo { get; set; } // Per informazioni di debug
    }

    // Nuovo modello per i giochi giocati di recente
    public class RecentlyPlayedGame
    {
        public int appid { get; set; }
        public string name { get; set; } = string.Empty;
        public int playtime_2weeks { get; set; }
        public int playtime_forever { get; set; }
        public string? img_icon_url { get; set; }
        public string? img_logo_url { get; set; }
    }

    // Nuovo response per i giochi giocati di recente
    public class RecentlyPlayedGamesResponse
    {
        public RecentlyPlayedGameData response { get; set; } = new();
    }

    public class RecentlyPlayedGameData
    {
        public int total_count { get; set; }
        public List<RecentlyPlayedGame> games { get; set; } = new();
    }
}
