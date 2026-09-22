using System.Threading;
using VideoGamesBacklogBackend.DTOs.Steam;

namespace VideoGamesBacklogBackend.Interfaces.Steam;

public interface ISteamService
{
    Task<List<SteamGame>> GetSteamGamesAsync(string steamId, CancellationToken cancellationToken = default);
    Task<List<RecentlyPlayedGame>> GetRecentlyPlayedGamesAsync(string steamId, CancellationToken cancellationToken = default);
    Task<SteamSyncResponse> SyncSteamGamesAsync(string steamId, string syncType, int userId, CancellationToken cancellationToken = default);
}