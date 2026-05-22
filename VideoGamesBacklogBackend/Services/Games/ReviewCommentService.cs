using AutoMapper;
using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.DTOs.Social;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.Infrastructure.Data;
using VideoGamesBacklogBackend.Interfaces.Games;
using VideoGamesBacklogBackend.Interfaces.Social;

namespace VideoGamesBacklogBackend.Services.Games;

public class ReviewCommentService(
    AppDbContext context,
    ILogger<ReviewCommentService> logger,
    INotificationService notificationService,
    IMapper mapper)
    : IReviewCommentService
{
    public async Task<List<ReviewCommentDto>> GetReviewCommentsAsync(int reviewGameId)
    {
        var comments = await context.ReviewComments
            .Include(rc => rc.Author)
            .Where(rc => rc.ReviewGameId == reviewGameId)
            .OrderBy(rc => rc.Date)
            .ToListAsync();

        return mapper.Map<List<ReviewCommentDto>>(comments);
    }

    public async Task<ReviewCommentDto?> AddReviewCommentAsync(CreateReviewCommentDto createCommentDto, int authorId)
    {
        var reviewGame = await context.Games
            .Include(g => g.User)
            .FirstOrDefaultAsync(g => g.Id == createCommentDto.ReviewGameId
                                      && g.Review != null
                                      && g.Review.IsPublic == true);

        if (reviewGame == null)
            throw new KeyNotFoundException("Recensione non trovata o non pubblica.");

        var newComment = new ReviewComment
        {
            Text = createCommentDto.Text,
            Date = DateTime.UtcNow.ToString("yyyy-MM-dd"),
            AuthorId = authorId,
            ReviewGameId = createCommentDto.ReviewGameId
        };

        context.ReviewComments.Add(newComment);
        await context.SaveChangesAsync();

        var savedComment = await context.ReviewComments
            .Include(rc => rc.Author)
            .FirstOrDefaultAsync(rc => rc.Id == newComment.Id);

        if (savedComment == null) return null;

        try
        {
            await notificationService.CreateReviewCommentNotificationAsync(
                reviewGame.UserId,
                authorId,
                savedComment.Author?.UserName ?? "Utente sconosciuto",
                reviewGame.Title,
                createCommentDto.ReviewGameId
            );
        }
        catch (Exception notificationEx)
        {
            logger.LogError(notificationEx,
                "Errore nella creazione della notifica per commento recensione");
        }

        return mapper.Map<ReviewCommentDto>(savedComment);
    }

    public async Task<bool> DeleteReviewCommentAsync(int commentId, int userId)
    {
        var comment = await context.ReviewComments
            .FirstOrDefaultAsync(rc => rc.Id == commentId);

        if (comment == null)
            throw new KeyNotFoundException("Commento non trovato.");

        if (comment.AuthorId != userId)
            throw new UnauthorizedAccessException("Non sei autorizzato ad eliminare questo commento.");

        context.ReviewComments.Remove(comment);
        await context.SaveChangesAsync();

        return true;
    }
}