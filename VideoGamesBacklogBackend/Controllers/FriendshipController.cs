using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Interfaces;

namespace VideoGamesBacklogBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FriendshipController : ControllerBase
    {
        private readonly IFriendshipService _friendshipService;

        public FriendshipController(IFriendshipService friendshipService)
        {
            _friendshipService = friendshipService;
        }

        [HttpPost("send-request")]
        public async Task<IActionResult> SendFriendRequest([FromBody] FriendRequestDto request)
        {
            try
            {
                var result = await _friendshipService.SendFriendRequestAsync(User, request.UserName);
                if (result)
                {
                    return Ok(new { message = "Richiesta di amicizia inviata con successo" });
                }
                return BadRequest(new { message = "Impossibile inviare la richiesta di amicizia" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore interno del server", error = ex.Message });
            }
        }

        [HttpPost("accept/{friendshipId}")]
        public async Task<IActionResult> AcceptFriendRequest(int friendshipId)
        {
            try
            {
                var result = await _friendshipService.AcceptFriendRequestAsync(User, friendshipId);
                if (result)
                {
                    return Ok(new { message = "Richiesta di amicizia accettata" });
                }
                return BadRequest(new { message = "Impossibile accettare la richiesta" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore interno del server", error = ex.Message });
            }
        }

        [HttpPost("reject/{friendshipId}")]
        public async Task<IActionResult> RejectFriendRequest(int friendshipId)
        {
            try
            {
                var result = await _friendshipService.RejectFriendRequestAsync(User, friendshipId);
                if (result)
                {
                    return Ok(new { message = "Richiesta di amicizia rifiutata" });
                }
                return BadRequest(new { message = "Impossibile rifiutare la richiesta" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore interno del server", error = ex.Message });
            }
        }

        [HttpDelete("remove/{friendUserId}")]
        public async Task<IActionResult> RemoveFriend(int friendUserId)
        {
            try
            {
                var result = await _friendshipService.RemoveFriendAsync(User, friendUserId);
                if (result)
                {
                    return Ok(new { message = "Amico rimosso con successo" });
                }
                return BadRequest(new { message = "Impossibile rimuovere l'amico" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore interno del server", error = ex.Message });
            }
        }

        [HttpPost("block/{targetUserId}")]
        public async Task<IActionResult> BlockUser(int targetUserId)
        {
            try
            {
                var result = await _friendshipService.BlockUserAsync(User, targetUserId);
                if (result)
                {
                    return Ok(new { message = "Utente bloccato con successo" });
                }
                return BadRequest(new { message = "Impossibile bloccare l'utente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore interno del server", error = ex.Message });
            }
        }

        [HttpGet("pending-requests")]
        public async Task<IActionResult> GetPendingFriendRequests()
        {
            try
            {
                var requests = await _friendshipService.GetPendingFriendRequestsAsync(User);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore interno del server", error = ex.Message });
            }
        }

        [HttpGet("sent-requests")]
        public async Task<IActionResult> GetSentFriendRequests()
        {
            try
            {
                var requests = await _friendshipService.GetSentFriendRequestsAsync(User);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore interno del server", error = ex.Message });
            }
        }

        [HttpGet("friends")]
        public async Task<IActionResult> GetFriends()
        {
            try
            {
                var friends = await _friendshipService.GetFriendsAsync(User);
                return Ok(friends);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore interno del server", error = ex.Message });
            }
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers([FromQuery] string query)
        {
            try
            {
                var users = await _friendshipService.SearchUsersAsync(User, query);
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore interno del server", error = ex.Message });
            }
        }

        [HttpGet("profile/{userName}")]
        public async Task<IActionResult> GetPublicProfile(string userName)
        {
            try
            {
                var profile = await _friendshipService.GetPublicProfileAsync(User, userName);
                if (profile == null)
                {
                    return NotFound(new { message = "Profilo non trovato" });
                }
                return Ok(profile);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore interno del server", error = ex.Message });
            }
        }
    }
}
