using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Data;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.Interfaces;
using AutoMapper;

namespace VideoGamesBacklogBackend.Services
{
    public class GameCommentService(
        AppDbContext dbContext,
        IMapper mapper) : IGameCommentService
    {
        public async Task<List<GameCommentDto>> GetCommentsAsync(int userId, int gameId)
        {
            var game = await dbContext.Games
                .Include(g => g.Comments)
                .FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);

            if (game == null) throw new KeyNotFoundException("Gioco non trovato.");
            return mapper.Map<List<GameCommentDto>>(game.Comments);
        }

        public async Task<GameCommentDto?> AddCommentAsync(int userId, int gameId, CreateGameCommentDto commentDto)
        {
            var game = await dbContext.Games
                .FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);

            if (game == null) throw new KeyNotFoundException("Gioco non trovato.");

            var comment = new GameComment
            {
                GameId = gameId,
                Text = commentDto.Text,
                Date = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };
            dbContext.GameComments.Add(comment);
            await dbContext.SaveChangesAsync();
            return mapper.Map<GameCommentDto>(comment);
        }

        public async Task<bool> DeleteCommentAsync(int userId, int gameId, int commentId)
        {
            var game = await dbContext.Games
                .FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);

            if (game == null) throw new KeyNotFoundException("Gioco non trovato.");

            var comment = await dbContext.GameComments
                .FirstOrDefaultAsync(c => c.Id == commentId && c.GameId == gameId);

            if (comment == null) throw new KeyNotFoundException("Commento non trovato.");

            dbContext.GameComments.Remove(comment);
            await dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<GameCommentDto?> UpdateCommentAsync(int userId, int gameId, int commentId, CreateGameCommentDto updatedComment)
        {
            var game = await dbContext.Games
                .FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);

            if (game == null) throw new KeyNotFoundException("Gioco non trovato.");

            var comment = await dbContext.GameComments
                .FirstOrDefaultAsync(c => c.Id == commentId && c.GameId == gameId);

            if (comment == null) throw new KeyNotFoundException("Commento non trovato.");

            if (!string.IsNullOrWhiteSpace(updatedComment.Text))
                comment.Text = updatedComment.Text;

            comment.Date = DateTime.UtcNow.ToString("yyyy-MM-dd");

            await dbContext.SaveChangesAsync();
            return mapper.Map<GameCommentDto>(comment);
        }
    }
}
