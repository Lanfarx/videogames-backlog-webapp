using VideoGamesBacklogBackend.Dto;

namespace VideoGamesBacklogBackend.Interfaces
{
    public interface IReviewCommentService
    {
        Task<List<ReviewCommentDto>> GetReviewCommentsAsync(int reviewGameId);
        Task<ReviewCommentDto?> AddReviewCommentAsync(CreateReviewCommentDto createCommentDto, int authorId);
        Task<bool> DeleteReviewCommentAsync(int commentId, int userId);
    }
}
