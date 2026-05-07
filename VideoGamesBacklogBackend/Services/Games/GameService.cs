using System.Text.Json;
using System.Text.Json.Serialization;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Common.DTOs.Pagination;
using VideoGamesBacklogBackend.Common.Extensions;
using VideoGamesBacklogBackend.DTOs.Games;
using VideoGamesBacklogBackend.DTOs.Games.Update;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.Infrastructure.Data;
using VideoGamesBacklogBackend.Interfaces.Activities;
using VideoGamesBacklogBackend.Interfaces.Games;
using VideoGamesBacklogBackend.Interfaces.Social;

namespace VideoGamesBacklogBackend.Services.Games
{
    public class GameService(
        AppDbContext dbContext,
        IActivityService activityService,
        IFriendshipService friendshipService,
        IMapper mapper)
        : IGameService
    {
        public async Task<List<GameDto>> GetAllGamesAsync(int userId)
        {
            var games = await dbContext.Games.Where(g => g.UserId == userId).Include(g => g.Comments).ToListAsync();
            return mapper.Map<List<GameDto>>(games);
        }

        public async Task<PaginatedResult<object>> GetGamesPaginatedAsync(int userId, GameQueryParameters queryParams)
        {
            var query = dbContext.Games.Where(g => g.UserId == userId);

            // Applica ricerca
            if (!string.IsNullOrEmpty(queryParams.Search))
            {
                var searchLower = queryParams.Search.ToLower();
                query = query.Where(g =>
                    g.Title.ToLower().Contains(searchLower) ||
                    (g.Developer != null && g.Developer.ToLower().Contains(searchLower)) ||
                    (g.Publisher != null && g.Publisher.ToLower().Contains(searchLower)) ||
                    g.Genres.Any(genre => genre.ToLower().Contains(searchLower))
                );
            }

            // Applica filtri
            if (!string.IsNullOrEmpty(queryParams.Filters))
            {
                try
                {
                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                        Converters = { new JsonStringEnumConverter() }
                    };
                    var gameFilters = JsonSerializer.Deserialize<GameFiltersDto>(queryParams.Filters, options);
                    if (gameFilters != null)
                    {
                        if (gameFilters.Status?.Count > 0)
                            query = query.Where(g => gameFilters.Status.Contains(g.Status));

                        if (gameFilters.Platform?.Count > 0)
                            query = query.Where(g => g.Platform != null && gameFilters.Platform.Contains(g.Platform));

                        if (gameFilters.Genre?.Count > 0)
                            query = query.Where(g => g.Genres.Any(genre => gameFilters.Genre.Contains(genre)));

                        if (gameFilters.PriceRange?.Length == 2)
                        {
                            var minPrice = gameFilters.PriceRange[0];
                            var maxPrice = gameFilters.PriceRange[1];
                            query = query.Where(g => g.Price >= minPrice && g.Price <= maxPrice);
                        }

                        if (gameFilters.HoursRange?.Length == 2)
                        {
                            var minHours = gameFilters.HoursRange[0];
                            var maxHours = gameFilters.HoursRange[1];
                            query = query.Where(g => g.HoursPlayed >= minHours && g.HoursPlayed <= maxHours);
                        }

                        if (gameFilters.MetacriticRange?.Length == 2)
                        {
                            var minMetacritic = gameFilters.MetacriticRange[0];
                            var maxMetacritic = gameFilters.MetacriticRange[1];
                            query = query.Where(g => g.Metacritic >= minMetacritic && g.Metacritic <= maxMetacritic);
                        }

                        if (!string.IsNullOrEmpty(gameFilters.PurchaseDate))
                        {
                            query = query.Where(g => g.PurchaseDate == gameFilters.PurchaseDate);
                        }
                    }
                }
                catch (JsonException)
                {
                    // Se il parsing JSON fallisce, ignora i filtri
                }
            }

            // Applica ordinamento
            if (!string.IsNullOrEmpty(queryParams.SortBy))
            {
                var isAscending = queryParams.SortDirection?.ToLower() != "desc";

                query = queryParams.SortBy.ToLower() switch
                {
                    "title" => isAscending ? query.OrderBy(g => g.Title) : query.OrderByDescending(g => g.Title),
                    "releasedate" => isAscending
                        ? query.OrderBy(g => g.ReleaseYear)
                        : query.OrderByDescending(g => g.ReleaseYear),
                    "hoursplayed" => isAscending
                        ? query.OrderBy(g => g.HoursPlayed)
                        : query.OrderByDescending(g => g.HoursPlayed),
                    "rating" => isAscending ? query.OrderBy(g => g.Rating) : query.OrderByDescending(g => g.Rating),
                    "metacritic" => isAscending
                        ? query.OrderBy(g => g.Metacritic)
                        : query.OrderByDescending(g => g.Metacritic),
                    "price" => isAscending ? query.OrderBy(g => g.Price) : query.OrderByDescending(g => g.Price),
                    "purchasedate" => isAscending
                        ? query.OrderBy(g => g.PurchaseDate)
                        : query.OrderByDescending(g => g.PurchaseDate),
                    _ => query.OrderBy(g => g.Title)
                };
            }
            else
            {
                query = query.OrderBy(g => g.Title);
            }

            query = query.Include(g => g.Comments);
            return await query.PaginateAsync<object>(queryParams.Page, queryParams.PageSize);
        }

