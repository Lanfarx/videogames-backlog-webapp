using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Data;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Models;
using VideoGamesBacklogBackend.Helpers;

namespace VideoGamesBacklogBackend.Services
{
    public class CommunityService : ICommunityService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<CommunityService> _logger;

        public CommunityService(AppDbContext context, ILogger<CommunityService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<CommunityStatsDto> GetCommunityStatsAsync(string gameTitle)
        {
            try
            {
                var normalizedGameTitle = gameTitle.ToLower().Trim();
                var games = await _context.Games
                    .Where(g => g.Title.ToLower().Contains(normalizedGameTitle) ||
                               normalizedGameTitle.Contains(g.Title.ToLower()))
                    .Select(g => new {
                        g.Id,
                        g.HoursPlayed,
                        g.Status,
                        g.Rating,
                        HasPublicReview = g.Review != null && g.Review.IsPublic == true
                    })
                    .ToListAsync();

                if (!games.Any())
                {
                    return new CommunityStatsDto();
                }

                var totalPlayers = games.Count;
                var gamesWithReviews = games.Where(g => g.HasPublicReview).ToList();
                var totalReviews = gamesWithReviews.Count;

                var averageRating = totalReviews > 0
                    ? gamesWithReviews.Average(g => g.Rating)
                    : 0;

                var averagePlaytime = games.Any()
                    ? (int)Math.Round(games.Average(g => g.HoursPlayed))
                    : 0;

                var completedGames = games.Where(g => g.Status == GameStatus.Completed || g.Status == GameStatus.Platinum).Count();
                var completionRate = totalPlayers > 0
                    ? Math.Round((decimal)completedGames / totalPlayers * 100, 2)
                    : 0;

                var currentlyPlaying = games.Where(g => g.Status == GameStatus.InProgress).Count();

                return new CommunityStatsDto
                {
                    TotalPlayers = totalPlayers,
                    AverageRating = Math.Round(averageRating, 2),
                    TotalReviews = totalReviews,
                    AveragePlaytime = averagePlaytime,
                    CompletionRate = completionRate,
                    CurrentlyPlaying = currentlyPlaying
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel calcolo delle statistiche community per {GameTitle}", gameTitle);
                throw;
            }
        }

        public async Task<decimal> GetCommunityRatingAsync(string gameTitle)
        {
            try
            {
                var games = await _context.Games
                    .Where(g => g.Rating > 0)
                    .ToListAsync();

                games = games.Where(g => GameTitleMatcher.DoesGameTitleMatch(g.Title, gameTitle)).ToList();

                return games.Any() ? Math.Round(games.Average(g => g.Rating), 2) : 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel calcolo del rating community per {GameTitle}", gameTitle);
                throw;
            }
        }

        public async Task<CommunityRatingDto> GetCommunityRatingWithCountAsync(string gameTitle)
        {
            try
            {
                var games = await _context.Games
                    .Where(g => g.Rating > 0)
                    .ToListAsync();

                games = games.Where(g => GameTitleMatcher.DoesGameTitleMatch(g.Title, gameTitle)).ToList();

                var rating = games.Any() ? Math.Round(games.Average(g => g.Rating), 2) : 0;
                var reviewCount = games.Count;

                return new CommunityRatingDto
                {
                    Rating = rating,
                    ReviewCount = reviewCount
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel calcolo del rating community con conteggio per {GameTitle}", gameTitle);
                throw;
            }
        }

        public async Task<Dictionary<string, decimal>> GetCommunityRatingsAsync(List<string> gameTitles)
        {
            try
            {
                var ratings = new Dictionary<string, decimal>();

                foreach (var title in gameTitles)
                {
                    var rating = await GetCommunityRatingAsync(title);
                    ratings[title] = rating;
                }

                return ratings;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel calcolo dei rating community per {GameTitles}", string.Join(", ", gameTitles));
                throw;
            }
        }

        public async Task<Dictionary<string, CommunityRatingDto>> GetCommunityRatingsWithCountAsync(List<string> gameTitles)
        {
            try
            {
                var ratingsWithCount = new Dictionary<string, CommunityRatingDto>();

                foreach (var title in gameTitles)
                {
                    var ratingData = await GetCommunityRatingWithCountAsync(title);
                    ratingsWithCount[title] = ratingData;
                }

                return ratingsWithCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel calcolo dei rating community con conteggio per {GameTitles}", string.Join(", ", gameTitles));
                throw;
            }
        }

        public async Task<PaginatedReviewsDto> GetReviewsAsync(string gameTitle, int page, int pageSize, int? currentUserId = null)
        {
            try
            {
                var allGames = await _context.Games
                    .Include(g => g.User)
                    .Include(g => g.ReviewComments)
                    .Where(g => g.Review != null && g.Review.IsPublic == true)
                    .ToListAsync();

                var games = allGames.Where(g => GameTitleMatcher.DoesGameTitleMatch(g.Title, gameTitle))
                    .Where(g => !currentUserId.HasValue || g.UserId != currentUserId.Value)
                    .OrderByDescending(g => g.Review!.Date)
                    .ToList();

                var totalCount = games.Count;
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
                var paginatedGames = games
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();
                var reviews = paginatedGames.Select(g => new CommunityReviewDto
                {
                    Id = g.Id,
                    GameTitle = g.Title,
                    UserId = g.UserId,
                    Username = g.User?.UserName ?? "Utente sconosciuto",
                    Avatar = g.User?.Avatar,
                    Text = g.Review?.Text ?? "",
                    Gameplay = g.Review?.Gameplay ?? 0,
                    Graphics = g.Review?.Graphics ?? 0,
                    Story = g.Review?.Story ?? 0,
                    Sound = g.Review?.Sound ?? 0,
                    OverallRating = g.Rating,
                    Date = g.Review?.Date ?? "",
                    CommentsCount = g.ReviewComments?.Count ?? 0,
                    Comments = new List<ReviewCommentDto>()
                }).ToList();

                return new PaginatedReviewsDto
                {
                    Reviews = reviews,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = totalPages
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel recupero delle recensioni per {GameTitle}", gameTitle);
                throw;
            }
        }

        public async Task<PaginatedReviewsDto> GetPublicReviewsAsync(string gameTitle, int page, int pageSize)
        {
            try
            {
                var allGames = await _context.Games
                    .Include(g => g.User)
                    .Include(g => g.ReviewComments)
                    .Where(g => g.Review != null && g.Review.IsPublic == true)
                    .ToListAsync();

                var games = allGames.Where(g => GameTitleMatcher.DoesGameTitleMatch(g.Title, gameTitle))
                    .OrderByDescending(g => g.Review!.Date)
                    .ToList();

                var totalCount = games.Count;
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
                var paginatedGames = games
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();
                var reviews = paginatedGames.Select(g => new CommunityReviewDto
                {
                    Id = g.Id,
                    GameTitle = g.Title,
                    UserId = g.UserId,
                    Username = g.User?.UserName ?? "Utente sconosciuto",
                    Avatar = g.User?.Avatar,
                    Text = g.Review?.Text ?? "",
                    Gameplay = g.Review?.Gameplay ?? 0,
                    Graphics = g.Review?.Graphics ?? 0,
                    Story = g.Review?.Story ?? 0,
                    Sound = g.Review?.Sound ?? 0,
                    OverallRating = g.Rating,
                    Date = g.Review?.Date ?? "",
                    HelpfulVotes = 0,
                    CommentsCount = g.ReviewComments?.Count ?? 0,
                    Comments = new List<ReviewCommentDto>()
                }).ToList();

                return new PaginatedReviewsDto
                {
                    Reviews = reviews,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = totalPages
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel recupero delle recensioni pubbliche per {GameTitle}", gameTitle);
                throw;
            }
        }

        public async Task<ReviewStatsDto> GetReviewStatsAsync(string gameTitle)
        {
            try
            {
                var allGames = await _context.Games
                    .Where(g => g.Review != null && g.Review.IsPublic == true)
                    .ToListAsync();

                var games = allGames.Where(g => GameTitleMatcher.DoesGameTitleMatch(g.Title, gameTitle)).ToList();

                if (!games.Any())
                {
                    return new ReviewStatsDto { GameTitle = gameTitle };
                }

                var reviews = games.Select(g => g.Review!).ToList();
                var totalReviews = reviews.Count;

                var stats = new ReviewStatsDto
                {
                    GameTitle = gameTitle,
                    TotalReviews = totalReviews,
                    AverageGameplay = Math.Round(reviews.Average(r => r.Gameplay), 2),
                    AverageGraphics = Math.Round(reviews.Average(r => r.Graphics), 2),
                    AverageStory = Math.Round(reviews.Average(r => r.Story), 2),
                    AverageSound = Math.Round(reviews.Average(r => r.Sound), 2),
                    OverallAverageRating = Math.Round(games.Average(g => g.Rating), 2)
                };

                stats.RatingDistribution = games
                    .GroupBy(g => (int)Math.Round(g.Rating, MidpointRounding.AwayFromZero))
                    .ToDictionary(g => g.Key, g => g.Count());

                stats.GameplayStats = CalculateAspectStats(reviews.Select(r => r.Gameplay));
                stats.GraphicsStats = CalculateAspectStats(reviews.Select(r => r.Graphics));
                stats.StoryStats = CalculateAspectStats(reviews.Select(r => r.Story));
                stats.SoundStats = CalculateAspectStats(reviews.Select(r => r.Sound));

                return stats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel calcolo delle statistiche recensioni per {GameTitle}", gameTitle);
                throw;
            }
        }

        public async Task<List<CommunityReviewDto>> GetTopReviewsAsync(string gameTitle, int limit, int? currentUserId = null)
        {
            try
            {
                var allGames = await _context.Games
                    .Include(g => g.User)
                    .Include(g => g.ReviewComments)
                    .Where(g => g.Review != null && g.Review.IsPublic == true)
                    .ToListAsync();

                var games = allGames.Where(g => GameTitleMatcher.DoesGameTitleMatch(g.Title, gameTitle))
                    .Where(g => !currentUserId.HasValue || g.UserId != currentUserId.Value)
                    .OrderByDescending(g => g.Rating)
                    .ThenByDescending(g => g.Review!.Date)
                    .Take(limit)
                    .ToList();
                return games.Select(g => new CommunityReviewDto
                {
                    Id = g.Id,
                    GameTitle = g.Title,
                    UserId = g.UserId,
                    Username = g.User?.UserName ?? "Utente sconosciuto",
                    Avatar = g.User?.Avatar,
                    Text = g.Review?.Text ?? "",
                    Gameplay = g.Review?.Gameplay ?? 0,
                    Graphics = g.Review?.Graphics ?? 0,
                    Story = g.Review?.Story ?? 0,
                    Sound = g.Review?.Sound ?? 0,
                    OverallRating = g.Rating,
                    Date = g.Review?.Date ?? "",
                    HelpfulVotes = 0,
                    CommentsCount = g.ReviewComments?.Count ?? 0,
                    Comments = new List<ReviewCommentDto>()
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel recupero delle top recensioni per {GameTitle}", gameTitle);
                throw;
            }
        }

        /// <summary>
        /// Ottiene i commenti per una specifica recensione
        /// </summary>
        public async Task<List<ReviewCommentDto>> GetReviewCommentsAsync(int reviewGameId)
        {
            try
            {
                var comments = await _context.ReviewComments
                    .Include(rc => rc.Author)
                    .Where(rc => rc.ReviewGameId == reviewGameId)
                    .OrderBy(rc => rc.Date)
                    .ToListAsync();

                return comments.Select(rc => new ReviewCommentDto
                {
                    Id = rc.Id,
                    Text = rc.Text,
                    Date = rc.Date,
                    AuthorId = rc.AuthorId,
                    AuthorUsername = rc.Author?.UserName ?? "Utente sconosciuto",
                    AuthorAvatar = rc.Author?.Avatar,
                    ReviewGameId = rc.ReviewGameId
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel recupero dei commenti per la recensione {ReviewGameId}", reviewGameId);
                throw;
            }
        }

        /// <summary>
        /// Aggiunge un commento a una recensione
        /// </summary>
        public async Task<ReviewCommentDto?> AddReviewCommentAsync(CreateReviewCommentDto createCommentDto, int authorId)
        {
            try
            {
                var reviewGame = await _context.Games
                    .Include(g => g.User)
                    .FirstOrDefaultAsync(g => g.Id == createCommentDto.ReviewGameId
                                               && g.Review != null
                                               && g.Review.IsPublic == true);

                if (reviewGame == null)
                {
                    return null;
                }

                var newComment = new ReviewComment
                {
                    Text = createCommentDto.Text,
                    Date = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                    AuthorId = authorId,
                    ReviewGameId = createCommentDto.ReviewGameId
                };

                _context.ReviewComments.Add(newComment);
                await _context.SaveChangesAsync();

                var savedComment = await _context.ReviewComments
                    .Include(rc => rc.Author)
                    .FirstOrDefaultAsync(rc => rc.Id == newComment.Id);

                return savedComment == null ? null : new ReviewCommentDto
                {
                    Id = savedComment.Id,
                    Text = savedComment.Text,
                    Date = savedComment.Date,
                    AuthorId = savedComment.AuthorId,
                    AuthorUsername = savedComment.Author?.UserName ?? "Utente sconosciuto",
                    AuthorAvatar = savedComment.Author?.Avatar,
                    ReviewGameId = savedComment.ReviewGameId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nell'aggiunta del commento alla recensione {ReviewGameId}", createCommentDto.ReviewGameId);
                throw;
            }
        }

        /// <summary>
        /// Elimina un commento a una recensione
        /// </summary>
        public async Task<bool> DeleteReviewCommentAsync(int commentId, int userId)
        {
            try
            {
                var comment = await _context.ReviewComments
                    .FirstOrDefaultAsync(rc => rc.Id == commentId);

                if (comment == null)
                {
                    return false;
                }

                if (comment.AuthorId != userId)
                {
                    return false;
                }

                _context.ReviewComments.Remove(comment);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nell'eliminazione del commento {CommentId}", commentId);
                throw;
            }
        }

        /// <summary>
        /// Ottiene tutti i commenti per un'attività
        /// </summary>
        public async Task<List<ActivityCommentDto>> GetActivityCommentsAsync(int activityId)
        {
            try
            {
                var comments = await _context.ActivityComments
                    .Include(ac => ac.Author)
                    .Where(ac => ac.ActivityId == activityId)
                    .OrderBy(ac => ac.Date)
                    .ToListAsync();

                return comments.Select(comment => new ActivityCommentDto
                {
                    Id = comment.Id,
                    Text = comment.Text,
                    Date = comment.Date,
                    AuthorId = comment.AuthorId,
                    AuthorUsername = comment.Author?.UserName ?? "Utente sconosciuto",
                    AuthorAvatar = comment.Author?.Avatar,
                    ActivityId = comment.ActivityId
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel recupero dei commenti per l'attività {ActivityId}", activityId);
                throw;
            }
        }

        /// <summary>
        /// Aggiunge un commento a un'attività
        /// </summary>
        public async Task<ActivityCommentDto?> AddActivityCommentAsync(CreateActivityCommentDto createCommentDto, int authorId)
        {
            try
            {
                var activity = await _context.Activities
                    .FirstOrDefaultAsync(a => a.Id == createCommentDto.ActivityId);

                if (activity == null)
                {
                    return null;
                }
                var newComment = new ActivityComment
                {
                    Text = createCommentDto.Text,
                    Date = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    ActivityId = createCommentDto.ActivityId,
                    AuthorId = authorId
                };

                _context.ActivityComments.Add(newComment);
                await _context.SaveChangesAsync();

                var savedComment = await _context.ActivityComments
                    .Include(ac => ac.Author)
                    .FirstOrDefaultAsync(ac => ac.Id == newComment.Id);

                return savedComment == null ? null : new ActivityCommentDto
                {
                    Id = savedComment.Id,
                    Text = savedComment.Text,
                    Date = savedComment.Date,
                    AuthorId = savedComment.AuthorId,
                    AuthorUsername = savedComment.Author?.UserName ?? "Utente sconosciuto",
                    AuthorAvatar = savedComment.Author?.Avatar,
                    ActivityId = savedComment.ActivityId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nell'aggiunta del commento all'attività {ActivityId}", createCommentDto.ActivityId);
                throw;
            }
        }

        /// <summary>
        /// Elimina un commento a un'attività
        /// </summary>
        public async Task<bool> DeleteActivityCommentAsync(int commentId, int userId)
        {
            try
            {
                var comment = await _context.ActivityComments
                    .FirstOrDefaultAsync(ac => ac.Id == commentId);

                if (comment == null)
                {
                    return false;
                }

                if (comment.AuthorId != userId)
                {
                    return false;
                }

                _context.ActivityComments.Remove(comment);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nell'eliminazione del commento {CommentId}", commentId);
                throw;
            }
        }

        private AspectStatsDto CalculateAspectStats(IEnumerable<decimal> values)
        {
            if (!values.Any())
            {
                return new AspectStatsDto();
            }

            var valuesList = values.ToList();

            return new AspectStatsDto
            {
                Average = Math.Round(valuesList.Average(), 2),
                Min = valuesList.Min(),
                Max = valuesList.Max(),
                Distribution = valuesList
                    .GroupBy(v => (int)Math.Round(v))
                    .ToDictionary(g => g.Key, g => g.Count())
            };
        }
    }
}
