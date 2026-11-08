using VideoGamesBacklogBackend.DTOs.Games;

namespace VideoGamesBacklogBackend.Interfaces.Games;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardAsync(int userId);
}
