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
using Microsoft.Extensions.Caching.Memory;

namespace VideoGamesBacklogBackend.Services.Social;

[UsedImplicitly]
public class CommunityService(
    AppDbContext context,
    IMapper mapper,
    IMemoryCache cache)
    : ICommunityService
{
    public async Task<CommunityStatsDto> GetCommunityStatsAsync(string gameTitle)
    {
        var cacheKey = $"CommunityStats_{gameTitle}";
        if (cache.TryGetValue(cacheKey, out CommunityStatsDto? cachedStats) && cachedStats != null)
        {
            return cachedStats;
        }

        var normalizedTitle = GameTitleMatcher.GetFullyNormalizedTitle(gameTitle);
        
        var query = context.Games.AsNoTracking().Where(g => g.NormalizedTitle == normalizedTitle);

        var stats = await query.GroupBy(g => 1).Select(group => new
        {
            TotalPlayers = group.Count(),
            AveragePlaytime = group.Average(g => g.HoursPlayed),
            CompletedCount = group.Count(g => g.Status == GameStatus.Completed || g.Status == GameStatus.Platinum),
            InProgressCount = group.Count(g => g.Status == GameStatus.InProgress),
            ReviewsCount = group.Count(g => g.Review != null && g.Review.IsPublic == true),
            RatingsCount = group.Count(g => g.Rating > 0),
            TotalRatingSum = group.Sum(g => g.Rating > 0 ? g.Rating : 0)
        }).FirstOrDefaultAsync();

        if (stats == null)
        {
            return new CommunityStatsDto();
        }

        var completionRate = stats.TotalPlayers > 0
            ? Math.Round((decimal)stats.CompletedCount / stats.TotalPlayers * 100, 2)
            : 0;

        var averageRating = stats.RatingsCount > 0
            ? Math.Round((decimal)stats.TotalRatingSum / stats.RatingsCount, 2)
            : 0;

        var result = new CommunityStatsDto
        {
            TotalPlayers = stats.TotalPlayers,
            AverageRating = averageRating,
            TotalReviews = stats.ReviewsCount,
            AveragePlaytime = (int)Math.Round(stats.AveragePlaytime),
            CompletionRate = completionRate,
            CurrentlyPlaying = stats.InProgressCount
        };

        cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));
        return result;
    }

    public async Task<decimal> GetCommunityRatingAsync(string gameTitle)
    {
        var normalizedTitle = GameTitleMatcher.GetFullyNormalizedTitle(gameTitle);
        
        var query = context.Games.AsNoTracking().Where(g => g.Rating > 0 && g.NormalizedTitle == normalizedTitle);

        var rating = await query.AverageAsync(g => (decimal?)g.Rating);

        return rating.HasValue ? Math.Round(rating.Value, 2) : 0;
    }

    public async Task<CommunityRatingDto> GetCommunityRatingWithCountAsync(string gameTitle)
    {
        var cacheKey = $"CommunityRatingCount_{gameTitle}";
        if (cache.TryGetValue(cacheKey, out CommunityRatingDto? cachedRating) && cachedRating != null)
        {
            return cachedRating;
        }

        var normalizedTitle = GameTitleMatcher.GetFullyNormalizedTitle(gameTitle);
        
        var query = context.Games.AsNoTracking().Where(g => g.Rating > 0 && g.NormalizedTitle == normalizedTitle);

        var reviewCount = await query.CountAsync();
        var rating = reviewCount > 0 ? await query.AverageAsync(g => g.Rating) : 0;

        var result = new CommunityRatingDto
        {
            Rating = rating,
            ReviewCount = reviewCount
        };

        cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));
        return result;
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
        var query = GetPublicGamesMatchingTitleQuery(gameTitle, currentUserId);
        
        var sortedQuery = query.OrderByDescending(g => g.Review!.Date).ThenByDescending(g => g.Id);
        
        var projectedQuery = sortedQuery.Select(g => new
        {
            g.Id,
            g.Title,
            UserId = g.User != null ? g.User.Id : 0,
            UserName = g.User != null ? g.User.UserName : "Utente sconosciuto",
            Avatar = g.User != null ? g.User.Avatar : null,
            ReviewText = g.Review != null ? g.Review.Text : "",
            ReviewGameplay = g.Review != null ? g.Review.Gameplay : 0,
            ReviewGraphics = g.Review != null ? g.Review.Graphics : 0,
            ReviewStory = g.Review != null ? g.Review.Story : 0,
            ReviewSound = g.Review != null ? g.Review.Sound : 0,
            OverallRating = g.Rating,
            ReviewDate = g.Review != null && g.Review.Date.HasValue ? g.Review.Date.Value : DateTime.MinValue,
            CommentsCount = g.ReviewComments.Count
        });

        // The query is now fully filtered by NormalizedTitle in the database. We can paginate directly via EF Core!
        var paginatedResult = await projectedQuery.PaginateAsync(queryParams.Page, queryParams.PageSize);

        var resultItems = paginatedResult.Items.Select(g => new CommunityReviewDto
        {
            GameTitle = g.Title,
            Username = g.UserName ?? "Utente sconosciuto",
            Avatar = g.Avatar,
            Text = g.ReviewText,
            Gameplay = g.ReviewGameplay,
            Graphics = g.ReviewGraphics,
            Story = g.ReviewStory,
            Sound = g.ReviewSound,
            OverallRating = g.OverallRating,
            Date = g.ReviewDate,
            CommentsCount = g.CommentsCount
        }).ToList();

        return new PaginatedResult<CommunityReviewDto>
        {
            Items = resultItems,
            TotalItems = paginatedResult.TotalItems,
            CurrentPage = paginatedResult.CurrentPage,
            PageSize = paginatedResult.PageSize,
            TotalPages = paginatedResult.TotalPages
        };
    }

    [UsedImplicitly]
    public async Task<PaginatedResult<CommunityReviewDto>> GetPublicReviewsAsync(string gameTitle, PaginationQueryParameters queryParams)
    {
        return await GetReviewsAsync(gameTitle, queryParams);
    }

    public async Task<ReviewStatsDto> GetReviewStatsAsync(string gameTitle)
    {
        var cacheKey = $"ReviewStats_{gameTitle}";
        if (cache.TryGetValue(cacheKey, out ReviewStatsDto? cachedStats) && cachedStats != null)
        {
            return cachedStats;
        }

        var query = GetPublicGamesMatchingTitleQuery(gameTitle);
        
        var reviewData = await query.Select(g => new 
        {
            g.Rating,
            g.Review!.Gameplay,
            g.Review.Graphics,
            g.Review.Story,
            g.Review.Sound
        }).ToListAsync();

        if (!(reviewData.Count > 0))
        {
            return new ReviewStatsDto { GameTitle = gameTitle };
        }

        var totalReviews = reviewData.Count;

        var result = new ReviewStatsDto
        {
            GameTitle = gameTitle,
            TotalReviews = totalReviews,
            AverageGameplay = Math.Round(reviewData.Average(r => r.Gameplay), 2),
            AverageGraphics = Math.Round(reviewData.Average(r => r.Graphics), 2),
            AverageStory = Math.Round(reviewData.Average(r => r.Story), 2),
            AverageSound = Math.Round(reviewData.Average(r => r.Sound), 2),
            OverallAverageRating = Math.Round(reviewData.Average(g => g.Rating), 2),
            RatingDistribution = reviewData
                .GroupBy(g => (int)Math.Round(g.Rating, MidpointRounding.AwayFromZero))
                .ToDictionary(g => g.Key, g => g.Count()),
            GameplayStats = CalculateAspectStats(reviewData.Select(r => r.Gameplay)),
            GraphicsStats = CalculateAspectStats(reviewData.Select(r => r.Graphics)),
            StoryStats = CalculateAspectStats(reviewData.Select(r => r.Story)),
            SoundStats = CalculateAspectStats(reviewData.Select(r => r.Sound))
        };

        cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));
        return result;
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
        var query = GetPublicGamesMatchingTitleQuery(gameTitle, currentUserId);

        if (includeDetails)
        {
            query = query.AsSplitQuery().Include(g => g.User).Include(g => g.ReviewComments);
        }

        return await query.ToListAsync();
    }
    
    private IQueryable<Game> GetPublicGamesMatchingTitleQuery(string gameTitle, int? currentUserId = null)
    {
        var query = context.Games.AsNoTracking().Where(g => g.Review != null && g.Review.IsPublic == true);

        if (currentUserId.HasValue)
        {
            query = query.Where(g => g.UserId != currentUserId.Value);
        }

        var normalizedTitle = GameTitleMatcher.GetFullyNormalizedTitle(gameTitle);
        query = query.Where(g => g.NormalizedTitle == normalizedTitle);

        return query;
    }
}