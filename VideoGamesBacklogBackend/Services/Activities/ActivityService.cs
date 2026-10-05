using AutoMapper;
using JetBrains.Annotations;
using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Common.DTOs.Pagination;
using VideoGamesBacklogBackend.Common.Extensions;
using VideoGamesBacklogBackend.DTOs.Activities;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.Infrastructure.Data;
using VideoGamesBacklogBackend.Interfaces.Activities;
using VideoGamesBacklogBackend.Interfaces.Social;

namespace VideoGamesBacklogBackend.Services.Activities;

[UsedImplicitly]
public class ActivityService(
    AppDbContext context,
    IFriendshipService friendshipService,
    IMapper mapper)
    : IActivityService
{
    public async Task<PaginatedResult<ActivityDto>> GetActivitiesAsync(int userId, ActivityQueryParameters queryParams)
    {
        var query = context.Activities.AsNoTracking().Where(a => a.Game!.UserId == userId);
        return await GetPaginatedActivitiesInternalAsync(query, userId, queryParams);
    }

    public async Task<ActivityDto?> GetActivityByIdAsync(int activityId, int userId)
    {
        var activity = await context.Activities
            .AsNoTracking()
            .AsSplitQuery()
            .Include(a => a.Game)
            .Include(a => a.Reactions)
            .ThenInclude(r => r.User)
            .Include(a => a.ActivityComments)
            .ThenInclude(c => c.Author)
            .FirstOrDefaultAsync(a => a.Id == activityId && a.Game!.UserId == userId);

        return activity == null ? null : mapper.Map<ActivityDto>(activity, opt => opt.Items["CurrentUserId"] = userId);
    }

    public async Task<ActivityDto> CreateActivityAsync(int userId, CreateActivityDto createActivityDto)
    {
        var game = await context.Games
            .FirstOrDefaultAsync(g => g.Id == createActivityDto.GameId && g.UserId == userId);

        if (game == null)
            throw new UnauthorizedAccessException("Gioco non trovato o non autorizzato");

        var activity = new Activity
        {
            Type = createActivityDto.Type,
            GameId = createActivityDto.GameId,
            GameTitle = game.Title,
            AdditionalInfo = createActivityDto.AdditionalInfo,
            Timestamp = DateTime.UtcNow,
            Game = game
        };
        await SaveActivityEntityAsync(activity);

        return mapper.Map<ActivityDto>(activity, opt => opt.Items["CurrentUserId"] = userId);
    }

    public async Task<ActivityDto?> UpdateActivityAsync(int activityId, int userId,
        UpdateActivityDto updateActivityDto)
    {
        var activity = await context.Activities
            .AsSplitQuery()
            .Include(a => a.Game)
            .Include(a => a.Reactions)
            .ThenInclude(r => r.User)
            .Include(a => a.ActivityComments)
            .ThenInclude(c => c.Author)
            .FirstOrDefaultAsync(a => a.Id == activityId && a.Game!.UserId == userId);

        if (activity == null)
            return null;

        if (updateActivityDto.Type.HasValue)
            activity.Type = updateActivityDto.Type.Value;

        if (!string.IsNullOrEmpty(updateActivityDto.AdditionalInfo))
            activity.AdditionalInfo = updateActivityDto.AdditionalInfo;

        await context.SaveChangesAsync();

        return mapper.Map<ActivityDto>(activity, opt => opt.Items["CurrentUserId"] = userId);
    }

    public async Task<bool> DeleteActivityAsync(int activityId, int userId)
    {
        var activity = await context.Activities
            .Include(a => a.Game)
            .FirstOrDefaultAsync(a => a.Id == activityId && a.Game!.UserId == userId);

        if (activity == null)
            return false;

        context.Activities.Remove(activity);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<List<ActivityDto>> GetRecentActivitiesAsync(int userId, int count = 10)
    {
        var query = context.Activities
            .AsNoTracking()
            .Where(a => a.Game!.UserId == userId)
            .OrderByDescending(a => a.Timestamp)
            .Take(count);

        return await ProjectAndMapActivitiesAsync(query, userId);
    }

    public async Task<List<ActivityDto>> GetActivitiesByGameAsync(int gameId, int userId)
    {
        var query = context.Activities
            .AsNoTracking()
            .Where(a => a.GameId == gameId && a.Game!.UserId == userId)
            .OrderByDescending(a => a.Timestamp);

        return await ProjectAndMapActivitiesAsync(query, userId);
    }

    public async Task<Dictionary<string, int>> GetActivityStatsByTypeAsync(int userId, int? year = null)
    {
        var query = context.Activities
            .AsNoTracking()
            .Include(a => a.Game)
            .Where(a => a.Game!.UserId == userId);

        if (year.HasValue)
        {
            query = query.Where(a => a.Timestamp.Year == year.Value);
        }

        var stats = await query
            .GroupBy(a => a.Type)
            .Select(g => new { Type = g.Key.ToString(), Count = g.Count() })
            .ToDictionaryAsync(x => x.Type, x => x.Count);
        return stats;
    }

    public async Task CreateStatusChangeActivityAsync(Game game, GameStatus newStatus, string previousStatus,
        int userId)
    {
        var activityType = ActivityType.Played;
        string? additionalInfo = null;

        switch (newStatus)
        {
            case GameStatus.Completed:
                activityType = ActivityType.Completed;
                break;
            case GameStatus.Platinum:
                activityType = ActivityType.Platinum;
                break;
            case GameStatus.Abandoned:
                activityType = ActivityType.Abandoned;
                break;
            case GameStatus.InProgress:
                if (previousStatus is "Abandoned" or "Completed" or "Platinum")
                {
                    activityType = ActivityType.Played;
                    additionalInfo = "ripreso";
                }
                else
                {
                    return;
                }
                break;
            case GameStatus.NotStarted:
                break;
            default:
                return;
        }

        var threshold = DateTime.UtcNow.AddHours(-2);
        var recentActivity = await context.Activities
            .Where(a => a.GameId == game.Id && a.Type == activityType && a.Game!.UserId == userId && a.Timestamp >= threshold)
            .OrderByDescending(a => a.Timestamp)
            .FirstOrDefaultAsync();

        if (recentActivity != null)
        {
            recentActivity.AdditionalInfo = additionalInfo;
            recentActivity.Timestamp = DateTime.UtcNow;
            await context.SaveChangesAsync();
            return;
        }

        var createActivityDto = new CreateActivityDto
        {
            Type = activityType,
            GameId = game.Id,
            AdditionalInfo = additionalInfo
        };

        await CreateActivityAsync(userId, createActivityDto);
    }


    public async Task CreatePlaytimeActivityAsync(Game game, int newHours, int previousHours, bool wasNotStarted,
        int userId)
    {
        var hoursDifference = newHours - previousHours;
        var threshold = DateTime.UtcNow.AddHours(-2);
        var recentActivity = await context.Activities
            .Where(a => a.GameId == game.Id && a.Type == ActivityType.Played && a.Game!.UserId == userId && a.Timestamp >= threshold)
            .OrderByDescending(a => a.Timestamp)
            .FirstOrDefaultAsync();

        if (recentActivity != null)
        {
            var previousDelta = ExtractPlaytimeDelta(recentActivity.AdditionalInfo);
            var totalDifference = previousDelta + hoursDifference;
            
            if (totalDifference == 0)
            {
                context.Activities.Remove(recentActivity);
                await context.SaveChangesAsync();
                return;
            }

            var wasInitiated = (recentActivity.AdditionalInfo ?? "").Contains("iniziato");
            recentActivity.AdditionalInfo = FormatPlaytimeDelta(totalDifference, wasInitiated);
            recentActivity.Timestamp = DateTime.UtcNow;
            await context.SaveChangesAsync();
            return;
        }

        if (hoursDifference == 0) return;

        var createActivityDto = new CreateActivityDto
        {
            Type = ActivityType.Played,
            GameId = game.Id,
            AdditionalInfo = FormatPlaytimeDelta(hoursDifference, wasNotStarted)
        };

        await CreateActivityAsync(userId, createActivityDto);
    }

    private static int ExtractPlaytimeDelta(string? additionalInfo)
    {
        var input = additionalInfo ?? "";
        var match = System.Text.RegularExpressions.Regex.Match(input, @"(-?\d+)\s*or[ea]");
        if (match.Success && int.TryParse(match.Groups[1].Value, out var val))
            return val;
            
        var fallbackMatch = System.Text.RegularExpressions.Regex.Match(input, @"-?\d+");
        return fallbackMatch.Success && int.TryParse(fallbackMatch.Value, out val) ? val : 0;
    }

    private static string FormatPlaytimeDelta(int delta, bool wasInitiated)
    {
        if (wasInitiated && delta > 0)
        {
            return delta == 1 ? $"iniziato - {delta} ora giocata" : $"iniziato - {delta} ore giocate";
        }
        return delta < 0 ? $"-{Math.Abs(delta)} ore" : $"{delta} ore";
    }

    public async Task CreateRatingActivityAsync(Game game, decimal newRating, decimal previousRating, int userId)
    {
        if (newRating == previousRating || newRating == 0)
            return;

        var threshold = DateTime.UtcNow.AddHours(-2);
        var recentActivity = await context.Activities
            .Where(a => a.GameId == game.Id && a.Type == ActivityType.Rated && a.Game!.UserId == userId && a.Timestamp >= threshold)
            .OrderByDescending(a => a.Timestamp)
            .FirstOrDefaultAsync();

        var formattedRating = newRating % 1 == 0 ? newRating.ToString("0") : newRating.ToString("0.0");
        var additionalInfo = $"{formattedRating}/5 stelle";

        if (recentActivity != null)
        {
            recentActivity.AdditionalInfo = additionalInfo;
            recentActivity.Timestamp = DateTime.UtcNow;
            await context.SaveChangesAsync();
            return;
        }

        var createActivityDto = new CreateActivityDto
        {
            Type = ActivityType.Rated,
            GameId = game.Id,
            AdditionalInfo = additionalInfo
        };
        await CreateActivityAsync(userId, createActivityDto);
    }

    public async Task CreateAddGameActivityAsync(Game game, int userId)
    {
        var additionalInfoParts = new List<string>();

        if (!string.IsNullOrEmpty(game.Platform))
        {
            additionalInfoParts.Add($"Piattaforma: {game.Platform}");
        }

        if (game.ReleaseYear != 0 && game.ReleaseYear != DateTime.UtcNow.Year)
        {
            additionalInfoParts.Add($"Anno: {game.ReleaseYear}");
        }

        if (game.Price > 0)
        {
            additionalInfoParts.Add($"Prezzo: {game.Price:C}");
        }

        if (game.Status != GameStatus.NotStarted)
        {
            var statusLabel = game.Status switch
            {
                GameStatus.InProgress => "In corso",
                GameStatus.Completed => "Completato",
                GameStatus.Platinum => "Platino",
                GameStatus.Abandoned => "Abbandonato",
                _ => game.Status.ToString()
            };
            additionalInfoParts.Add($"Stato: {statusLabel}");
        }

        if (game.HoursPlayed > 0)
        {
            additionalInfoParts.Add($"Ore: {game.HoursPlayed}h");
        }

        var additionalInfo = additionalInfoParts.Count > 0
            ? string.Join(" • ", additionalInfoParts)
            : null;

        var createActivityDto = new CreateActivityDto
        {
            Type = ActivityType.Added,
            GameId = game.Id,
            AdditionalInfo = additionalInfo
        };

        await CreateActivityAsync(userId, createActivityDto);


    }

    public async Task<PaginatedResult<ActivityDto>> GetPublicActivitiesAsync(string userIdOrUsername, int currentUserId,
        ActivityQueryParameters queryParams)
    {
        User? targetUser = null;
        int targetUserId = 0;

        if (int.TryParse(userIdOrUsername, out var parsedId))
        {
            targetUser = await context.Users.FindAsync(parsedId);
        }

        if (targetUser == null)
        {
            targetUser = await context.Users.FirstOrDefaultAsync(u => u.UserName == userIdOrUsername);
        }

        if (targetUser != null)
        {
            targetUserId = targetUser.Id;
        }

        if (targetUser == null)
        {
            throw new ArgumentException("Utente non trovato");
        }

        var canViewDiary = await CanViewUserDiary(targetUserId, currentUserId);

        if (!canViewDiary)
        {
            throw new UnauthorizedAccessException("Non hai i permessi per visualizzare il diario di questo utente");
        } 

        var query = context.Activities.AsNoTracking().Where(a => a.Game!.UserId == targetUserId);
        return await GetPaginatedActivitiesInternalAsync(query, currentUserId, queryParams);
    }

    public async Task<bool> CanViewUserDiary(int targetUserId, int currentUserId)
    {
        if (targetUserId == currentUserId) return true;

        var targetUser = await context.Users.FindAsync(targetUserId);
        if (targetUser == null) return false;

        if (!targetUser.PrivacySettings.IsPrivate) return true;
        return await friendshipService.AreUsersFriendsAsync(currentUserId, targetUserId);
    }

    private class ActivityProjection
    {
        public int Id { get; set; }
        public ActivityType Type { get; set; }
        public int GameId { get; set; }
        public string GameTitle { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? AdditionalInfo { get; set; }
        public string? GameImageUrl { get; set; }
        public int CommentsCount { get; set; }
        public IEnumerable<ReactionProjection> Reactions { get; set; } = [];
        public IEnumerable<CommentProjection> Comments { get; set; } = [];
    }

    private class ReactionProjection
    {
        public int UserId { get; set; }
        public string Emoji { get; set; } = string.Empty;
        public string? UserName { get; set; }
    }

    private class CommentProjection
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int AuthorId { get; set; }
        public string? UserName { get; set; }
        public string? Avatar { get; set; }
        public int ActivityId { get; set; }
    }

    private static IQueryable<ActivityProjection> GetProjectedQuery(IQueryable<Activity> query)
    {
        return query.AsSplitQuery().Select(a => new ActivityProjection
        {
            Id = a.Id,
            Type = a.Type,
            GameId = a.GameId,
            GameTitle = a.GameTitle,
            Timestamp = a.Timestamp,
            AdditionalInfo = a.AdditionalInfo,
            GameImageUrl = a.Game != null ? a.Game.CoverImage : null,
            CommentsCount = a.ActivityComments.Count,
            Reactions = a.Reactions.Select(r => new ReactionProjection { UserId = r.UserId, Emoji = r.Emoji, UserName = r.User != null ? r.User.UserName : null }).ToList(),
            Comments = a.ActivityComments.Select(c => new CommentProjection { Id = c.Id, Text = c.Text, Date = c.Date, AuthorId = c.AuthorId, UserName = c.Author != null ? c.Author.UserName : null, Avatar = c.Author != null ? c.Author.Avatar : null, ActivityId = c.ActivityId }).ToList()
        });
    }

    private static ActivityDto MapToDto(ActivityProjection a, int currentUserId)
    {
        return new ActivityDto
        {
            Id = a.Id,
            Type = a.Type,
            GameId = a.GameId,
            GameTitle = a.GameTitle,
            Timestamp = a.Timestamp,
            AdditionalInfo = a.AdditionalInfo,
            GameImageUrl = a.GameImageUrl,
            CommentsCount = a.CommentsCount,
            UserReaction = a.Reactions.FirstOrDefault(r => r.UserId == currentUserId)?.Emoji,
            ReactionsSummary = a.Reactions.GroupBy(r => r.Emoji).Select(g => new ActivityReactionSummaryDto
            {
                Emoji = g.Key,
                Count = g.Count(),
                UserNames = g.Where(r => !string.IsNullOrEmpty(r.UserName)).Select(r => r.UserName!).ToList()
            }).ToList(),
            ReactionCounts = a.Reactions.GroupBy(r => r.Emoji).ToDictionary(g => g.Key, g => g.Count()),
            Reactions = a.Reactions.Select(r => new ActivityReactionDto
            {
                Emoji = r.Emoji,
                UserId = r.UserId,
                UserName = r.UserName
            }).ToList(),
            Comments = a.Comments.Select(c => new ActivityCommentDto
            {
                Id = c.Id,
                Text = c.Text,
                Date = c.Date,
                AuthorId = c.AuthorId,
                AuthorUsername = c.UserName ?? "Utente sconosciuto",
                AuthorAvatar = c.Avatar,
                ActivityId = c.ActivityId
            }).ToList()
        };
    }

    private static async Task<List<ActivityDto>> ProjectAndMapActivitiesAsync(IQueryable<Activity> query, int currentUserId)
    {
        var result = await GetProjectedQuery(query).ToListAsync();
        return result.Select(a => MapToDto(a, currentUserId)).ToList();
    }

    private static async Task<PaginatedResult<ActivityDto>> GetPaginatedActivitiesInternalAsync(
        IQueryable<Activity> query,
        int currentUserId,
        ActivityQueryParameters queryParams)
    {
        if (queryParams.Types?.Length > 0)
        {
            query = query.Where(a => queryParams.Types.Contains(a.Type));
        }

        if (queryParams.Year.HasValue)
        {
            query = query.Where(a => a.Timestamp.Year == queryParams.Year.Value);
        }

        if (queryParams.Month.HasValue)
        {
            query = query.Where(a => a.Timestamp.Month == queryParams.Month.Value);
        }

        if (queryParams.GameId.HasValue)
        {
            query = query.Where(a => a.GameId == queryParams.GameId.Value);
        }

        var sortedQuery = queryParams.SortOrder?.ToLower() == "asc"
            ? query.OrderBy(a => a.Timestamp).ThenBy(a => a.Id)
            : query.OrderByDescending(a => a.Timestamp).ThenByDescending(a => a.Id);

        var projectedQuery = GetProjectedQuery(sortedQuery);
        var result = await projectedQuery.PaginateAsync(queryParams.Page, queryParams.PageSize);

        return new PaginatedResult<ActivityDto>
        {
            Items = result.Items.Select(a => MapToDto(a, currentUserId)).ToList(),
            TotalItems = result.TotalItems,
            PageSize = result.PageSize,
            CurrentPage = result.CurrentPage,
            TotalPages = result.TotalPages
        };
    }

    public async Task CreateAddGamesBulkActivityAsync(List<Game> games, int userId)
    {
        if (games.Count == 0) return;

        if (games.Count == 1)
        {
            await CreateAddGameActivityAsync(games[0], userId);
            return;
        }

        var activity = new Activity
        {
            Type = ActivityType.Added,
            GameId = games[0].Id,
            GameTitle = $"{games.Count} nuovi giochi aggiunti",
            AdditionalInfo = $"Hai aggiunto {games.Count} giochi alla tua libreria da Steam",
            Timestamp = DateTime.UtcNow
        };
        
        await SaveActivityEntityAsync(activity);
    }

    public async Task CreatePlaytimeBulkActivityAsync(List<(Game Game, int NewHours, int PreviousHours, bool WasNotStarted)> updates, int userId)
    {
        if (updates.Count == 0) return;

        // Crea attività individuali per ciascun gioco aggiornato,
        // così da mostrare il titolo reale, la copertina e il link corretto alla pagina della libreria
        foreach (var u in updates)
        {
            await CreatePlaytimeActivityAsync(u.Game, u.NewHours, u.PreviousHours, u.WasNotStarted, userId);
        }
    }
    private async Task SaveActivityEntityAsync(Activity activity)
    {
        context.Activities.Add(activity);
        await context.SaveChangesAsync();
    }
}