        public async Task<GameDto?> GetGameByIdAsync(int userId, int gameId)
        {
            var game = await dbContext.Games.Include(g => g.Comments)
                .FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
            
            if (game == null) throw new KeyNotFoundException("Gioco non trovato.");
            return mapper.Map<GameDto>(game);
        }

        public async Task<GameDto?> GetGameByTitleAsync(int userId, string title)
        {
            var game = await dbContext.Games.Include(g => g.Comments)
                .FirstOrDefaultAsync(g => g.Title == title && g.UserId == userId);
            
            if (game == null) throw new KeyNotFoundException("Gioco non trovato.");
            return mapper.Map<GameDto>(game);
        }

        public async Task<object?> GetGamePublicInfoByIdAsync(int gameId, int? currentUserId = null)
        {
            var game = await dbContext.Games
                .Include(g => g.User)
                .FirstOrDefaultAsync(g => g.Id == gameId);

            if (game == null) throw new KeyNotFoundException("Gioco non trovato.");

            var canShowReview = false;

            if (game.User != null && currentUserId.HasValue)
            {
                var isOwner = game.User.Id == currentUserId.Value;

                if (game.Review != null)
                {
                    if (isOwner)
                    {
                        canShowReview = true;
                    }
                    else
                    {
                        canShowReview = await CanViewReview(game.Review, game.User, currentUserId.Value);
                    }
                }
            }

            return new
            {
                id = game.Id,
                title = game.Title,
                platform = game.Platform,
                releaseYear = game.ReleaseYear,
                coverImage = game.CoverImage,
                developer = game.Developer,
                publisher = game.Publisher,
                userId = game.UserId,
                review = canShowReview
                    ? new
                    {
                        text = game.Review?.Text,
                        gameplay = game.Review?.Gameplay,
                        graphics = game.Review?.Graphics,
                        story = game.Review?.Story,
                        sound = game.Review?.Sound,
                        date = game.Review?.Date,
                        isPublic = game.Review?.IsPublic
                    }
                    : null
            };
        }

        public async Task<GameDto> AddGameAsync(int userId, CreateGameDto gameDto)
        {
            var game = mapper.Map<Game>(gameDto);
            game.UserId = userId;

            if (gameDto.Review != null)
            {
                game.Review = new GameReview
                {
                    Text = gameDto.Review.Text,
                    Gameplay = gameDto.Review.Gameplay,
                    Graphics = gameDto.Review.Graphics,
                    Story = gameDto.Review.Story,
                    Sound = gameDto.Review.Sound,
                    Date = gameDto.Review.Date,
                    IsPublic = gameDto.Review.IsPublic
                };
            }

            dbContext.Games.Add(game);
            await dbContext.SaveChangesAsync();

            await activityService.CreateAddGameActivityAsync(game, userId);

            return mapper.Map<GameDto>(game);
        }

        public async Task<GameDto?> UpdateGameAsync(int userId, int gameId, UpdateGameDto updateDto)
        {
            var game = await dbContext.Games.FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
            if (game == null) throw new KeyNotFoundException("Gioco non trovato.");

            var previousRating = game.Rating;

            mapper.Map(updateDto, game);

            if (updateDto.PurchaseDate != null)
            {
                game.PurchaseDate = string.IsNullOrEmpty(updateDto.PurchaseDate) ? null : updateDto.PurchaseDate;
            }

            if (updateDto.Rating.HasValue && updateDto.Rating.Value != previousRating)
            {
                await activityService.CreateRatingActivityAsync(game, updateDto.Rating.Value, previousRating, userId);
            }

            if (updateDto.Review != null)
            {
                game.Review ??= new GameReview();

                if (updateDto.Review.Text != null) game.Review.Text = updateDto.Review.Text;
                if (updateDto.Review.Gameplay.HasValue) game.Review.Gameplay = updateDto.Review.Gameplay.Value;
                if (updateDto.Review.Graphics.HasValue) game.Review.Graphics = updateDto.Review.Graphics.Value;
                if (updateDto.Review.Story.HasValue) game.Review.Story = updateDto.Review.Story.Value;
                if (updateDto.Review.Sound.HasValue) game.Review.Sound = updateDto.Review.Sound.Value;
                if (updateDto.Review.Date != null) game.Review.Date = updateDto.Review.Date;
                if (updateDto.Review.IsPublic.HasValue) game.Review.IsPublic = updateDto.Review.IsPublic.Value;
            }

            if (!string.IsNullOrEmpty(updateDto.Status))
                await StatusChangeFunctionAsync(updateDto.Status, game, userId);

            if (updateDto.HoursPlayed.HasValue)
                await PlaytimeChangeFunctionAsync(updateDto.HoursPlayed.Value, game, userId);

            await dbContext.SaveChangesAsync();
            return mapper.Map<GameDto>(game);
        }

