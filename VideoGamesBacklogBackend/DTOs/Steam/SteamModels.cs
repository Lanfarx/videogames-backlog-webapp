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

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class SteamSyncRequest
{
    public string SteamId { get; set; } = string.Empty;
    public string SyncType { get; set; } = string.Empty; // "initial_load" o "update_hours"
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
    public object? DebugInfo { get; set; }
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