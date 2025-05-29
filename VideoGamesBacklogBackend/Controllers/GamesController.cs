using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Models;

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
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var game = await _gameService.GetGameByIdAsync(User, id);
            if (game == null) return NotFound();
            return Ok(game);
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] Game game)
        {
            var created = await _gameService.AddGameAsync(User, game);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Game updated)
        {
            var game = await _gameService.UpdateGameAsync(User, id, updated);
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

        // Commenti
        [HttpPost("{gameId}/comments")]
        public async Task<IActionResult> AddComment(int gameId, [FromBody] GameComment comment)
        {
            var created = await _gameService.AddCommentAsync(User, gameId, comment);
            if (created == null) return NotFound();
            return Ok(created);
        }

        [HttpDelete("{gameId}/comments/{commentId}")]
        public async Task<IActionResult> DeleteComment(int gameId, int commentId)
        {
            var result = await _gameService.DeleteCommentAsync(User, gameId, commentId);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
