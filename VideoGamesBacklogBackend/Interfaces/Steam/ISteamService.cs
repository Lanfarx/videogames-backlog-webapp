using VideoGamesBacklogBackend.DTOs.Steam;

namespace VideoGamesBacklogBackend.Interfaces.Steam;

public interface ISteamService
{
    Task<List<SteamGame>> GetSteamGamesAsync(string steamId);
    Task<List<RecentlyPlayedGame>> GetRecentlyPlayedGamesAsync(string steamId);
    Task<SteamSyncResponse> SyncSteamGamesAsync(string steamId, string syncType, int userId);
}