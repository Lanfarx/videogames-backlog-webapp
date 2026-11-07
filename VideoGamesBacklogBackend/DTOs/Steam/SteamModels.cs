using System.Text.Json.Serialization;
using JetBrains.Annotations;
namespace VideoGamesBacklogBackend.DTOs.Steam;

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class SteamGame
{
    public int Appid { get; set; }
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("playtime_forever")]
    public int PlaytimeForever { get; set; }
    
    // Unix time dell'ultima sessione, 0 se mai giocato (solo GetOwnedGames lo valorizza)
    [JsonPropertyName("rtime_last_played")]
    public long RtimeLastPlayed { get; set; }

    [JsonPropertyName("img_icon_url")]
    public string? ImgIconUrl { get; set; }
    
    [JsonPropertyName("img_logo_url")]
    public string? ImgLogoUrl { get; set; }
}

/// <summary>
/// Estende SteamGame aggiungendo il tempo di gioco nelle ultime 2 settimane.
/// </summary>
[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class RecentlyPlayedGame : SteamGame
{
    [JsonPropertyName("playtime_2weeks")]
    public int Playtime2Weeks { get; set; }
}

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class SteamGamesResponse
{
    public SteamGameData Response { get; set; } = new();
}

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class SteamGameData
{
    public int GameCount { get; set; }
    public List<SteamGame> Games { get; set; } = [];
}

/// <summary>
/// Gioco posseduto su Steam che non è in libreria: da importare o ignorare.
/// </summary>
[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class SteamCandidateDto
{
    public int AppId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CoverImage { get; set; } = string.Empty;
    public int HoursPlayed { get; set; }
    public DateTime? LastPlayedAt { get; set; }
    public string SuggestedStatus { get; set; } = string.Empty;
}

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class SteamImportItem
{
    public int AppId { get; set; }
    public string Status { get; set; } = string.Empty;
}

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class PlayerAchievementsResponse
{
    public PlayerStats Playerstats { get; set; } = new();
}

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class PlayerStats
{
    public List<PlayerAchievement> Achievements { get; set; } = [];
}

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class PlayerAchievement
{
    public int Achieved { get; set; }
}

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
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

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class SteamSyncResponse
{
    public string Message { get; set; } = string.Empty;
    public int Count { get; set; }
    public List<UpdatedGameInfo> UpdatedGames { get; set; } = [];
    // Giochi posseduti, non in libreria e giocati di recente: il badge "nuovi" della libreria
    public int PendingCount { get; set; }
    public string? Warning { get; set; }
}

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class RecentlyPlayedGamesResponse
{
    public RecentlyPlayedGameData Response { get; set; } = new();
}

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class RecentlyPlayedGameData
{
    public int TotalCount { get; set; }
    public List<RecentlyPlayedGame> Games { get; set; } = [];
}