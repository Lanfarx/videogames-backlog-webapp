using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoGamesBacklogBackend.Common.DTOs.Pagination;
using VideoGamesBacklogBackend.Common.Extensions;
using VideoGamesBacklogBackend.DTOs.Games;
using VideoGamesBacklogBackend.DTOs.Games.Update;
using VideoGamesBacklogBackend.Interfaces.Games;

namespace VideoGamesBacklogBackend.Controllers.Games
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GamesController(IGameService gameService, IGameStatsService gameStatsService) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<GameDto>>> GetAll()
        {
            var games = await gameService.GetAllGamesAsync(User.GetUserId());
            return Ok(games);
        }

        [HttpGet("paginated")]
        public async Task<ActionResult<PaginatedResult<object>>> GetGamesPaginated([FromQuery] GameQueryParameters queryParams)
        {
            var result = await gameService.GetGamesPaginatedAsync(User.GetUserId(), queryParams);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<GameDto>> GetById(int id)
        {
            var game = await gameService.GetGameByIdAsync(User.GetUserId(), id);
            return Ok(game);
        }

        [HttpGet("by-title/{title}")]
        public async Task<ActionResult<GameDto>> GetByTitle(string title)
        {
            var decodedTitle = Uri.UnescapeDataString(title);
            var game = await gameService.GetGameByTitleAsync(User.GetUserId(), decodedTitle);
            return Ok(game);
        }

        [HttpGet("public/{id:int}")]
        public async Task<IActionResult> GetPublicGameInfo(int id)
        {
            var currentUserId = User.GetOptionalUserId();
            var gameInfo = await gameService.GetGamePublicInfoByIdAsync(id, currentUserId);
            return Ok(gameInfo);
        }

        [HttpPost]
        public async Task<ActionResult<GameDto>> Add([FromBody] CreateGameDto gameDto)
        {
            var created = await gameService.AddGameAsync(User.GetUserId(), gameDto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPatch("{id:int}")]
        public async Task<ActionResult<GameDto>> UpdateGame(int id, [FromBody] UpdateGameDto updateDto)
        {
            var game = await gameService.UpdateGameAsync(User.GetUserId(), id, updateDto);
            return Ok(game);
        }

        [HttpPatch("{id:int}/status")]
        public async Task<ActionResult<GameDto>> UpdateStatus(int id, [FromBody] UpdateGameStatusDto statusDto)
        {
            var game = await gameService.UpdateGameStatusAsync(User.GetUserId(), id, statusDto.Status);
            return Ok(game);
        }

        [HttpPatch("{id:int}/playtime")]
        public async Task<ActionResult<GameDto>> UpdatePlaytime(int id, [FromBody] UpdateGamePlaytimeDto playtimeDto)
        {
            var game = await gameService.UpdateGamePlaytimeAsync(User.GetUserId(), id, playtimeDto.HoursPlayed);
            return Ok(game);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            await gameService.DeleteGameAsync(User.GetUserId(), id);
            return NoContent();
        }

        [HttpDelete("all")]
        public async Task<IActionResult> DeleteAll()
        {
            var deletedCount = await gameService.DeleteAllGamesAsync(User.GetUserId());
            return Ok(new { DeletedCount = deletedCount, Message = $"Eliminati {deletedCount} giochi" });
        } 

        // Statistiche
        [HttpGet("stats")]
        public async Task<ActionResult<GameStatsDto>> GetStats()
        {
            var stats = await gameStatsService.GetGameStatsAsync(User.GetUserId());
            return Ok(stats);
        }

        // Giochi in corso paginati
        [HttpGet("in-progress")]
        public async Task<ActionResult<PaginatedResult<object>>> GetInProgressPaginated([FromQuery] PaginationQueryParameters queryParams)
        {
            var result = await gameService.GetInProgressGamesPaginatedAsync(User.GetUserId(), queryParams);
            return Ok(result);
        }


    }
}