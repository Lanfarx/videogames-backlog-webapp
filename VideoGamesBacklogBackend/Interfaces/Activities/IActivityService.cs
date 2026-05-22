using VideoGamesBacklogBackend.Common.DTOs.Pagination;
using VideoGamesBacklogBackend.DTOs.Activities;
using VideoGamesBacklogBackend.Entities;

namespace VideoGamesBacklogBackend.Interfaces.Activities;

public interface IActivityService
{
    Task<PaginatedResult<ActivityDto>> GetActivitiesAsync(int userId, ActivityQueryParameters queryParams);
    Task<ActivityDto?> GetActivityByIdAsync(int activityId, int userId);
    Task<ActivityDto> CreateActivityAsync(int userId, CreateActivityDto createActivityDto);
    Task<ActivityDto?> UpdateActivityAsync(int activityId, int userId, UpdateActivityDto updateActivityDto);
    Task<bool> DeleteActivityAsync(int activityId, int userId);        Task<List<ActivityDto>> GetRecentActivitiesAsync(int userId, int count = 10);
    Task<List<ActivityDto>> GetActivitiesByGameAsync(int gameId, int userId);
    Task<Dictionary<string, int>> GetActivityStatsByTypeAsync(int userId, int? year = null);
    Task<PaginatedResult<ActivityDto>> GetPublicActivitiesAsync(string userIdOrUsername, int currentUserId, ActivityQueryParameters queryParams);

    // Metodi helper per la creazione di attività specifiche
    Task CreateStatusChangeActivityAsync(Game game, GameStatus newStatus, string previousStatus, int userId);
    Task CreatePlaytimeActivityAsync(Game game, int newHours, int previousHours, bool wasNotStarted, int userId);
    Task CreateRatingActivityAsync(Game game, decimal newRating, decimal previousRating, int userId);
    Task CreateAddGameActivityAsync(Game game, int userId);

    Task<bool> CanViewUserDiary(int targetUserId, int currentUserId);
}