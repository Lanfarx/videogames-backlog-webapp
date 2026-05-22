using VideoGamesBacklogBackend.DTOs.Activities;

namespace VideoGamesBacklogBackend.Interfaces.Activities;

public interface IActivityCommentService
{
    Task<List<ActivityCommentDto>> GetActivityCommentsAsync(int activityId);
    Task<ActivityCommentDto?> AddActivityCommentAsync(CreateActivityCommentDto createCommentDto, int authorId);
    Task<bool> DeleteActivityCommentAsync(int commentId, int userId);
}