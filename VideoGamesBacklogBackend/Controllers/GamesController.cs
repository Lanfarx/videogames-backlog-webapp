using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Models;
using VideoGamesBacklogBackend.Dto;

namespace VideoGamesBacklogBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GamesController : ControllerBase
    {
        private readonly IGameService _gameService;
        public GamesController(IGameService gameService)
        {
            _gameService = gameService;
        }        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var games = await _gameService.GetAllGamesAsync(User);
            return Ok(games);
        }

        [HttpGet("paginated")]
        public async Task<IActionResult> GetPaginated([FromQuery] int page = 1, [FromQuery] int pageSize = 12, [FromQuery] string? filters = null, [FromQuery] string? sortBy = null, [FromQuery] string? sortOrder = null, [FromQuery] string? search = null)
        {
            var result = await _gameService.GetGamesPaginatedAsync(User, page, pageSize, filters, sortBy, sortOrder, search);
            return Ok(result);
        }        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var game = await _gameService.GetGameByIdAsync(User, id);
            if (game == null) return NotFound();
            return Ok(game);
        }

        [HttpGet("by-title/{title}")]
        public async Task<IActionResult> GetByTitle(string title)
        {
            // Decodifica il titolo che potrebbe contenere caratteri speciali
            var decodedTitle = Uri.UnescapeDataString(title);
            var game = await _gameService.GetGameByTitleAsync(User, decodedTitle);
            if (game == null) return NotFound();
            return Ok(game);
        }
        [HttpGet("public/{id}")]
        public async Task<IActionResult> GetPublicGameInfo(int id)
        {
            int? currentUserId = null;
            if (User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userIdClaim, out int userId))
                {
                    currentUserId = userId;
                }
            }
            
            var gameInfo = await _gameService.GetGamePublicInfoByIdAsync(id, currentUserId);
            if (gameInfo == null)
            {
                return NotFound();
            }
            
            return Ok(gameInfo);
        }
        
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] Game game)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _gameService.AddGameAsync(User, game);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateGame(int id, [FromBody] UpdateGameDto updateDto)
        {
            var game = await _gameService.UpdateGameAsync(User, id, updateDto);
            if (game == null) return NotFound();
            return Ok(game);
        }
        
         [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateGameStatusDto statusDto)
        {
            var game = await _gameService.UpdateGameStatusAsync(User, id, statusDto.Status);
            if (game == null) return NotFound();
            return Ok(game);
        }

        [HttpPatch("{id}/playtime")]
        public async Task<IActionResult> UpdatePlaytime(int id, [FromBody] UpdateGamePlaytimeDto playtimeDto)
        {
            var game = await _gameService.UpdateGamePlaytimeAsync(User, id, playtimeDto.HoursPlayed);
            if (game == null) return NotFound();
            return Ok(game);
        }       
         [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _gameService.DeleteGameAsync(User, id);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpDelete("all")]
        public async Task<IActionResult> DeleteAll()
        {
            var deletedCount = await _gameService.DeleteAllGamesAsync(User);
            return Ok(new { DeletedCount = deletedCount, Message = $"Eliminati {deletedCount} giochi" });
        }// Statistiche
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _gameService.GetGameStatsAsync(User);
            return Ok(stats);
        }

        // Giochi in corso paginati
        [HttpGet("in-progress")]
        public async Task<IActionResult> GetInProgressPaginated([FromQuery] int page = 1, [FromQuery] int pageSize = 6)
        {
            var result = await _gameService.GetInProgressGamesPaginatedAsync(User, page, pageSize);
            return Ok(result);
        }

        // Commenti
        [HttpGet("{gameId}/Comments")]
        public async Task<IActionResult> GetComments(int gameId)
        {
            var comments = await _gameService.GetCommentsAsync(User, gameId);
            return Ok(comments);
        }

        [HttpPost("{gameId}/Comments")]
        public async Task<IActionResult> AddComment(int gameId, [FromBody] GameComment comment)
        {
            var created = await _gameService.AddCommentAsync(User, gameId, comment);
            if (created == null) return NotFound();
            return Ok(created);
        }        [HttpDelete("{gameId}/Comments/{commentId}")]
        public async Task<IActionResult> DeleteComment(int gameId, int commentId)
        {
            var result = await _gameService.DeleteCommentAsync(User, gameId, commentId);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpPut("{gameId}/Comments/{commentId}")]
        public async Task<IActionResult> UpdateComment(int gameId, int commentId, [FromBody] GameComment comment)
        {
            var updated = await _gameService.UpdateCommentAsync(User, gameId, commentId, comment);
            if (updated == null) return NotFound();
            return Ok(updated);
        }
    }
}
