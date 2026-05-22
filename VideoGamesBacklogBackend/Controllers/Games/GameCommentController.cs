using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoGamesBacklogBackend.Common.Extensions;
using VideoGamesBacklogBackend.DTOs.Games;
using VideoGamesBacklogBackend.Interfaces.Games;

namespace VideoGamesBacklogBackend.Controllers.Games;

[ApiController]
[Route("api/games/{gameId:int}/Comments")]
[Authorize]
public class GameCommentController(IGameCommentService gameCommentService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<GameCommentDto>>> GetComments(int gameId)
    {
        var comments = await gameCommentService.GetCommentsAsync(User.GetUserId(), gameId);
        return Ok(comments);
    }

    [HttpPost]
    public async Task<ActionResult<GameCommentDto>> AddComment(int gameId, [FromBody] CreateGameCommentDto commentDto)
    {
        var created = await gameCommentService.AddCommentAsync(User.GetUserId(), gameId, commentDto);
        return Ok(created);
    }

    [HttpDelete("{commentId:int}")]
    public async Task<IActionResult> DeleteComment(int gameId, int commentId)
    {
        await gameCommentService.DeleteCommentAsync(User.GetUserId(), gameId, commentId);
        return NoContent();
    }

    [HttpPut("{commentId:int}")]
    public async Task<ActionResult<GameCommentDto>> UpdateComment(int gameId, int commentId,
        [FromBody] CreateGameCommentDto commentDto)
    {
        var updated = await gameCommentService.UpdateCommentAsync(User.GetUserId(), gameId, commentId, commentDto);
        return Ok(updated);
    }
}