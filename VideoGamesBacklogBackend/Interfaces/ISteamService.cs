using VideoGamesBacklogBackend.Entities;

namespace VideoGamesBacklogBackend.Interfaces;

public interface ISteamService
{
    Task<List<SteamGame>> GetSteamGamesAsync(string steamId);
    Task<List<RecentlyPlayedGame>> GetRecentlyPlayedGamesAsync(string steamId);
    Task<SteamSyncResponse> SyncSteamGamesAsync(string steamId, string syncType, int userId);
}