using VideoGamesBacklogBackend.Models;

namespace VideoGamesBacklogBackend.Dto
{
    public class ActivityDto
    {
        public int Id { get; set; }
        public ActivityType Type { get; set; }
        public int GameId { get; set; }
        public string GameTitle { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? AdditionalInfo { get; set; }
    }

    public class CreateActivityDto
    {
        public ActivityType Type { get; set; }
        public int GameId { get; set; }
        public string? AdditionalInfo { get; set; }
    }

    public class UpdateActivityDto
    {
        public ActivityType? Type { get; set; }
        public string? AdditionalInfo { get; set; }
    }

    public class ActivityFiltersDto
    {
        public List<ActivityType>? Types { get; set; }
        public int? Year { get; set; }
        public int? Month { get; set; }
        public int? GameId { get; set; }
        public int? Limit { get; set; } = 50;
        public string SortDirection { get; set; } = "desc";
    }

    public class PaginatedActivitiesDto
    {
        public List<ActivityDto> Activities { get; set; } = new List<ActivityDto>();
        public int TotalCount { get; set; }
        public int PageSize { get; set; }
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
    }
}
