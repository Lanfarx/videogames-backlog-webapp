using VideoGamesBacklogBackend.Common.DTOs.Pagination;
using VideoGamesBacklogBackend.DTOs.Social;

namespace VideoGamesBacklogBackend.Interfaces.Social
{
    public interface ICommunityService
    {
        Task<CommunityStatsDto> GetCommunityStatsAsync(string gameTitle);       
     
        Task<decimal> GetCommunityRatingAsync(string gameTitle);

        Task<CommunityRatingDto> GetCommunityRatingWithCountAsync(string gameTitle);

        Task<Dictionary<string, decimal>> GetCommunityRatingsAsync(List<string> gameTitles);
        Task<Dictionary<string, CommunityRatingDto>> GetCommunityRatingsWithCountAsync(List<string> gameTitles);      

        Task<PaginatedResult<CommunityReviewDto>> GetReviewsAsync(string gameTitle, PaginationQueryParameters queryParams, int? currentUserId = null);

        Task<PaginatedResult<CommunityReviewDto>> GetPublicReviewsAsync(string gameTitle, PaginationQueryParameters queryParams);
        Task<ReviewStatsDto> GetReviewStatsAsync(string gameTitle);     

        Task<List<CommunityReviewDto>> GetTopReviewsAsync(string gameTitle, int limit, int? currentUserId = null);
    }
}
