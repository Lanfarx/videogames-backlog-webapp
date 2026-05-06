using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Data;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Interfaces;
using AutoMapper;
using VideoGamesBacklogBackend.Entities;

namespace VideoGamesBacklogBackend.Services
{
    public class ActivityService(
        AppDbContext context,
        INotificationService notificationService,
        IFriendshipService friendshipService,
        IMapper mapper,
        ILogger<ActivityService> logger)
        : IActivityService
    {
        public async Task<PaginatedActivitiesDto> GetActivitiesAsync(int userId, ActivityQueryParameters queryParams)
        {
            var query = context.Activities
                .Include(a => a.Game)
                .Include(a => a.Reactions)
                .ThenInclude(r => r.User)
                .Include(a => a.ActivityComments)
                .ThenInclude(c => c.Author)
                .Where(a => a.Game!.UserId == userId);

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

            query = queryParams.SortDirection?.ToLower() == "asc"
                ? query.OrderBy(a => a.Timestamp)
                : query.OrderByDescending(a => a.Timestamp);

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalCount / queryParams.PageSize);

            var activities = await query
                .Skip((queryParams.Page - 1) * queryParams.PageSize)
                .Take(queryParams.PageSize)
                .ToListAsync();

            return new PaginatedActivitiesDto
            {
                Activities = activities.Select(activity =>
                    mapper.Map<ActivityDto>(activity, opt => opt.Items["CurrentUserId"] = userId)).ToList(),
                TotalCount = totalCount,
                PageSize = queryParams.PageSize,
                CurrentPage = queryParams.Page,
                TotalPages = totalPages
            };
        }

        public async Task<ActivityDto?> GetActivityByIdAsync(int activityId, int userId)
        {
            var activity = await context.Activities
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
                Timestamp = DateTime.UtcNow
            };
            context.Activities.Add(activity);
            await context.SaveChangesAsync();
            var createdActivity = await context.Activities
                .Include(a => a.Game)
                .Include(a => a.Reactions)
                .ThenInclude(r => r.User)
                .Include(a => a.ActivityComments)
                .ThenInclude(c => c.Author)
                .FirstAsync(a => a.Id == activity.Id);

