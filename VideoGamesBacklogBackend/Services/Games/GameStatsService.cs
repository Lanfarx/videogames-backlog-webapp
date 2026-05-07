using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.DTOs.Games;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.Infrastructure.Data;
using VideoGamesBacklogBackend.Interfaces.Games;

namespace VideoGamesBacklogBackend.Services.Games
{
    public class GameStatsService(AppDbContext dbContext) : IGameStatsService
    {
        public async Task<GameStatsDto> GetGameStatsAsync(int userId) => await GetUserStatsAsync(userId);

        public async Task<GameStatsDto> GetUserStatsAsync(int userId)
        {
            var games = await dbContext.Games.Where(g => g.UserId == userId).ToListAsync();

            var totalSpent = games.Sum(g => g.Price);
            var freeGames = games.Count(g => g.Price == 0);
            var paidGames = games.Where(g => g.Price > 0).ToList();
            var totalHours = games.Sum(g => g.HoursPlayed);

            var highestPriceGame = games.Count > 0 ? games.OrderByDescending(g => g.Price).First() : null;

            return new GameStatsDto
            {
                Total = games.Count,
                InProgress = games.Count(g => g.Status == GameStatus.InProgress),
                Completed = games.Count(g => g.Status is GameStatus.Completed or GameStatus.Platinum),
                NotStarted = games.Count(g => g.Status == GameStatus.NotStarted),
                Abandoned = games.Count(g => g.Status == GameStatus.Abandoned),
                Platinum = games.Count(g => g.Status == GameStatus.Platinum),
                TotalHours = totalHours,
                TotalSpent = totalSpent,
                AveragePrice = paidGames.Count > 0 ? paidGames.Average(g => g.Price) : 0,
                FreeGames = freeGames,
                HighestPrice = highestPriceGame?.Price ?? 0,
                HighestPriceGameTitle = highestPriceGame?.Title,
                CostPerHour = totalHours > 0 ? totalSpent / totalHours : 0
            };
        }
    }
}
