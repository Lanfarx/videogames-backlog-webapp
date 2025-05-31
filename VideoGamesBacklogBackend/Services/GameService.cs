using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Data;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Models;
using VideoGamesBacklogBackend.Dto;
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
        }        public async Task<Game?> GetGameByIdAsync(ClaimsPrincipal userClaims, int gameId)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            return await _dbContext.Games.Include(g => g.Comments).FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
        }

        public async Task<Game?> GetGameByTitleAsync(ClaimsPrincipal userClaims, string title)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            return await _dbContext.Games.Include(g => g.Comments).FirstOrDefaultAsync(g => g.Title == title && g.UserId == userId);
        }

        public async Task<Game> AddGameAsync(ClaimsPrincipal userClaims, Game game)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            game.UserId = userId;
            _dbContext.Games.Add(game);
            await _dbContext.SaveChangesAsync();
            return game;
        }        
        
        public async Task<Game?> UpdateGameAsync(ClaimsPrincipal userClaims, int gameId, UpdateGameDto updateDto)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var game = await _dbContext.Games.FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
            if (game == null) return null;

            // Aggiorna solo i campi specificati nel DTO (non null)
            if (!string.IsNullOrEmpty(updateDto.Title))
                game.Title = updateDto.Title;
            
            if (updateDto.Platform != null)
                game.Platform = updateDto.Platform;
            
            if (updateDto.ReleaseYear.HasValue)
                game.ReleaseYear = updateDto.ReleaseYear.Value;
            
            if (updateDto.Genres != null)
                game.Genres = updateDto.Genres;
            
            if (updateDto.CoverImage != null)
                game.CoverImage = updateDto.CoverImage;
            
            if (updateDto.Price.HasValue)
                game.Price = updateDto.Price.Value;
            
            if (updateDto.PurchaseDate != null)
                game.PurchaseDate = updateDto.PurchaseDate;
            
            if (updateDto.Developer != null)
                game.Developer = updateDto.Developer;
            
            if (updateDto.Publisher != null)
                game.Publisher = updateDto.Publisher;
            
            if (updateDto.CompletionDate != null)
                game.CompletionDate = updateDto.CompletionDate;
            
            if (updateDto.PlatinumDate != null)
                game.PlatinumDate = updateDto.PlatinumDate;
            
            if (updateDto.Metacritic.HasValue)
                game.Metacritic = updateDto.Metacritic.Value;
            
            if (updateDto.Rating.HasValue)
                game.Rating = updateDto.Rating.Value;
            
            if (updateDto.Notes != null)
                game.Notes = updateDto.Notes;
              if (updateDto.Review != null)
                game.Review = updateDto.Review;
            
            // Gestisci Status utilizzando la logica esistente
            if (!string.IsNullOrEmpty(updateDto.Status))
                StatusChangeFunction(updateDto.Status, game);
            
            // Gestisci HoursPlayed utilizzando la logica esistente
            if (updateDto.HoursPlayed.HasValue)
                PlaytimeChangeFunction(updateDto.HoursPlayed.Value, game);

            await _dbContext.SaveChangesAsync();
            return game;
        }
        
        public async Task<Game?> UpdateGameStatusAsync(ClaimsPrincipal userClaims, int gameId, string status)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var game = await _dbContext.Games.FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
            if (game == null) return null;

            StatusChangeFunction(status, game);
            await _dbContext.SaveChangesAsync();
            return game;
        }

        private static void StatusChangeFunction(string status, Game game)
        {
            // Salva lo status precedente per gestire le date
            var previousStatus = game.Status.ToString();
            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");

            // Converte la stringa status in enum
            if (Enum.TryParse<GameStatus>(status, out GameStatus newStatus))
            {
                game.Status = newStatus;

                // Gestisci automaticamente le date in base al nuovo stato
                if (newStatus == GameStatus.Completed)
                {
                    // Quando diventa completato: imposta CompletionDate
                    game.CompletionDate = today;
                    // Se aveva PlatinumDate, rimuovilo (non è più platino)
                    game.PlatinumDate = null;
                }
                else if (newStatus == GameStatus.Platinum)
                {
                    // Quando diventa platino: imposta PlatinumDate e mantieni/imposta CompletionDate
                    game.PlatinumDate = today;
                    // Se non ha già una data di completamento, impostala
                    if (string.IsNullOrEmpty(game.CompletionDate))
                    {
                        game.CompletionDate = today;
                    }
                }
                else
                {
                    // Per tutti gli altri stati, rimuovi entrambe le date se veniva da Completed o Platinum
                    if (previousStatus == "Completed" || previousStatus == "Platinum")
                    {
                        game.CompletionDate = null;
                        game.PlatinumDate = null;
                    }
                }
            }
        }

        public async Task<Game?> UpdateGamePlaytimeAsync(ClaimsPrincipal userClaims, int gameId, int hoursPlayed)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var game = await _dbContext.Games.FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
            if (game == null) return null;

            PlaytimeChangeFunction(hoursPlayed, game);

            await _dbContext.SaveChangesAsync();
            return game;
        }

        private static void PlaytimeChangeFunction(int hoursPlayed, Game game)
        {
            // Aggiorna le ore di gioco
            game.HoursPlayed = hoursPlayed;

            // Se il gioco era "Da iniziare" e ora ha ore di gioco > 0, imposta lo stato a "In corso"
            if (game.Status == GameStatus.NotStarted && hoursPlayed > 0)
            {
                game.Status = GameStatus.InProgress;
            }
        }        public async Task<bool> DeleteGameAsync(ClaimsPrincipal userClaims, int gameId)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var game = await _dbContext.Games.FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
            if (game == null) return false;
            _dbContext.Games.Remove(game);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<List<GameComment>> GetCommentsAsync(ClaimsPrincipal userClaims, int gameId)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var game = await _dbContext.Games.Include(g => g.Comments).FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
            return game?.Comments.ToList() ?? new List<GameComment>();
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
        }        public async Task<bool> DeleteCommentAsync(ClaimsPrincipal userClaims, int gameId, int commentId)
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

        public async Task<GameComment?> UpdateCommentAsync(ClaimsPrincipal userClaims, int gameId, int commentId, GameComment updatedComment)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var game = await _dbContext.Games.Include(g => g.Comments).FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
            if (game == null) return null;
            var comment = game.Comments.FirstOrDefault(c => c.Id == commentId);
            if (comment == null) return null;
            
            // Aggiorna solo i campi modificabili
            comment.Text = updatedComment.Text;
            comment.Date = updatedComment.Date;
            
            await _dbContext.SaveChangesAsync();
            return comment;
        }
    }
}
