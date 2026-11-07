using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using VideoGamesBacklogBackend.Common.Extensions;
using VideoGamesBacklogBackend.DTOs.Steam;
using VideoGamesBacklogBackend.Interfaces.Steam;

namespace VideoGamesBacklogBackend.Controllers.Steam;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SteamController(ISteamService steamService) : ControllerBase
{
    [HttpGet("games/{steamId}")]
    public async Task<ActionResult<List<SteamGame>>> GetSteamGames(string steamId, CancellationToken cancellationToken)
    {
        var games = await steamService.GetSteamGamesAsync(steamId, cancellationToken);
        return Ok(new { games });
    }

    [HttpGet("recent-games/{steamId}")]
    public async Task<ActionResult<List<RecentlyPlayedGame>>> GetRecentlyPlayedGames(string steamId, CancellationToken cancellationToken)
    {
        var games = await steamService.GetRecentlyPlayedGamesAsync(steamId, cancellationToken);
        return Ok(new { games });
    }

    [HttpPost("sync")]
    public async Task<ActionResult<SteamSyncResponse>> SyncSteamGames(CancellationToken cancellationToken) =>
        Ok(await steamService.SyncSteamGamesAsync(User.GetUserId(), cancellationToken));

    [HttpGet("candidates")]
    public async Task<ActionResult<List<SteamCandidateDto>>> GetCandidates([FromQuery] bool ignored, CancellationToken cancellationToken) =>
        Ok(await steamService.GetCandidatesAsync(User.GetUserId(), ignored, cancellationToken));

    [HttpPost("import")]
    public async Task<ActionResult> ImportGames([FromBody] List<SteamImportItem> items, CancellationToken cancellationToken) =>
        Ok(new { count = await steamService.ImportGamesAsync(User.GetUserId(), items, cancellationToken) });

    [HttpPost("ignore")]
    public async Task<ActionResult> IgnoreGames([FromBody] List<int> appIds, CancellationToken cancellationToken)
    {
        await steamService.SetIgnoredAsync(User.GetUserId(), appIds, true, cancellationToken);
        return NoContent();
    }

    [HttpPost("restore")]
    public async Task<ActionResult> RestoreGames([FromBody] List<int> appIds, CancellationToken cancellationToken)
    {
        await steamService.SetIgnoredAsync(User.GetUserId(), appIds, false, cancellationToken);
        return NoContent();
    }
}
