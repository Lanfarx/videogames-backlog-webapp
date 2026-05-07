using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using VideoGamesBacklogBackend.Common.Extensions;
using VideoGamesBacklogBackend.DTOs.Steam;
using VideoGamesBacklogBackend.Interfaces.Steam;

namespace VideoGamesBacklogBackend.Controllers.Steam
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SteamController(ISteamService steamService) : ControllerBase
    {
        [HttpGet("games/{steamId}")]
        public async Task<ActionResult<List<SteamGame>>> GetSteamGames(string steamId)
        {
            var games = await steamService.GetSteamGamesAsync(steamId);
            return Ok(new { games });
        }

        [HttpGet("recent-games/{steamId}")]
        public async Task<ActionResult<List<RecentlyPlayedGame>>> GetRecentlyPlayedGames(string steamId)
        {
            var games = await steamService.GetRecentlyPlayedGamesAsync(steamId);
            return Ok(new { games });
        }

        [HttpPost("sync")]
        public async Task<ActionResult<SteamSyncResponse>> SyncSteamGames([FromBody] SteamSyncRequest request)
        {
            if (string.IsNullOrEmpty(request.SteamId))
                throw new ArgumentException("Steam ID richiesto.");

            if (request.SyncType is not ("initial_load" or "update_hours"))
                throw new ArgumentException("Tipo di sincronizzazione non valido. Usa 'initial_load' o 'update_hours'.");

            var result = await steamService.SyncSteamGamesAsync(request.SteamId, request.SyncType, User.GetUserId());
            return Ok(result);
        }
    }
}
