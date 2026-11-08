using VideoGamesBacklogBackend.DTOs.Games;

namespace VideoGamesBacklogBackend.Interfaces.Games;

public interface IGameStatsService
{
    Task<GameStatsDto> GetUserStatsAsync(int userId);
}