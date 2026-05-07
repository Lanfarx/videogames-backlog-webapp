using VideoGamesBacklogBackend.Dto;

namespace VideoGamesBacklogBackend.Interfaces
{
    public interface IActivityReactionService
    {
        Task<ActivityReactionDto?> AddReactionAsync(CreateActivityReactionDto createReactionDto, int userId);
        Task<bool> RemoveReactionAsync(int reactionId, int userId);
        Task<List<ActivityReactionDto>> GetActivityReactionsAsync(int activityId, int userId);
    }
}
