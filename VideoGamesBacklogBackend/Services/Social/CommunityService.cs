using AutoMapper;
using JetBrains.Annotations;
using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Common.DTOs.Pagination;
using VideoGamesBacklogBackend.Common.Extensions;
using VideoGamesBacklogBackend.Common.Helpers;
using VideoGamesBacklogBackend.DTOs.Social;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.Infrastructure.Data;
using VideoGamesBacklogBackend.Interfaces.Social;

namespace VideoGamesBacklogBackend.Services.Social;

[UsedImplicitly]
public class CommunityService(
    AppDbContext context,
    IMapper mapper)
    : ICommunityService
{
    public async Task<CommunityStatsDto> GetCommunityStatsAsync(string gameTitle)
    {
        var allGames = await context.Games
            .Select(g => new
            {
                g.Id,
                g.Title,
                g.HoursPlayed,
                g.Status,
                g.Rating,
                HasPublicReview = g.Review != null && g.Review.IsPublic == true
            })
            .ToListAsync();

        var games = allGames.Where(g => GameTitleMatcher.DoesGameTitleMatch(g.Title, gameTitle)).ToList();
        if (games.Count == 0)
        {
            return new CommunityStatsDto();
        }

        var totalPlayers = games.Count;
        var gamesWithPublicReviews = games.Where(g => g.HasPublicReview).ToList();
        var totalReviews = gamesWithPublicReviews.Count;
        var gamesWithRating = games.Where(g => g.Rating > 0).ToList();
        var averageRating = gamesWithRating.Count > 0
            ? gamesWithRating.Average(g => g.Rating)
            : 0;

        var averagePlaytime = games.Count > 0
            ? (int)Math.Round(games.Average(g => g.HoursPlayed))
            : 0;

        var completedGames = games.Count(g => g.Status is GameStatus.Completed or GameStatus.Platinum);
        var completionRate = totalPlayers > 0
            ? Math.Round((decimal)completedGames / totalPlayers * 100, 2)
            : 0;

        var currentlyPlaying = games.Count(g => g.Status == GameStatus.InProgress);

        return new CommunityStatsDto
        {
            TotalPlayers = totalPlayers,
            AverageRating = Math.Round(averageRating, 2),
            TotalReviews = totalReviews,
            AveragePlaytime = averagePlaytime,
            CompletionRate = completionRate,
            CurrentlyPlaying = currentlyPlaying
        };
    }

    public async Task<decimal> GetCommunityRatingAsync(string gameTitle)
    {
        var games = await context.Games
            .Where(g => g.Rating > 0)
            .ToListAsync();

        games = games.Where(g => GameTitleMatcher.DoesGameTitleMatch(g.Title, gameTitle)).ToList();

        return games.Count > 0 ? Math.Round(games.Average(g => g.Rating), 2) : 0;
    }

    public async Task<CommunityRatingDto> GetCommunityRatingWithCountAsync(string gameTitle)
    {
        var games = await context.Games
            .Where(g => g.Rating > 0)
            .ToListAsync();

        games = games.Where(g => GameTitleMatcher.DoesGameTitleMatch(g.Title, gameTitle)).ToList();

        var reviewCount = games.Count;
        var rating = reviewCount > 0 ? Math.Round(games.Average(g => g.Rating), 2) : 0;

        return new CommunityRatingDto
        {
            Rating = rating,
            ReviewCount = reviewCount
        };
    }

    public async Task<Dictionary<string, decimal>> GetCommunityRatingsAsync(List<string> gameTitles)
    {
        var ratings = new Dictionary<string, decimal>();

        foreach (var title in gameTitles)
        {
            var rating = await GetCommunityRatingAsync(title);
            ratings[title] = rating;
        }

        return ratings;
    }

    public async Task<Dictionary<string, CommunityRatingDto>> GetCommunityRatingsWithCountAsync(
        List<string> gameTitles)
    {
        var ratingsWithCount = new Dictionary<string, CommunityRatingDto>();

        foreach (var title in gameTitles)
        {
            var ratingData = await GetCommunityRatingWithCountAsync(title);
            ratingsWithCount[title] = ratingData;
        }

        return ratingsWithCount;
    }

    public async Task<PaginatedResult<CommunityReviewDto>> GetReviewsAsync(string gameTitle, PaginationQueryParameters queryParams,
        int? currentUserId = null)
    {
        var games = await GetPublicGamesMatchingTitleAsync(gameTitle, includeDetails: true, currentUserId);
        var query = games.OrderByDescending(g => g.Review!.Date).AsQueryable();

        var result = await query.PaginateAsync(queryParams);

        return new PaginatedResult<CommunityReviewDto>
        {
            Items = result.Items.Select(mapper.Map<CommunityReviewDto>).ToList(),
            TotalItems = result.TotalItems,
            CurrentPage = result.CurrentPage,
            PageSize = result.PageSize,
            TotalPages = result.TotalPages
        };
    }

    [UsedImplicitly]
    public async Task<PaginatedResult<CommunityReviewDto>> GetPublicReviewsAsync(string gameTitle, PaginationQueryParameters queryParams)
    {
        var games = await GetPublicGamesMatchingTitleAsync(gameTitle, includeDetails: true);
        var query = games.OrderByDescending(g => g.Review!.Date).AsQueryable();

        var result = await query.PaginateAsync(queryParams);

        return new PaginatedResult<CommunityReviewDto>
        {
            Items = result.Items.Select(mapper.Map<CommunityReviewDto>).ToList(),
            TotalItems = result.TotalItems,
            CurrentPage = result.CurrentPage,
            PageSize = result.PageSize,
            TotalPages = result.TotalPages
        };
    }

    public async Task<ReviewStatsDto> GetReviewStatsAsync(string gameTitle)
    {
        var games = await GetPublicGamesMatchingTitleAsync(gameTitle, includeDetails: false);

        if (!(games.Count > 0))
        {
            return new ReviewStatsDto { GameTitle = gameTitle };
        }

        var reviews = games.Select(g => g.Review!).ToList();
        var totalReviews = reviews.Count;

        return new ReviewStatsDto
        {
            GameTitle = gameTitle,
            TotalReviews = totalReviews,
            AverageGameplay = Math.Round(reviews.Average(r => r.Gameplay), 2),
            AverageGraphics = Math.Round(reviews.Average(r => r.Graphics), 2),
            AverageStory = Math.Round(reviews.Average(r => r.Story), 2),
            AverageSound = Math.Round(reviews.Average(r => r.Sound), 2),
            OverallAverageRating = Math.Round(games.Average(g => g.Rating), 2),
            RatingDistribution = games
                .GroupBy(g => (int)Math.Round(g.Rating, MidpointRounding.AwayFromZero))
                .ToDictionary(g => g.Key, g => g.Count()),
            GameplayStats = CalculateAspectStats(reviews.Select(r => r.Gameplay)),
            GraphicsStats = CalculateAspectStats(reviews.Select(r => r.Graphics)),
            StoryStats = CalculateAspectStats(reviews.Select(r => r.Story)),
            SoundStats = CalculateAspectStats(reviews.Select(r => r.Sound))
        };
    }

    public async Task<List<CommunityReviewDto>> GetTopReviewsAsync(string gameTitle, int limit,
        int? currentUserId = null)
    {
        var games = await GetPublicGamesMatchingTitleAsync(gameTitle, includeDetails: true, currentUserId);

        games = games.OrderByDescending(g => g.Rating)
            .ThenByDescending(g => g.Review!.Date)
            .Take(limit)
            .ToList();
        return games.Select(mapper.Map<CommunityReviewDto>).ToList();
    }



    private static AspectStatsDto CalculateAspectStats(IEnumerable<decimal> values)
    {
        var enumerable = values as decimal[] ?? values.ToArray();
        if (!(enumerable.Length > 0))
        {
            return new AspectStatsDto();
        }

        var valuesList = enumerable.ToList();

        return new AspectStatsDto
        {
            Average = Math.Round(valuesList.Average(), 2),
            Min = valuesList.Min(),
            Max = valuesList.Max(),
            Distribution = valuesList
                .GroupBy(v => (int)Math.Round(v))
                .ToDictionary(g => g.Key, g => g.Count())
        };
    }

    private async Task<List<Game>> GetPublicGamesMatchingTitleAsync(string gameTitle, bool includeDetails = false, int? currentUserId = null)
    {
        var query = context.Games.Where(g => g.Review != null && g.Review.IsPublic == true);

        if (includeDetails)
        {
            query = query.Include(g => g.User).Include(g => g.ReviewComments);
        }

        var allGames = await query.ToListAsync();

        var games = allGames.Where(g => GameTitleMatcher.DoesGameTitleMatch(g.Title, gameTitle));

        if (currentUserId.HasValue)
        {
            games = games.Where(g => g.UserId != currentUserId.Value);
        }

        return games.ToList();
    }
}