using System.Threading;
using VideoGamesBacklogBackend.DTOs.Steam;

namespace VideoGamesBacklogBackend.Interfaces.Steam;

public interface ISteamService
{
    Task<List<SteamGame>> GetSteamGamesAsync(string steamId, CancellationToken cancellationToken = default);
    Task<List<RecentlyPlayedGame>> GetRecentlyPlayedGamesAsync(string steamId, CancellationToken cancellationToken = default);
    Task<SteamSyncResponse> SyncSteamGamesAsync(int userId, CancellationToken cancellationToken = default);
    Task<List<SteamCandidateDto>> GetCandidatesAsync(int userId, bool ignored, CancellationToken cancellationToken = default);
    Task<int> ImportGamesAsync(int userId, List<SteamImportItem> items, CancellationToken cancellationToken = default);
    Task SetIgnoredAsync(int userId, List<int> appIds, bool ignored, CancellationToken cancellationToken = default);
}
