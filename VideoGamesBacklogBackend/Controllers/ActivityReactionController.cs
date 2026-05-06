using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Helpers;
using VideoGamesBacklogBackend.Interfaces;

namespace VideoGamesBacklogBackend.Controllers
{
    [ApiController]
    [Route("api/activity-reactions")]
    [Authorize]
    public class ActivityReactionController(IActivityService activityService) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> ToggleReaction([FromBody] CreateActivityReactionDto createReactionDto)
        {
            var result = await activityService.AddReactionAsync(createReactionDto, User.GetUserId());
            
            if (result == null)
            {
                return Ok(new { message = "Reazione rimossa", removed = true });
            }

            return Ok(new { message = "Reazione aggiunta", reaction = result, removed = false });
        }

        [HttpGet("activity/{activityId:int}")]
        public async Task<IActionResult> GetActivityReactions(int activityId)
        {
            var reactions = await activityService.GetActivityReactionsAsync(activityId, User.GetUserId());
            
            return Ok(new { 
                activityId,
                reactions,
                message = "Reazioni recuperate con successo" 
            });
        }

        [HttpDelete("{reactionId:int}")]
        public async Task<IActionResult> RemoveReaction(int reactionId)
        {
            await activityService.RemoveReactionAsync(reactionId, User.GetUserId());
            return Ok(new { message = "Reazione rimossa con successo" });
        }
    }
}
