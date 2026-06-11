using VideoGamesBacklogBackend.Common.DTOs.Pagination;
using VideoGamesBacklogBackend.DTOs.Games;
using VideoGamesBacklogBackend.DTOs.Games.Update;

namespace VideoGamesBacklogBackend.Interfaces.Games;

public interface IGameService
{        Task<List<GameDto>> GetAllGamesAsync(int userId);
    Task<PaginatedResult<GameDto>> GetGamesPaginatedAsync(int userId, GameQueryParameters queryParams);
    Task<GameDto?> GetGameByIdAsync(int userId, int gameId);
    Task<GameDto?> GetGameByTitleAsync(int userId, string title);
    Task<GamePublicInfoDto?> GetGamePublicInfoByIdAsync(int gameId, int? currentUserId = null);
    Task<GameDto> AddGameAsync(int userId, CreateGameDto gameDto);
    Task<List<GameDto>> AddGamesBulkAsync(int userId, List<CreateGameDto> gamesDto);
    Task<GameDto?> UpdateGameAsync(int userId, int gameId, UpdateGameDto updateDto);
    Task UpdateGamesPlaytimeBulkAsync(int userId, List<(int GameId, int HoursPlayed)> updates);
    Task<GameDto?> UpdateGameStatusAsync(int userId, int gameId, string status);
    Task<GameDto?> UpdateGamePlaytimeAsync(int userId, int gameId, int hoursPlayed);
    Task<bool> DeleteGameAsync(int userId, int gameId);
    Task<int> DeleteAllGamesAsync(int userId);
    Task<PaginatedResult<InProgressGameDto>> GetInProgressGamesPaginatedAsync(int userId, PaginationQueryParameters queryParams);

}