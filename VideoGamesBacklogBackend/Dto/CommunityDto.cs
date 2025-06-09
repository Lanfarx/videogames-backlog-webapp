using System.ComponentModel.DataAnnotations;

namespace VideoGamesBacklogBackend.Dto
{    /// <summary>
    /// DTO per le statistiche aggregate della community per un gioco
    /// </summary>
    public class CommunityStatsDto
    {
        public int TotalPlayers { get; set; }
        public decimal AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public int AveragePlaytime { get; set; }
        public decimal CompletionRate { get; set; }
        public int CurrentlyPlaying { get; set; }
    }

    /// <summary>
    /// DTO per il rating della community con numero di recensioni
    /// </summary>
    public class CommunityRatingDto
    {
        public decimal Rating { get; set; }
        public int ReviewCount { get; set; }
    }    /// <summary>
    /// DTO per una recensione della community
    /// </summary>
    public class CommunityReviewDto
    {
        public int Id { get; set; }
        public string GameTitle { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public string Text { get; set; } = string.Empty;
        public decimal Gameplay { get; set; }
        public decimal Graphics { get; set; }
        public decimal Story { get; set; }
        public decimal Sound { get; set; }
        public decimal OverallRating { get; set; }
        public string Date { get; set; } = string.Empty;
        public int HelpfulVotes { get; set; } // Per future implementazioni di voti utili
        public List<ReviewCommentDto> Comments { get; set; } = new List<ReviewCommentDto>(); // Commenti alla recensione
        public int CommentsCount { get; set; } // Numero di commenti
    }

    /// <summary>
    /// DTO per un commento a una recensione
    /// </summary>
    public class ReviewCommentDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public int AuthorId { get; set; }
        public string AuthorUsername { get; set; } = string.Empty;
        public string? AuthorAvatar { get; set; }
        public int ReviewGameId { get; set; }
    }    /// <summary>
    /// DTO per creare un nuovo commento a una recensione
    /// </summary>
    public class CreateReviewCommentDto
    {
        [Required]
        public string Text { get; set; } = string.Empty;
        
        [Required]
        public int ReviewGameId { get; set; }
    }

    /// <summary>
    /// DTO per le recensioni paginate
    /// </summary>
    public class PaginatedReviewsDto
    {
        public List<CommunityReviewDto> Reviews { get; set; } = new List<CommunityReviewDto>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    /// <summary>
    /// DTO per le statistiche dettagliate delle recensioni
    /// </summary>
    public class ReviewStatsDto
    {
        public string GameTitle { get; set; } = string.Empty;
        public int TotalReviews { get; set; }
        public decimal AverageGameplay { get; set; }
        public decimal AverageGraphics { get; set; }
        public decimal AverageStory { get; set; }
        public decimal AverageSound { get; set; }
        public decimal OverallAverageRating { get; set; }
        
        // Distribuzione dei rating (quante recensioni per ogni stellina)
        public Dictionary<int, int> RatingDistribution { get; set; } = new Dictionary<int, int>();
        
        // Statistiche per aspetti specifici
        public AspectStatsDto GameplayStats { get; set; } = new AspectStatsDto();
        public AspectStatsDto GraphicsStats { get; set; } = new AspectStatsDto();
        public AspectStatsDto StoryStats { get; set; } = new AspectStatsDto();
        public AspectStatsDto SoundStats { get; set; } = new AspectStatsDto();
    }

    /// <summary>
    /// DTO per le statistiche di un aspetto specifico della recensione
    /// </summary>
    public class AspectStatsDto
    {
        public decimal Average { get; set; }
        public decimal Min { get; set; }
        public decimal Max { get; set; }
        public Dictionary<int, int> Distribution { get; set; } = new Dictionary<int, int>();
    }
}
