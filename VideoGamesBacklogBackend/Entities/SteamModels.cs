namespace VideoGamesBacklogBackend.Entities
{
    public class SteamGame
    {
        public int appid { get; set; }
        public string name { get; set; } = string.Empty;
        public int playtime_forever { get; set; }
        public string? img_icon_url { get; set; }
        public string? img_logo_url { get; set; }
    }

    /// <summary>
    /// Estende SteamGame aggiungendo il tempo di gioco nelle ultime 2 settimane.
    /// </summary>
    public class RecentlyPlayedGame : SteamGame
    {
        public int playtime_2weeks { get; set; }
    }

    public class SteamGamesResponse
    {
        public SteamGameData response { get; set; } = new();
    }

    public class SteamGameData
    {
        public int game_count { get; set; }
        public List<SteamGame> games { get; set; } = [];
    }

    public class SteamSyncRequest
    {
        public string SteamId { get; set; } = string.Empty;
        public string SyncType { get; set; } = string.Empty; // "initial_load" o "update_hours"
    }

    public class UpdatedGameInfo
    {
        public string GameTitle { get; set; } = string.Empty;
        public int PreviousHours { get; set; }
        public int NewHours { get; set; }
        public int HoursAdded { get; set; }
        public bool StatusChanged { get; set; }
        public string? PreviousStatus { get; set; }
        public string? NewStatus { get; set; }
    }

    public class SteamSyncResponse
    {
        public string Message { get; set; } = string.Empty;
        public int Count { get; set; }
        public List<UpdatedGameInfo> UpdatedGames { get; set; } = [];
        public object? DebugInfo { get; set; }
    }

    public class RecentlyPlayedGamesResponse
    {
        public RecentlyPlayedGameData response { get; set; } = new();
    }

    public class RecentlyPlayedGameData
    {
        public int total_count { get; set; }
        public List<RecentlyPlayedGame> games { get; set; } = [];
    }
}
