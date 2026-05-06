using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Data;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Helpers;
using AutoMapper;
using VideoGamesBacklogBackend.Entities;

namespace VideoGamesBacklogBackend.Services
{
    public class CommunityService(
        AppDbContext context,
        ILogger<CommunityService> logger,
        INotificationService notificationService,
        IMapper mapper)
        : ICommunityService
    {
        public async Task<CommunityStatsDto> GetCommunityStatsAsync(string gameTitle)
        {
            var allGames = await context.Games
                .Select(g => new
                {
                    g.Id,
                    g.Title,
                    g.HoursPlayed,
                    g.Status,
                    g.Rating,
                    HasPublicReview = g.Review != null && g.Review.IsPublic == true
                })
                .ToListAsync();

            var games = allGames.Where(g => GameTitleMatcher.DoesGameTitleMatch(g.Title, gameTitle)).ToList();
            if (games.Count == 0)
            {
                return new CommunityStatsDto();
            }

            var totalPlayers = games.Count;
            var gamesWithPublicReviews = games.Where(g => g.HasPublicReview).ToList();
            var totalReviews = gamesWithPublicReviews.Count;
            var gamesWithRating = games.Where(g => g.Rating > 0).ToList();
            var averageRating = gamesWithRating.Count > 0
                ? gamesWithRating.Average(g => g.Rating)
                : 0;

            var averagePlaytime = games.Count > 0
                ? (int)Math.Round(games.Average(g => g.HoursPlayed))
                : 0;

            var completedGames = games.Count(g => g.Status is GameStatus.Completed or GameStatus.Platinum);
            var completionRate = totalPlayers > 0
                ? Math.Round((decimal)completedGames / totalPlayers * 100, 2)
                : 0;

            var currentlyPlaying = games.Count(g => g.Status == GameStatus.InProgress);

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

        public async Task<decimal> GetCommunityRatingAsync(string gameTitle)
        {
            var games = await context.Games
                .Where(g => g.Rating > 0)
                .ToListAsync();

            games = games.Where(g => GameTitleMatcher.DoesGameTitleMatch(g.Title, gameTitle)).ToList();

            return games.Count > 0 ? Math.Round(games.Average(g => g.Rating), 2) : 0;
        }

        public async Task<CommunityRatingDto> GetCommunityRatingWithCountAsync(string gameTitle)
        {
            var games = await context.Games
                .Where(g => g.Rating > 0)
                .ToListAsync();

            games = games.Where(g => GameTitleMatcher.DoesGameTitleMatch(g.Title, gameTitle)).ToList();

            var reviewCount = games.Count;
            var rating = reviewCount > 0 ? Math.Round(games.Average(g => g.Rating), 2) : 0;

            return new CommunityRatingDto
            {
                Rating = rating,
                ReviewCount = reviewCount
            };
        }

        public async Task<Dictionary<string, decimal>> GetCommunityRatingsAsync(List<string> gameTitles)
        {
            var ratings = new Dictionary<string, decimal>();

            foreach (var title in gameTitles)
            {
                var rating = await GetCommunityRatingAsync(title);
                ratings[title] = rating;
            }

            return ratings;
        }

        public async Task<Dictionary<string, CommunityRatingDto>> GetCommunityRatingsWithCountAsync(
            List<string> gameTitles)
        {
            var ratingsWithCount = new Dictionary<string, CommunityRatingDto>();

            foreach (var title in gameTitles)
            {
                var ratingData = await GetCommunityRatingWithCountAsync(title);
                ratingsWithCount[title] = ratingData;
            }

            return ratingsWithCount;
        }

        public async Task<PaginatedReviewsDto> GetReviewsAsync(string gameTitle, int page, int pageSize,
            int? currentUserId = null)
        {
            var allGames = await context.Games
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
            var reviews = paginatedGames.Select(mapper.Map<CommunityReviewDto>).ToList();

            return new PaginatedReviewsDto
            {
                Reviews = reviews,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        public async Task<PaginatedReviewsDto> GetPublicReviewsAsync(string gameTitle, int page, int pageSize)
        {
            var allGames = await context.Games
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
            var reviews = paginatedGames.Select(mapper.Map<CommunityReviewDto>).ToList();

            return new PaginatedReviewsDto
            {
                Reviews = reviews,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        public async Task<ReviewStatsDto> GetReviewStatsAsync(string gameTitle)
        {
            var allGames = await context.Games
                .Where(g => g.Review != null && g.Review.IsPublic == true)
                .ToListAsync();

            var games = allGames.Where(g => GameTitleMatcher.DoesGameTitleMatch(g.Title, gameTitle)).ToList();

            if (!(games.Count > 0))
            {
                return new ReviewStatsDto { GameTitle = gameTitle };
            }

            var reviews = games.Select(g => g.Review!).ToList();
            var totalReviews = reviews.Count;

            return new ReviewStatsDto
            {
                GameTitle = gameTitle,
                TotalReviews = totalReviews,
                AverageGameplay = Math.Round(reviews.Average(r => r.Gameplay), 2),
                AverageGraphics = Math.Round(reviews.Average(r => r.Graphics), 2),
                AverageStory = Math.Round(reviews.Average(r => r.Story), 2),
                AverageSound = Math.Round(reviews.Average(r => r.Sound), 2),
                OverallAverageRating = Math.Round(games.Average(g => g.Rating), 2),
                RatingDistribution = games
                    .GroupBy(g => (int)Math.Round(g.Rating, MidpointRounding.AwayFromZero))
                    .ToDictionary(g => g.Key, g => g.Count()),
                GameplayStats = CalculateAspectStats(reviews.Select(r => r.Gameplay)),
                GraphicsStats = CalculateAspectStats(reviews.Select(r => r.Graphics)),
                StoryStats = CalculateAspectStats(reviews.Select(r => r.Story)),
                SoundStats = CalculateAspectStats(reviews.Select(r => r.Sound))
            };
        }

        public async Task<List<CommunityReviewDto>> GetTopReviewsAsync(string gameTitle, int limit,
            int? currentUserId = null)
        {
            var allGames = await context.Games
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
            return games.Select(mapper.Map<CommunityReviewDto>).ToList();
        }

        /// <summary>
        /// Ottiene i commenti per una specifica recensione
        /// </summary>
        public async Task<List<ReviewCommentDto>> GetReviewCommentsAsync(int reviewGameId)
        {
            var comments = await context.ReviewComments
                .Include(rc => rc.Author)
                .Where(rc => rc.ReviewGameId == reviewGameId)
                .OrderBy(rc => rc.Date)
                .ToListAsync();

            return mapper.Map<List<ReviewCommentDto>>(comments);
        }

        /// <summary>
        /// Aggiunge un commento a una recensione
        /// </summary>
        public async Task<ReviewCommentDto?> AddReviewCommentAsync(CreateReviewCommentDto createCommentDto,
            int authorId)
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

        /// <summary>
        /// Elimina un commento a una recensione
        /// </summary>
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

        /// <summary>
        /// Ottiene tutti i commenti per un'attività
        /// </summary>
        public async Task<List<ActivityCommentDto>> GetActivityCommentsAsync(int activityId)
        {
            var comments = await context.ActivityComments
                .Include(ac => ac.Author)
                .Where(ac => ac.ActivityId == activityId)
                .OrderBy(ac => ac.Date)
                .ToListAsync();

            return mapper.Map<List<ActivityCommentDto>>(comments);
        }

        /// <summary>
        /// Aggiunge un commento a un'attività
        /// </summary>
        public async Task<ActivityCommentDto?> AddActivityCommentAsync(CreateActivityCommentDto createCommentDto,
            int authorId)
        {
            var activity = await context.Activities
                .Include(a => a.Game)
                .FirstOrDefaultAsync(a => a.Id == createCommentDto.ActivityId);

            if (activity == null)
                throw new KeyNotFoundException("Attività non trovata.");

            var newComment = new ActivityComment
            {
                Text = createCommentDto.Text,
                Date = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                ActivityId = createCommentDto.ActivityId,
                AuthorId = authorId
            };

            context.ActivityComments.Add(newComment);
            await context.SaveChangesAsync();

            var savedComment = await context.ActivityComments
                .Include(ac => ac.Author)
                .FirstOrDefaultAsync(ac => ac.Id == newComment.Id);

            if (savedComment == null) return null;

            // Crea notifica per il proprietario dell'attività (solo per attività di tipo "Rated")
            if (activity is { Game: not null, Type: ActivityType.Rated } &&
                activity.Game.UserId != authorId)
            {
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
            }

            return mapper.Map<ActivityCommentDto>(savedComment);
        }

        /// <summary>
        /// Elimina un commento a un'attività
        /// </summary>
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

        private static AspectStatsDto CalculateAspectStats(IEnumerable<decimal> values)
        {
            var enumerable = values as decimal[] ?? values.ToArray();
            if (!(enumerable.Length > 0))
            {
                return new AspectStatsDto();
            }

            var valuesList = enumerable.ToList();

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