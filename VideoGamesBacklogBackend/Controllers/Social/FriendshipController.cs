using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoGamesBacklogBackend.DTOs.Social;
using VideoGamesBacklogBackend.Common.DTOs.Pagination;
using VideoGamesBacklogBackend.Common.Extensions;
using VideoGamesBacklogBackend.Interfaces.Social;

namespace VideoGamesBacklogBackend.Controllers.Social;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class FriendshipController(IFriendshipService friendshipService) : ControllerBase
{
    [HttpPost("send-request")]
    public async Task<IActionResult> SendFriendRequest([FromBody] FriendRequestDto request)
    {
        await friendshipService.SendFriendRequestAsync(User.GetUserId(), request.UserName);
        return Ok(new { message = "Richiesta di amicizia inviata con successo" });
    }

    [HttpPost("accept/{friendshipId:int}")]
    public async Task<IActionResult> AcceptFriendRequest(int friendshipId)
    {
        await friendshipService.AcceptFriendRequestAsync(User.GetUserId(), friendshipId);
        return Ok(new { message = "Richiesta di amicizia accettata" });
    }

    [HttpPost("reject/{friendshipId:int}")]
    public async Task<IActionResult> RejectFriendRequest(int friendshipId)
    {
        await friendshipService.RejectFriendRequestAsync(User.GetUserId(), friendshipId);
        return Ok(new { message = "Richiesta di amicizia rifiutata" });
    }

    [HttpDelete("remove/{friendUserId:int}")]
    public async Task<IActionResult> RemoveFriend(int friendUserId)
    {
        await friendshipService.RemoveFriendAsync(User.GetUserId(), friendUserId);
        return Ok(new { message = "Amico rimosso con successo" });
    }

    [HttpPost("block/{targetUserId:int}")]
    public async Task<IActionResult> BlockUser(int targetUserId)
    {
        await friendshipService.BlockUserAsync(User.GetUserId(), targetUserId);
        return Ok(new { message = "Utente bloccato con successo" });
    }

    [HttpGet("pending-requests")]
    public async Task<ActionResult<List<FriendshipDto>>> GetPendingFriendRequests()
    {
        var requests = await friendshipService.GetPendingFriendRequestsAsync(User.GetUserId());
        return Ok(requests);
    }

    [HttpGet("sent-requests")]
    public async Task<ActionResult<List<FriendshipDto>>> GetSentFriendRequests()
    {
        var requests = await friendshipService.GetSentFriendRequestsAsync(User.GetUserId());
        return Ok(requests);
    }

    [HttpGet("friends")]
    public async Task<ActionResult<List<FriendDto>>> GetFriends()
    {
        var friends = await friendshipService.GetFriendsAsync(User.GetUserId());
        return Ok(friends);
    }

    public async Task<ActionResult<PaginatedResult<PublicProfileDto>>> SearchUsers([FromQuery] string query, [FromQuery] PaginationQueryParameters queryParams)
    {
        var result = await friendshipService.SearchUsersAsync(User.GetUserId(), query, queryParams);
        return Ok(result);
    }

    [HttpGet("profile/{userName}")]
    public async Task<ActionResult<PublicProfileDto>> GetPublicProfile(string userName)
    {
        var profile = await friendshipService.GetPublicProfileAsync(User.GetUserId(), userName);
        return Ok(profile);
    }
}