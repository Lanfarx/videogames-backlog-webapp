using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Helpers;

namespace VideoGamesBacklogBackend.Controllers
{
    [ApiController]
    [Route("api/games")]
    [Authorize]
    public class GameCommentController(IGameCommentService gameCommentService) : ControllerBase
    {
        [HttpGet("{gameId:int}/Comments")]
        public async Task<ActionResult<List<GameCommentDto>>> GetComments(int gameId)
        {
            var comments = await gameCommentService.GetCommentsAsync(User.GetUserId(), gameId);
            return Ok(comments);
        }

        [HttpPost("{gameId:int}/Comments")]
        public async Task<ActionResult<GameCommentDto>> AddComment(int gameId, [FromBody] CreateGameCommentDto commentDto)
        {
            var created = await gameCommentService.AddCommentAsync(User.GetUserId(), gameId, commentDto);
            return Ok(created);
        }

        [HttpDelete("{gameId:int}/Comments/{commentId:int}")]
        public async Task<IActionResult> DeleteComment(int gameId, int commentId)
        {
            await gameCommentService.DeleteCommentAsync(User.GetUserId(), gameId, commentId);
            return NoContent();
        }

        [HttpPut("{gameId:int}/Comments/{commentId:int}")]
        public async Task<ActionResult<GameCommentDto>> UpdateComment(int gameId, int commentId,
            [FromBody] CreateGameCommentDto commentDto)
        {
            var updated = await gameCommentService.UpdateCommentAsync(User.GetUserId(), gameId, commentId, commentDto);
            return Ok(updated);
        }
    }
}
