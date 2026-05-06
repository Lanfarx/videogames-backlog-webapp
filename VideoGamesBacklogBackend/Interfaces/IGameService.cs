using VideoGamesBacklogBackend.Dto;

namespace VideoGamesBacklogBackend.Interfaces
{    public interface IGameService
    {        Task<List<GameDto>> GetAllGamesAsync(int userId);
        Task<PaginatedGamesDto> GetGamesPaginatedAsync(int userId, GameQueryParameters queryParams);
        Task<GameDto?> GetGameByIdAsync(int userId, int gameId);
        Task<GameDto?> GetGameByTitleAsync(int userId, string title);
        Task<object?> GetGamePublicInfoByIdAsync(int gameId, int? currentUserId = null);
        Task<GameDto> AddGameAsync(int userId, CreateGameDto gameDto);
        Task<GameDto?> UpdateGameAsync(int userId, int gameId, UpdateGameDto updateDto);
        Task<GameDto?> UpdateGameStatusAsync(int userId, int gameId, string status);
        Task<GameDto?> UpdateGamePlaytimeAsync(int userId, int gameId, int hoursPlayed);
        Task<bool> DeleteGameAsync(int userId, int gameId);
        Task<int> DeleteAllGamesAsync(int userId);
        Task<GameStatsDto> GetGameStatsAsync(int userId);
        Task<GameStatsDto> GetUserStatsAsync(int userId);
        Task<PaginatedGamesDto> GetInProgressGamesPaginatedAsync(int userId, int page = 1, int pageSize = 6);
        Task<List<GameCommentDto>> GetCommentsAsync(int userId, int gameId);
        Task<GameCommentDto?> AddCommentAsync(int userId, int gameId, CreateGameCommentDto commentDto);
        Task<bool> DeleteCommentAsync(int userId, int gameId, int commentId);
        Task<GameCommentDto?> UpdateCommentAsync(int userId, int gameId, int commentId, CreateGameCommentDto updatedComment);
    }
}
