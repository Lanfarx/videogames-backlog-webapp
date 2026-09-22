using System.Text.Json;
using System.Text.Json.Serialization;
using AutoMapper;
using JetBrains.Annotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using VideoGamesBacklogBackend.Common.DTOs.Pagination;
using VideoGamesBacklogBackend.Common.Extensions;
using VideoGamesBacklogBackend.Common.Extensions.Query;
using VideoGamesBacklogBackend.DTOs.Games;
using VideoGamesBacklogBackend.DTOs.Games.Update;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.Infrastructure.Data;
using VideoGamesBacklogBackend.Interfaces.Activities;
using VideoGamesBacklogBackend.Interfaces.Games;
using VideoGamesBacklogBackend.Interfaces.Social;
using VideoGamesBacklogBackend.Common.Helpers;

namespace VideoGamesBacklogBackend.Services.Games;

[UsedImplicitly]
public class GameService(
    AppDbContext dbContext,
    IActivityService activityService,
    IFriendshipService friendshipService,
    IMapper mapper,
    IMemoryCache cache,
    ILogger<GameService> logger)
    : IGameService
{
    public async Task<List<GameDto>> GetAllGamesAsync(int userId)
    {
        var games = await dbContext.Games.AsNoTracking().AsSplitQuery().Where(g => g.UserId == userId).ToListAsync();
        return mapper.Map<List<GameDto>>(games);
    }

    public async Task<PaginatedResult<GameDto>> GetGamesPaginatedAsync(int userId, GameQueryParameters queryParams)
    {
        var query = dbContext.Games.AsNoTracking().Where(g => g.UserId == userId);

        query = query.ApplySearch(queryParams.Search);

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
                query = query.ApplyFilters(gameFilters);
            }
            catch (JsonException ex) 
            { 
                logger.LogWarning(ex, "Impossibile parsare i filtri di ricerca JSON: {Filters}", queryParams.Filters);
                throw new ArgumentException("Formato filtri JSON non valido", nameof(queryParams.Filters), ex);
            }
        }

        query = query.ApplySorting(queryParams.SortBy, queryParams.SortOrder);

        var projectedQuery = query.Select(g => new GameDto
        {
            Id = g.Id,
            Title = g.Title,
            Platform = g.Platform,
            ReleaseYear = g.ReleaseYear,
            Genres = g.Genres,
            Status = g.Status.ToString(),
            CoverImage = g.CoverImage,
            Price = g.Price,
            PurchaseDate = g.PurchaseDate,
            Developer = g.Developer,
            Publisher = g.Publisher,
            CompletionDate = g.CompletionDate,
            PlatinumDate = g.PlatinumDate,
            HoursPlayed = g.HoursPlayed,
            Metacritic = g.Metacritic,
            Rating = g.Rating,
            Notes = g.Notes,
            UserId = g.UserId
        });

        var paginatedGames = await projectedQuery.PaginateAsync(queryParams.Page, queryParams.PageSize);

        return new PaginatedResult<GameDto>
        {
            Items = paginatedGames.Items.ToList(),
            TotalItems = paginatedGames.TotalItems,
            TotalPages = paginatedGames.TotalPages,
            CurrentPage = paginatedGames.CurrentPage,
            PageSize = paginatedGames.PageSize
        };
    }

    public async Task<GameDto?> GetGameByIdAsync(int userId, int gameId)
    {
        var game = await dbContext.Games.GetByIdAndUserOrThrowAsync(gameId, userId, q => q.AsSplitQuery().Include(g => g.Comments));
        return mapper.Map<GameDto>(game);
    }

    public async Task<GameDto?> GetGameByTitleAsync(int userId, string title)
    {
        var normalizedTitle = GameTitleMatcher.GetFullyNormalizedTitle(title);
        var game = await dbContext.Games.AsNoTracking().AsSplitQuery().Include(g => g.Comments)
            .FirstOrDefaultAsync(g => g.NormalizedTitle == normalizedTitle && g.UserId == userId);
            
        return game == null ? throw new KeyNotFoundException("Gioco non trovato.") : mapper.Map<GameDto>(game);
    }

    public async Task<GamePublicInfoDto?> GetGamePublicInfoByIdAsync(int gameId, int? currentUserId = null)
    {
        var game = await dbContext.Games
            .AsNoTracking()
            .Include(g => g.User)
            .FirstOrDefaultAsync(g => g.Id == gameId);

        if (game == null) throw new KeyNotFoundException("Gioco non trovato.");

        var canShowReview = false;

        if (game.User == null || !currentUserId.HasValue)
            return CreateGame(game, canShowReview);
        var isOwner = game.User.Id == currentUserId.Value;

        if (game.Review == null) return CreateGame(game, canShowReview);
        if (isOwner)
        {
            canShowReview = true;
        }
        else
        {
            canShowReview = await CanViewReview(game.Review, game.User, currentUserId.Value);
        }

        return CreateGame(game, canShowReview);
    }

    private static GamePublicInfoDto CreateGame(Game game, bool canShowReview)
    {
        return new GamePublicInfoDto
        {
            Id = game.Id,
            Title = game.Title,
            Platform = game.Platform,
            ReleaseYear = game.ReleaseYear,
            CoverImage = game.CoverImage,
            Developer = game.Developer,
            Publisher = game.Publisher,
            UserId = game.UserId,
            Review = canShowReview && game.Review != null
                ? new GamePublicReviewDto
                {
                    Text = game.Review.Text,
                    Gameplay = game.Review.Gameplay,
                    Graphics = game.Review.Graphics,
                    Story = game.Review.Story,
                    Sound = game.Review.Sound,
                    Date = game.Review.Date,
                    IsPublic = game.Review.IsPublic
                }
                : null
        };
    }

    public async Task<GameDto> AddGameAsync(int userId, CreateGameDto gameDto)
    {
        var game = mapper.Map<Game>(gameDto);
        game.UserId = userId;
        game.NormalizedTitle = GameTitleMatcher.GetFullyNormalizedTitle(game.Title);

        var existingGame = await dbContext.Games
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.UserId == userId && g.NormalizedTitle == game.NormalizedTitle);

        if (existingGame != null)
        {
            throw new InvalidOperationException("Hai già questo gioco nel tuo backlog.");
        }

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

        SetInitialGameStatusAndDates(game);

        dbContext.Games.Add(game);

        var wishlistItem = await dbContext.Wishlists
            .FirstOrDefaultAsync(w => w.UserId == userId && w.NormalizedTitle == game.NormalizedTitle);
        if (wishlistItem != null)
        {
            dbContext.Wishlists.Remove(wishlistItem);
        }

        await dbContext.SaveChangesAsync();

        await activityService.CreateAddGameActivityAsync(game, userId);

        InvalidateUserStatsCache(userId);
        return mapper.Map<GameDto>(game);
    }

    public async Task<GameDto?> UpdateGameAsync(int userId, int gameId, UpdateGameDto updateDto)
    {
        var game = await dbContext.Games.GetByIdAndUserOrThrowAsync(gameId, userId);

        var previousRating = game.Rating;

        mapper.Map(updateDto, game);
        game.NormalizedTitle = GameTitleMatcher.GetFullyNormalizedTitle(game.Title);

        if (game.CompletionDate == DateOnly.MinValue) game.CompletionDate = null;
        if (game.PlatinumDate == DateOnly.MinValue) game.PlatinumDate = null;

        if (updateDto.Price.HasValue)
        {
            game.Price = updateDto.Price.Value == -2 ? null : updateDto.Price.Value;
        }

        if (updateDto.Metacritic.HasValue)
        {
            game.Metacritic = updateDto.Metacritic.Value <= 0 ? null : updateDto.Metacritic.Value;
        }

        if (updateDto.PurchaseDate != null)
        {
            game.PurchaseDate = updateDto.PurchaseDate.Value == DateOnly.MinValue ? null : updateDto.PurchaseDate;
        }

        if (updateDto.ReleaseYear.HasValue)
        {
            game.ReleaseYear = updateDto.ReleaseYear.Value;
        }

        if (updateDto.Rating.HasValue && updateDto.Rating.Value != previousRating)
        {
            game.Rating = updateDto.Rating.Value;
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
        InvalidateUserStatsCache(userId);
        return mapper.Map<GameDto>(game);
    }

    public async Task<GameDto?> UpdateGameStatusAsync(int userId, int gameId, string status)
    {
        var game = await dbContext.Games.GetByIdAndUserOrThrowAsync(gameId, userId);

        await StatusChangeFunctionAsync(status, game, userId);
        await dbContext.SaveChangesAsync();
        InvalidateUserStatsCache(userId);
        return mapper.Map<GameDto>(game);
    }

    private async Task StatusChangeFunctionAsync(string status, Game game, int userId)
    {
        var previousStatus = game.Status.ToString();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

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
                    game.CompletionDate ??= today;
                    break;
                case GameStatus.NotStarted:
                case GameStatus.InProgress:
                case GameStatus.Abandoned:
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
        var game = await dbContext.Games.GetByIdAndUserOrThrowAsync(gameId, userId);

        await PlaytimeChangeFunctionAsync(hoursPlayed, game, userId);

        await dbContext.SaveChangesAsync();
        InvalidateUserStatsCache(userId);
        return mapper.Map<GameDto>(game);
    }

    private async Task PlaytimeChangeFunctionAsync(int hoursPlayed, Game game, int userId)
    {
        var (updatedGame, _, previousHours, wasNotStarted) = ApplyPlaytimeChange(game, hoursPlayed);

        await activityService.CreatePlaytimeActivityAsync(game, hoursPlayed, previousHours, wasNotStarted, userId);
    }

    public async Task<bool> DeleteGameAsync(int userId, int gameId)
    {
        var game = await dbContext.Games.GetByIdAndUserOrThrowAsync(gameId, userId);
            
        dbContext.Games.Remove(game);
        await dbContext.SaveChangesAsync();
        InvalidateUserStatsCache(userId);
        return true;
    }



    public async Task<PaginatedResult<InProgressGameDto>> GetInProgressGamesPaginatedAsync(int userId, PaginationQueryParameters queryParams)
    {
        var query = dbContext.Games
            .AsNoTracking()
            .Where(g => g.UserId == userId && g.Status == GameStatus.InProgress)
            .OrderByDescending(g => g.Id);

        var projectedQuery = query.Select(g => new InProgressGameDto
        {
            Id = g.Id,
            Title = g.Title,
            CoverImage = g.CoverImage,
            Platform = g.Platform,
            HoursPlayed = g.HoursPlayed,
            Rating = g.Rating,
            Genres = g.Genres
        });

        var paginatedGames = await projectedQuery.PaginateAsync(queryParams);

        var items = paginatedGames.Items.ToList();

        return new PaginatedResult<InProgressGameDto>
        {
            Items = items,
            TotalItems = paginatedGames.TotalItems,
            TotalPages = paginatedGames.TotalPages,
            CurrentPage = paginatedGames.CurrentPage,
            PageSize = paginatedGames.PageSize
        };
    }



    public async Task<int> DeleteAllGamesAsync(int userId)
    {
        var count = await dbContext.Games.Where(g => g.UserId == userId).ExecuteDeleteAsync();

        if (count > 0)
        {
            InvalidateUserStatsCache(userId);
        }
        
        return count;
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

    public async Task<List<GameDto>> AddGamesBulkAsync(int userId, List<CreateGameDto> gamesDto)
    {
        if (gamesDto == null || gamesDto.Count == 0) return [];

        var existingGamesTitles = await dbContext.Games
            .AsNoTracking()
            .Where(g => g.UserId == userId)
            .Select(g => g.NormalizedTitle)
            .ToListAsync();

        var gamesToProcess = gamesDto
            .Where(dto => !existingGamesTitles.Contains(GameTitleMatcher.GetFullyNormalizedTitle(dto.Title)))
            .GroupBy(dto => GameTitleMatcher.GetFullyNormalizedTitle(dto.Title))
            .Select(group => group.First())
            .ToList();

        if (gamesToProcess.Count == 0) return [];

        var games = mapper.Map<List<Game>>(gamesToProcess);
        var normalizedTitles = new List<string>();

        foreach (var game in games)
        {
            game.UserId = userId;
            game.NormalizedTitle = GameTitleMatcher.GetFullyNormalizedTitle(game.Title);
            normalizedTitles.Add(game.NormalizedTitle);

            SetInitialGameStatusAndDates(game);
        }

        dbContext.Games.AddRange(games);
        await dbContext.SaveChangesAsync();

        await dbContext.Wishlists
            .Where(w => w.UserId == userId && normalizedTitles.Contains(w.NormalizedTitle))
            .ExecuteDeleteAsync();

        await activityService.CreateAddGamesBulkActivityAsync(games, userId);

        InvalidateUserStatsCache(userId);
        return mapper.Map<List<GameDto>>(games);
    }

    public async Task UpdateGamesPlaytimeBulkAsync(int userId, List<(int GameId, int HoursPlayed)> updates)
    {
        var gameIds = updates.Select(u => u.GameId).ToList();
        var games = await dbContext.Games.Where(g => g.UserId == userId && gameIds.Contains(g.Id)).ToListAsync();

        var activityUpdates = new List<(Game Game, int NewHours, int PreviousHours, bool WasNotStarted)>();

        foreach (var update in updates)
        {
            var game = games.FirstOrDefault(g => g.Id == update.GameId);
            if (game == null) continue;

            var result = ApplyPlaytimeChange(game, update.HoursPlayed);
            activityUpdates.Add(result);
        }

        await dbContext.SaveChangesAsync();

        await activityService.CreatePlaytimeBulkActivityAsync(activityUpdates, userId);
        InvalidateUserStatsCache(userId);
    }
    private void SetInitialGameStatusAndDates(Game game)
    {
        if (game.HoursPlayed > 0 && game.Status == GameStatus.NotStarted)
        {
            game.Status = GameStatus.InProgress;
        }

        if (game.CompletionDate == DateOnly.MinValue) game.CompletionDate = null;
        if (game.PlatinumDate == DateOnly.MinValue) game.PlatinumDate = null;
    }

    private (Game Game, int NewHours, int PreviousHours, bool WasNotStarted) ApplyPlaytimeChange(Game game, int hoursPlayed)
    {
        var previousHours = game.HoursPlayed;
        var wasNotStarted = game.Status == GameStatus.NotStarted;

        game.HoursPlayed = hoursPlayed;

        if (wasNotStarted && hoursPlayed > 0)
        {
            game.Status = GameStatus.InProgress;
        }

        return (game, hoursPlayed, previousHours, wasNotStarted);
    }

    private void InvalidateUserStatsCache(int userId)
    {
        cache.Remove($"UserStats_{userId}");
    }
}