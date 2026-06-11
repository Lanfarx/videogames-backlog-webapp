using JetBrains.Annotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using VideoGamesBacklogBackend.DTOs.Games;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.Infrastructure.Data;
using VideoGamesBacklogBackend.Interfaces.Games;

namespace VideoGamesBacklogBackend.Services.Games;

[UsedImplicitly]
public class GameStatsService(AppDbContext dbContext, IMemoryCache cache) : IGameStatsService
{
    public async Task<GameStatsDto> GetGameStatsAsync(int userId) => await GetUserStatsAsync(userId);

    public async Task<GameStatsDto> GetUserStatsAsync(int userId)
    {
        var cacheKey = $"UserStats_{userId}";
        return await cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);

            var stats = await dbContext.Games
            .Where(g => g.UserId == userId)
            .GroupBy(g => 1)
            .Select(g => new {
                Total = g.Count(),
                InProgress = g.Count(x => x.Status == GameStatus.InProgress),
                Completed = g.Count(x => x.Status == GameStatus.Completed || x.Status == GameStatus.Platinum),
                NotStarted = g.Count(x => x.Status == GameStatus.NotStarted),
                Abandoned = g.Count(x => x.Status == GameStatus.Abandoned),
                Platinum = g.Count(x => x.Status == GameStatus.Platinum),
                TotalHours = g.Sum(x => x.HoursPlayed),
                TotalSpent = g.Sum(x => x.Price > 0 ? x.Price : 0),
                FreeGames = g.Count(x => x.Price == 0),
                PaidGamesCount = g.Count(x => x.Price > 0)
            })
            .FirstOrDefaultAsync();

        if (stats == null) return new GameStatsDto();

        var highestPriceGame = await dbContext.Games
            .Where(g => g.UserId == userId && g.Price.HasValue)
            .OrderByDescending(g => g.Price)
            .Select(g => new { g.Title, g.Price })
            .FirstOrDefaultAsync();

        var totalSpent = stats.TotalSpent ?? 0;
        var totalHours = stats.TotalHours;
        var averagePrice = stats.PaidGamesCount > 0 ? totalSpent / stats.PaidGamesCount : 0;
        var costPerHour = totalHours > 0 ? totalSpent / totalHours : 0;

        return new GameStatsDto
        {
            Total = stats.Total,
            InProgress = stats.InProgress,
            Completed = stats.Completed,
            NotStarted = stats.NotStarted,
            Abandoned = stats.Abandoned,
            Platinum = stats.Platinum,
            TotalHours = totalHours,
            TotalSpent = totalSpent,
            AveragePrice = averagePrice,
            FreeGames = stats.FreeGames,
            HighestPrice = highestPriceGame?.Price ?? 0,
            HighestPriceGameTitle = highestPriceGame?.Title,
            CostPerHour = costPerHour
        };
        }) ?? new GameStatsDto();
    }
}