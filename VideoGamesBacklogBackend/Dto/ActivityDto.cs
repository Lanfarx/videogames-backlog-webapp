using System.ComponentModel.DataAnnotations;
using VideoGamesBacklogBackend.Models;

namespace VideoGamesBacklogBackend.Dto
{    public class ActivityDto
    {
        public int Id { get; set; }
        public ActivityType Type { get; set; }
        public int GameId { get; set; }
        public string GameTitle { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? AdditionalInfo { get; set; }
        public object? GameImageUrl { get; internal set; }
        
        // Lista delle reazioni raggruppate per emoji
        public List<ActivityReactionSummaryDto> ReactionsSummary { get; set; } = new List<ActivityReactionSummaryDto>();
        
        // Per sapere se l'utente corrente ha già reagito e con quale emoji
        public string? UserReaction { get; set; }        // Proprietà aggiuntive per le reazioni (quando necessario)
        public List<ActivityReactionDto>? Reactions { get; set; }
        public Dictionary<string, int>? ReactionCounts { get; set; }

        // Commenti all'attività (solo per attività di tipo "Rated")
        public List<ActivityCommentDto> Comments { get; set; } = new List<ActivityCommentDto>();
        public int CommentsCount { get; set; }
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
        public int Page { get; internal set; }
    }

    // DTO per le reazioni emoji alle attività
    public class ActivityReactionDto
    {
        public int Id { get; set; }
        public string Emoji { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int ActivityId { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
    }

    public class CreateActivityReactionDto
    {
        [Required]
        [MaxLength(10)]
        public string Emoji { get; set; } = string.Empty;

        [Required]
        public int ActivityId { get; set; }
    }

    public class ActivityReactionSummaryDto
    {
        public string Emoji { get; set; } = string.Empty;
        public int Count { get; set; }
        public List<string> UserNames { get; set; } = new List<string>(); // Per mostrare chi ha reagito
    }

    public class AddActivityReactionDto
    {
        [Required]
        public int ActivityId { get; set; }

        [Required]
        [MaxLength(10)]
        public string Emoji { get; set; } = string.Empty;
    }
        public class RemoveActivityReactionDto
    {
        [Required]
        public int ActivityId { get; set; }

        [Required]
        [MaxLength(10)]
        public string Emoji { get; set; } = string.Empty;
    }


    public class ActivityCommentDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public int AuthorId { get; set; }
        public string AuthorUsername { get; set; } = string.Empty;
        public string? AuthorAvatar { get; set; }
        public int ActivityId { get; set; }
    }

    public class CreateActivityCommentDto
    {
        [Required]
        public string Text { get; set; } = string.Empty;
        
        [Required]
        public int ActivityId { get; set; }
    }public class ActivityWithReactionsDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public int GameId { get; set; }
        public string GameTitle { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? AdditionalInfo { get; set; }
        public string? GameImageUrl { get; set; }
        public List<ActivityReactionDto> Reactions { get; set; } = new List<ActivityReactionDto>();
        public Dictionary<string, int> ReactionCounts { get; set; } = new Dictionary<string, int>();        public string? UserReaction { get; set; } // L'emoji della reazione dell'utente corrente, se presente
        // Commenti all'attività (solo per attività di tipo "Rated")
        public List<ActivityCommentDto> Comments { get; set; } = new List<ActivityCommentDto>();
        public int CommentsCount { get; set; }
    }
}
