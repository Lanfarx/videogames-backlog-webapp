using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Data;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace VideoGamesBacklogBackend.Services
{
    public class GameService : IGameService
    {
        private readonly AppDbContext _dbContext;
        public GameService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<Game>> GetAllGamesAsync(ClaimsPrincipal userClaims)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            return await _dbContext.Games.Where(g => g.UserId == userId).Include(g => g.Comments).ToListAsync();
        }

        public async Task<Game?> GetGameByIdAsync(ClaimsPrincipal userClaims, int gameId)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            return await _dbContext.Games.Include(g => g.Comments).FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
        }

        public async Task<Game> AddGameAsync(ClaimsPrincipal userClaims, Game game)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            game.UserId = userId;
            _dbContext.Games.Add(game);
            await _dbContext.SaveChangesAsync();
            return game;
        }

        public async Task<Game?> UpdateGameAsync(ClaimsPrincipal userClaims, int gameId, Game updatedGame)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var game = await _dbContext.Games.FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
            if (game == null) return null;
            _dbContext.Entry(game).CurrentValues.SetValues(updatedGame);
            await _dbContext.SaveChangesAsync();
            return game;
        }

        public async Task<bool> DeleteGameAsync(ClaimsPrincipal userClaims, int gameId)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var game = await _dbContext.Games.FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
            if (game == null) return false;
            _dbContext.Games.Remove(game);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<GameComment?> AddCommentAsync(ClaimsPrincipal userClaims, int gameId, GameComment comment)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var game = await _dbContext.Games.Include(g => g.Comments).FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
            if (game == null) return null;
            comment.GameId = gameId;
            game.Comments.Add(comment);
            await _dbContext.SaveChangesAsync();
            return comment;
        }

        public async Task<bool> DeleteCommentAsync(ClaimsPrincipal userClaims, int gameId, int commentId)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var game = await _dbContext.Games.Include(g => g.Comments).FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
            if (game == null) return false;
            var comment = game.Comments.FirstOrDefault(c => c.Id == commentId);
            if (comment == null) return false;
            game.Comments.Remove(comment);
            await _dbContext.SaveChangesAsync();
            return true;
        }
    }
}
