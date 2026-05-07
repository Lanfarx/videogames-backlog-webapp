using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Helpers;

namespace VideoGamesBacklogBackend.Controllers
{
    [ApiController]
    [Route("api/review-comments")]
    [Authorize]
    public class ReviewCommentController(IReviewCommentService reviewCommentService) : ControllerBase
    {
        [HttpGet("{reviewGameId:int}")]
        public async Task<ActionResult<List<ReviewCommentDto>>> GetReviewComments(int reviewGameId)
        {
            var comments = await reviewCommentService.GetReviewCommentsAsync(reviewGameId);
            return Ok(comments);
        }

        [HttpPost]
        public async Task<ActionResult<ReviewCommentDto>> AddReviewComment([FromBody] CreateReviewCommentDto createCommentDto)
        {
            var comment = await reviewCommentService.AddReviewCommentAsync(createCommentDto, User.GetUserId());
            return Ok(comment);
        }

        [HttpDelete("{commentId:int}")]
        public async Task<IActionResult> DeleteReviewComment(int commentId)
        {
            await reviewCommentService.DeleteReviewCommentAsync(commentId, User.GetUserId());
            return Ok(new { message = "Commento eliminato con successo" });
        }
    }
}
