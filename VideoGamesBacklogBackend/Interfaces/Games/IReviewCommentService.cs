using VideoGamesBacklogBackend.DTOs.Social;

namespace VideoGamesBacklogBackend.Interfaces.Games
{
    public interface IReviewCommentService
    {
        Task<List<ReviewCommentDto>> GetReviewCommentsAsync(int reviewGameId);
        Task<ReviewCommentDto?> AddReviewCommentAsync(CreateReviewCommentDto createCommentDto, int authorId);
        Task<bool> DeleteReviewCommentAsync(int commentId, int userId);
    }
}
