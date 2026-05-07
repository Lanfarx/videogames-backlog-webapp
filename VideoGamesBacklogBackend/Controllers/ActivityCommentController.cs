using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Helpers;

namespace VideoGamesBacklogBackend.Controllers
{
    [ApiController]
    [Route("api/activity-comments")]
    [Authorize]
    public class ActivityCommentController(IActivityCommentService activityCommentService) : ControllerBase
    {
        [HttpGet("{activityId:int}")]
        public async Task<ActionResult<List<ActivityCommentDto>>> GetActivityComments(int activityId)
        {
            var comments = await activityCommentService.GetActivityCommentsAsync(activityId);
            return Ok(comments);
        }

        [HttpPost]
        public async Task<ActionResult<ActivityCommentDto>> AddActivityComment([FromBody] CreateActivityCommentDto createCommentDto)
        {
            var comment = await activityCommentService.AddActivityCommentAsync(createCommentDto, User.GetUserId());
            return Ok(comment);
        }

        [HttpDelete("{commentId:int}")]
        public async Task<IActionResult> DeleteActivityComment(int commentId)
        {
            await activityCommentService.DeleteActivityCommentAsync(commentId, User.GetUserId());
            return Ok(new { message = "Commento eliminato con successo" });
        }
    }
}