            return mapper.Map<ActivityDto>(createdActivity, opt => opt.Items["CurrentUserId"] = userId);
        }

        public async Task<ActivityDto?> UpdateActivityAsync(int activityId, int userId,
            UpdateActivityDto updateActivityDto)
        {
            var activity = await context.Activities
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
            var activities = await context.Activities
                .Include(a => a.Game)
                .Include(a => a.Reactions)
                .ThenInclude(r => r.User)
                .Include(a => a.ActivityComments)
                .ThenInclude(c => c.Author)
                .Where(a => a.Game!.UserId == userId)
                .OrderByDescending(a => a.Timestamp)
                .Take(count)
                .ToListAsync();

            return activities.Select(a => mapper.Map<ActivityDto>(a, opt => opt.Items["CurrentUserId"] = userId))
                .ToList();
        }

        public async Task<List<ActivityDto>> GetActivitiesByGameAsync(int gameId, int userId)
        {
            var activities = await context.Activities
                .Include(a => a.Game)
                .Include(a => a.Reactions)
                .ThenInclude(r => r.User)
                .Include(a => a.ActivityComments)
                .ThenInclude(c => c.Author)
                .Where(a => a.GameId == gameId && a.Game!.UserId == userId)
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync();

            return activities.Select(a => mapper.Map<ActivityDto>(a, opt => opt.Items["CurrentUserId"] = userId))
                .ToList();
        }

        public async Task<Dictionary<string, int>> GetActivityStatsByTypeAsync(int userId, int? year = null)
        {
            var query = context.Activities
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
            string additionalInfo;
            if (wasNotStarted && newHours > 0)
            {
                additionalInfo = hoursDifference == 1
                    ? $"iniziato - {hoursDifference} ora giocata"
                    : $"iniziato - {hoursDifference} ore giocate";
            }
            else switch (hoursDifference)
            {
                case < 0:
                    additionalInfo = $"-{Math.Abs(hoursDifference)} ore";
                    break;
                case > 0:
                    additionalInfo = $"{hoursDifference} ore";
                    break;
                default:
                    return;
            }

            var createActivityDto = new CreateActivityDto
            {
                Type = ActivityType.Played,
                GameId = game.Id,
                AdditionalInfo = additionalInfo
            };

            await CreateActivityAsync(userId, createActivityDto);
        }

        public async Task CreateRatingActivityAsync(Game game, decimal newRating, decimal previousRating, int userId)
        {
            if (newRating == previousRating || newRating == 0)
                return;

            var formattedRating = newRating % 1 == 0 ? newRating.ToString("0") : newRating.ToString("0.0");
            var additionalInfo = $"{formattedRating}/5 stelle";

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

            if (game.HoursPlayed > 0 && game.Status != GameStatus.NotStarted)
            {
                var activityType = game.Status switch
                {
                    GameStatus.InProgress => ActivityType.Played,
                    GameStatus.Completed => ActivityType.Completed,
                    GameStatus.Platinum => ActivityType.Platinum,
                    GameStatus.Abandoned => ActivityType.Abandoned,
                    _ => ActivityType.Played
                };

                var playedActivityDto = new CreateActivityDto
                {
                    Type = activityType,
                    GameId = game.Id,
                    AdditionalInfo = game.HoursPlayed > 0
                        ? (game.HoursPlayed == 1
                            ? $"iniziato - {game.HoursPlayed} ora giocata"
                            : $"iniziato - {game.HoursPlayed} ore giocate")
                        : null
                };

                await CreateActivityAsync(userId, playedActivityDto);
            }
        }

        public async Task<PaginatedActivitiesDto> GetPublicActivitiesAsync(string userIdOrUsername, int currentUserId,
            ActivityQueryParameters queryParams)
        {
            User? targetUser = null;

            if (int.TryParse(userIdOrUsername, out var targetUserId))
            {
                targetUser = await context.Users.FindAsync(targetUserId);
            }
            else
            {
                targetUser = await context.Users.FirstOrDefaultAsync(u => u.UserName == userIdOrUsername);
                if (targetUser != null)
                {
                    targetUserId = targetUser.Id;
                }
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

            var query = context.Activities
                .Include(a => a.Game)
                .Include(a => a.Reactions)
                .ThenInclude(r => r.User)
                .Include(a => a.ActivityComments)
                .ThenInclude(c => c.Author)
                .Where(a => a.Game!.UserId == targetUserId);

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

            query = queryParams.SortDirection?.ToLower() == "asc" ? query.OrderBy(a => a.Timestamp) : query.OrderByDescending(a => a.Timestamp);

            var totalCount = await query.CountAsync(); 
            var activities = await query
                .Skip((queryParams.Page - 1) * queryParams.PageSize)
                .Take(queryParams.PageSize)
                .ToListAsync();

            return new PaginatedActivitiesDto
            {
                Activities = activities
                    .Select(a => mapper.Map<ActivityDto>(a, opt => opt.Items["CurrentUserId"] = currentUserId))
                    .ToList(),
                TotalCount = totalCount,
                Page = queryParams.Page,
                PageSize = queryParams.PageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / queryParams.PageSize)
            };
        }

        private async Task<bool> CanViewUserDiary(int targetUserId, int currentUserId)
        {
            if (targetUserId == currentUserId) return true;

            var targetUser = await context.Users.FindAsync(targetUserId);
            if (targetUser == null) return false;

            if (!targetUser.PrivacySettings.IsPrivate) return true;
            return await friendshipService.AreUsersFriendsAsync(currentUserId, targetUserId);
        } 

        public async Task<ActivityReactionDto?> AddReactionAsync(CreateActivityReactionDto createReactionDto,
            int userId)
        {
            var activity = await context.Activities
                .Include(a => a.Game)
                .FirstOrDefaultAsync(a => a.Id == createReactionDto.ActivityId);
            if (activity == null) return null;

            var existingReaction = await context.ActivityReactions
                .FirstOrDefaultAsync(r => r.ActivityId == createReactionDto.ActivityId
                                          && r.UserId == userId
                                          && r.Emoji == createReactionDto.Emoji);

            if (existingReaction != null)
            {
                context.ActivityReactions.Remove(existingReaction);
                await context.SaveChangesAsync();
                return null; 
            }

            var reaction = new ActivityReaction
            {
                Emoji = createReactionDto.Emoji,
                ActivityId = createReactionDto.ActivityId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            context.ActivityReactions.Add(reaction);
            await context.SaveChangesAsync();

            var user = await context.Users.FindAsync(userId);

            if (activity.Game != null && activity.Game.UserId != userId)
            {
                try
                {
                    await notificationService.CreateActivityReactionNotificationAsync(
                        activity.Game.UserId,
                        userId,
                        user?.UserName ?? "Utente sconosciuto",
                        createReactionDto.Emoji,
                        activity.GameTitle,
                        createReactionDto.ActivityId
                    );
                }
                catch (Exception notificationEx)
                {
                    logger.LogWarning(notificationEx,
                        "Errore nella creazione della notifica per reazione all'attività {ActivityId}",
                        createReactionDto.ActivityId);
                }
            }

            return mapper.Map<ActivityReactionDto>(reaction);
        }

        public async Task<bool> RemoveReactionAsync(int reactionId, int userId)
        {
            var reaction = await context.ActivityReactions
                .FirstOrDefaultAsync(r => r.Id == reactionId && r.UserId == userId);

            if (reaction == null)
                throw new KeyNotFoundException("Reazione non trovata o non autorizzato.");

            context.ActivityReactions.Remove(reaction);
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<List<ActivityReactionDto>> GetActivityReactionsAsync(int activityId, int userId)
        {
            var activity = await context.Activities
                .Include(a => a.Game)
                .FirstOrDefaultAsync(a => a.Id == activityId);

            if (activity == null)
                throw new KeyNotFoundException("Attività non trovata.");

            if (activity.Game!.UserId != userId)
            {
                var canViewDiary = await CanViewUserDiary(activity.Game.UserId, userId);
                if (!canViewDiary)
                {
                    throw new UnauthorizedAccessException(
                        "Non hai i permessi per visualizzare le reazioni di questa attività");
                }
            }

            var reactions = await context.ActivityReactions
                .Include(r => r.User)
                .Where(r => r.ActivityId == activityId)
                .OrderBy(r => r.CreatedAt)
                .ToListAsync();

            return mapper.Map<List<ActivityReactionDto>>(reactions);
        }
    }
}