using VideoGamesBacklogBackend.DTOs.Games;

namespace VideoGamesBacklogBackend.Interfaces.Games;

public interface IGameStatsService
{
    Task<GameStatsDto> GetGameStatsAsync(int userId);
    Task<GameStatsDto> GetUserStatsAsync(int userId);
}