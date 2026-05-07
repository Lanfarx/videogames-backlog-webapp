using AutoMapper;
using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.DTOs.Activities;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.Infrastructure.Data;
using VideoGamesBacklogBackend.Interfaces.Activities;
using VideoGamesBacklogBackend.Interfaces.Social;

namespace VideoGamesBacklogBackend.Services.Activities
{
    public class ActivityReactionService(
        AppDbContext context,
        INotificationService notificationService,
        IActivityService activityService,
        IMapper mapper,
        ILogger<ActivityReactionService> logger)
        : IActivityReactionService
    {
        public async Task<ActivityReactionDto?> AddReactionAsync(CreateActivityReactionDto createReactionDto, int userId)
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
                var canViewDiary = await activityService.CanViewUserDiary(activity.Game.UserId, userId);
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
