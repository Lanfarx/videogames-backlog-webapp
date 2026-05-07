using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoGamesBacklogBackend.Common.DTOs.Pagination;
using VideoGamesBacklogBackend.Common.Extensions;
using VideoGamesBacklogBackend.DTOs.Social;
using VideoGamesBacklogBackend.Interfaces.Social;

namespace VideoGamesBacklogBackend.Controllers.Social
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CommunityController(ICommunityService communityService) : ControllerBase
    {
        [HttpGet("stats/{gameTitle}")]
        public async Task<ActionResult<CommunityStatsDto>> GetCommunityStats(string gameTitle)
        {
            var stats = await communityService.GetCommunityStatsAsync(gameTitle);
            return Ok(stats);
        }

        [HttpGet("rating/{gameTitle}")]
        public async Task<ActionResult<decimal>> GetCommunityRating(string gameTitle)
        {
            var rating = await communityService.GetCommunityRatingAsync(gameTitle);
            return Ok(rating);
        }

        [HttpPost("ratings")]
        public async Task<ActionResult<Dictionary<string, decimal>>> GetCommunityRatings([FromBody] List<string> gameTitles)
        {
            var ratings = await communityService.GetCommunityRatingsAsync(gameTitles);
            return Ok(ratings);
        }

        [HttpPost("ratings-with-count")]
        public async Task<ActionResult<Dictionary<string, CommunityRatingDto>>> GetCommunityRatingsWithCount([FromBody] List<string> gameTitles)
        {
            var ratingsWithCount = await communityService.GetCommunityRatingsWithCountAsync(gameTitles);
            return Ok(ratingsWithCount);
        }

        [HttpGet("reviews/{gameTitle}")]
        public async Task<ActionResult<PaginatedResult<CommunityReviewDto>>> GetReviews(
            string gameTitle,
            [FromQuery] PaginationQueryParameters queryParams)
        {
            var currentUserId = User.GetOptionalUserId();
            var reviews = await communityService.GetReviewsAsync(gameTitle, queryParams, currentUserId);
            return Ok(reviews);
        }

        [HttpGet("review-stats/{gameTitle}")]
        public async Task<ActionResult<ReviewStatsDto>> GetReviewStats(string gameTitle)
        {
            var stats = await communityService.GetReviewStatsAsync(gameTitle);
            return Ok(stats);
        }

        [HttpGet("top-reviews/{gameTitle}")]
        public async Task<ActionResult<List<CommunityReviewDto>>> GetTopReviews(
            string gameTitle, 
            [FromQuery] int limit = 5)
        {
            var currentUserId = User.GetOptionalUserId();
            var reviews = await communityService.GetTopReviewsAsync(gameTitle, limit, currentUserId);
            return Ok(reviews);
        }
    }
}
