using AutoMapper;
using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.DTOs.Activities;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.Infrastructure.Data;
using VideoGamesBacklogBackend.Interfaces.Activities;
using VideoGamesBacklogBackend.Interfaces.Social;

namespace VideoGamesBacklogBackend.Services.Activities;

public class ActivityCommentService(
    AppDbContext context,
    ILogger<ActivityCommentService> logger,
    INotificationService notificationService,
    IMapper mapper)
    : IActivityCommentService
{
    public async Task<List<ActivityCommentDto>> GetActivityCommentsAsync(int activityId)
    {
        var comments = await context.ActivityComments
            .Include(ac => ac.Author)
            .Where(ac => ac.ActivityId == activityId)
            .OrderBy(ac => ac.Date)
            .ToListAsync();

        return mapper.Map<List<ActivityCommentDto>>(comments);
    }

    public async Task<ActivityCommentDto?> AddActivityCommentAsync(CreateActivityCommentDto createCommentDto, int authorId)
    {
        var activity = await context.Activities
            .Include(a => a.Game)
            .FirstOrDefaultAsync(a => a.Id == createCommentDto.ActivityId);

        if (activity == null)
            throw new KeyNotFoundException("Attività non trovata.");

        var newComment = new ActivityComment
        {
            Text = createCommentDto.Text,
            Date = DateTime.UtcNow,
            ActivityId = createCommentDto.ActivityId,
            AuthorId = authorId
        };

        context.ActivityComments.Add(newComment);
        await context.SaveChangesAsync();

        var savedComment = await context.ActivityComments
            .Include(ac => ac.Author)
            .FirstOrDefaultAsync(ac => ac.Id == newComment.Id);

        if (savedComment == null) return null;

        if (activity is not { Game: not null, Type: ActivityType.Rated } ||
            activity.Game.UserId == authorId) return mapper.Map<ActivityCommentDto>(savedComment);
        try
        {
            await notificationService.CreateReviewCommentNotificationAsync(
                activity.Game.UserId,
                authorId,
                savedComment.Author?.UserName ?? "Utente sconosciuto",
                activity.GameTitle,
                createCommentDto.ActivityId
            );
        }
        catch (Exception notificationEx)
        {
            logger.LogError(notificationEx,
                "Errore nella creazione della notifica per commento all'attività");
        }

        return mapper.Map<ActivityCommentDto>(savedComment);
    }

    public async Task<bool> DeleteActivityCommentAsync(int commentId, int userId)
    {
        var comment = await context.ActivityComments
            .FirstOrDefaultAsync(ac => ac.Id == commentId);

        if (comment == null)
            throw new KeyNotFoundException("Commento non trovato.");

        if (comment.AuthorId != userId)
            throw new UnauthorizedAccessException("Non sei autorizzato ad eliminare questo commento.");

        context.ActivityComments.Remove(comment);
        await context.SaveChangesAsync();

        return true;
    }
}