using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Helpers;

namespace VideoGamesBacklogBackend.Controllers
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
        public async Task<ActionResult<PaginatedReviewsDto>> GetReviews(
            string gameTitle,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var currentUserId = User.GetOptionalUserId();
            var reviews = await communityService.GetReviewsAsync(gameTitle, page, pageSize, currentUserId);
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

        [HttpGet("review-comments/{reviewGameId:int}")]
        public async Task<ActionResult<List<ReviewCommentDto>>> GetReviewComments(int reviewGameId)
        {
            var comments = await communityService.GetReviewCommentsAsync(reviewGameId);
            return Ok(comments);
        }

        [HttpPost("review-comments")]
        public async Task<ActionResult<ReviewCommentDto>> AddReviewComment([FromBody] CreateReviewCommentDto createCommentDto)
        {
            var comment = await communityService.AddReviewCommentAsync(createCommentDto, User.GetUserId());
            return Ok(comment);
        }

        [HttpDelete("review-comments/{commentId:int}")]
        public async Task<IActionResult> DeleteReviewComment(int commentId)
        {
            await communityService.DeleteReviewCommentAsync(commentId, User.GetUserId());
            return Ok(new { message = "Commento eliminato con successo" });
        }

        [HttpGet("activity-comments/{activityId:int}")]
        public async Task<ActionResult<List<ActivityCommentDto>>> GetActivityComments(int activityId)
        {
            var comments = await communityService.GetActivityCommentsAsync(activityId);
            return Ok(comments);
        }

        [HttpPost("activity-comments")]
        public async Task<ActionResult<ActivityCommentDto>> AddActivityComment([FromBody] CreateActivityCommentDto createCommentDto)
        {
            var comment = await communityService.AddActivityCommentAsync(createCommentDto, User.GetUserId());
            return Ok(comment);
        }

        [HttpDelete("activity-comments/{commentId:int}")]
        public async Task<IActionResult> DeleteActivityComment(int commentId)
        {
            await communityService.DeleteActivityCommentAsync(commentId, User.GetUserId());
            return Ok(new { message = "Commento eliminato con successo" });
        }
    }
}
