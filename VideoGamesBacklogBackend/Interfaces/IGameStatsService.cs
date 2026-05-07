using VideoGamesBacklogBackend.Dto;

namespace VideoGamesBacklogBackend.Interfaces
{
    public interface IGameStatsService
    {
        Task<GameStatsDto> GetGameStatsAsync(int userId);
        Task<GameStatsDto> GetUserStatsAsync(int userId);
    }
}
