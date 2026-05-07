using VideoGamesBacklogBackend.Dto;

namespace VideoGamesBacklogBackend.Interfaces
{
    public interface IGameCommentService
    {
        Task<List<GameCommentDto>> GetCommentsAsync(int userId, int gameId);
        Task<GameCommentDto?> AddCommentAsync(int userId, int gameId, CreateGameCommentDto commentDto);
        Task<bool> DeleteCommentAsync(int userId, int gameId, int commentId);
        Task<GameCommentDto?> UpdateCommentAsync(int userId, int gameId, int commentId, CreateGameCommentDto updatedComment);
    }
}
