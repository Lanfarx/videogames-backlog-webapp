using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using VideoGamesBacklogBackend.Services;
using VideoGamesBacklogBackend.Models;
using System.Security.Claims;

namespace VideoGamesBacklogBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SteamController : ControllerBase
    {
        private readonly ISteamService _steamService;

        public SteamController(ISteamService steamService)
        {
            _steamService = steamService;
        }

        [HttpGet("games/{steamId}")]
        public async Task<ActionResult<List<SteamGame>>> GetSteamGames(string steamId)
        {
            try
            {
                var games = await _steamService.GetSteamGamesAsync(steamId);
                return Ok(new { games });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("recent-games/{steamId}")]
        public async Task<ActionResult<List<RecentlyPlayedGame>>> GetRecentlyPlayedGames(string steamId)
        {
            try
            {
                var games = await _steamService.GetRecentlyPlayedGamesAsync(steamId);
                return Ok(new { games });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("sync")]
        public async Task<ActionResult<SteamSyncResponse>> SyncSteamGames([FromBody] SteamSyncRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized(new { error = "Token non valido" });
                }

                if (!int.TryParse(userIdClaim.Value, out int userId))
                {
                    return BadRequest(new { error = "ID utente non valido" });
                }

                if (string.IsNullOrEmpty(request.SteamId))
                {
                    return BadRequest(new { error = "Steam ID richiesto" });
                }

                if (request.SyncType != "initial_load" && request.SyncType != "update_hours")
                {
                    return BadRequest(new { error = "Tipo di sincronizzazione non valido. Usa 'initial_load' o 'update_hours'" });
                }

                var result = await _steamService.SyncSteamGamesAsync(request.SteamId, request.SyncType, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
