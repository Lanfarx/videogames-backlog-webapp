using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var games = await _gameService.GetAllGamesAsync(User);
            return Ok(games);
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

        // Statistiche
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _gameService.GetGameStatsAsync(User);
            return Ok(stats);
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