        public async Task<GameDto?> UpdateGameStatusAsync(int userId, int gameId, string status)
        {
            var game = await dbContext.Games.FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
            if (game == null) throw new KeyNotFoundException("Gioco non trovato.");

            await StatusChangeFunctionAsync(status, game, userId);
            await dbContext.SaveChangesAsync();
            return mapper.Map<GameDto>(game);
        }

        private async Task StatusChangeFunctionAsync(string status, Game game, int userId)
        {
            var previousStatus = game.Status.ToString();
            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");

            if (Enum.TryParse<GameStatus>(status, out var newStatus))
            {
                game.Status = newStatus;

                switch (newStatus)
                {
                    case GameStatus.Completed:
                        game.CompletionDate = today;
                        game.PlatinumDate = null;
                        break;
                    case GameStatus.Platinum:
                        game.PlatinumDate = today;
                        if (string.IsNullOrEmpty(game.CompletionDate))
                            game.CompletionDate = today;
                        break;
                    case GameStatus.NotStarted:
                    case GameStatus.InProgress:
                    case GameStatus.Abandoned:
                        break;
                    default:
                        if (previousStatus is "Completed" or "Platinum")
                        {
                            game.CompletionDate = null;
                            game.PlatinumDate = null;
                        }
                        break;
                }

                await activityService.CreateStatusChangeActivityAsync(game, newStatus, previousStatus, userId);
            }
        }

        public async Task<GameDto?> UpdateGamePlaytimeAsync(int userId, int gameId, int hoursPlayed)
        {
            var game = await dbContext.Games.FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
            if (game == null) throw new KeyNotFoundException("Gioco non trovato.");

            await PlaytimeChangeFunctionAsync(hoursPlayed, game, userId);

            await dbContext.SaveChangesAsync();
            return mapper.Map<GameDto>(game);
        }

        private async Task PlaytimeChangeFunctionAsync(int hoursPlayed, Game game, int userId)
        {
            var previousHours = game.HoursPlayed;
            var wasNotStarted = game.Status == GameStatus.NotStarted;

            game.HoursPlayed = hoursPlayed;

            if (wasNotStarted && hoursPlayed > 0)
            {
                game.Status = GameStatus.InProgress;
            }

            await activityService.CreatePlaytimeActivityAsync(game, hoursPlayed, previousHours, wasNotStarted, userId);
        }

        public async Task<bool> DeleteGameAsync(int userId, int gameId)
        {
            var game = await dbContext.Games.FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
            if (game == null) throw new KeyNotFoundException("Gioco non trovato.");
            
            dbContext.Games.Remove(game);
            await dbContext.SaveChangesAsync();
            return true;
        }



        public async Task<PaginatedResult<object>> GetInProgressGamesPaginatedAsync(int userId, PaginationQueryParameters queryParams)
        {
            var query = dbContext.Games
                .Where(g => g.UserId == userId && g.Status == GameStatus.InProgress)
                .OrderByDescending(g => g.Id);

            var projectedQuery = query.Select(g => new
                {
                    g.Id,
                    g.Title,
                    g.CoverImage,
                    g.Platform,
                    g.HoursPlayed,
                    g.Rating,
                    g.Genres
                });

            return await projectedQuery.PaginateAsync<object>(queryParams);
        }



        public async Task<int> DeleteAllGamesAsync(int userId)
        {
            var games = await dbContext.Games.Where(g => g.UserId == userId).ToListAsync();

            if (games.Count == 0) return 0;

            dbContext.Games.RemoveRange(games);
            await dbContext.SaveChangesAsync();

            return games.Count;
        }

        private async Task<bool> CanViewReview(GameReview? review, User targetUser, int currentUserId)
        {
            if (review == null) return false;
            if (targetUser.Id == currentUserId) return true;

            var isReviewPublic = review.IsPublic ?? false;
            if (!isReviewPublic) return false;

            var areFriends = await friendshipService.AreUsersFriendsAsync(currentUserId, targetUser.Id);

            if (targetUser.PrivacySettings.IsPrivate || !targetUser.PrivacySettings.ShowDiary)
            {
                return areFriends;
            }

            return true;
        }
    }
}