using VideoGamesBacklogBackend.Dto;

namespace VideoGamesBacklogBackend.Interfaces
{
    public interface ICommunityService
    {
        Task<CommunityStatsDto> GetCommunityStatsAsync(string gameTitle);       
     
        Task<decimal> GetCommunityRatingAsync(string gameTitle);

        Task<CommunityRatingDto> GetCommunityRatingWithCountAsync(string gameTitle);

        Task<Dictionary<string, decimal>> GetCommunityRatingsAsync(List<string> gameTitles);
        Task<Dictionary<string, CommunityRatingDto>> GetCommunityRatingsWithCountAsync(List<string> gameTitles);      

        Task<PaginatedReviewsDto> GetReviewsAsync(string gameTitle, int page, int pageSize, int? currentUserId = null);

        Task<PaginatedReviewsDto> GetPublicReviewsAsync(string gameTitle, int page, int pageSize);
        Task<ReviewStatsDto> GetReviewStatsAsync(string gameTitle);     

        Task<List<CommunityReviewDto>> GetTopReviewsAsync(string gameTitle, int limit, int? currentUserId = null);

        Task<List<ReviewCommentDto>> GetReviewCommentsAsync(int reviewGameId);

        Task<ReviewCommentDto?> AddReviewCommentAsync(CreateReviewCommentDto createCommentDto, int authorId);

        Task<bool> DeleteReviewCommentAsync(int commentId, int userId);

 
        Task<List<ActivityCommentDto>> GetActivityCommentsAsync(int activityId);

        Task<ActivityCommentDto?> AddActivityCommentAsync(CreateActivityCommentDto createCommentDto, int authorId);

        Task<bool> DeleteActivityCommentAsync(int commentId, int userId);
    }
}
