using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Data;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Models;
using VideoGamesBacklogBackend.Dto;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace VideoGamesBacklogBackend.Services
{
    public class GameService : IGameService
    {
        private readonly AppDbContext _dbContext;
        private readonly IActivityService _activityService;
        
        public GameService(AppDbContext dbContext, IActivityService activityService)
        {
            _dbContext = dbContext;
            _activityService = activityService;
        }        public async Task<List<Game>> GetAllGamesAsync(ClaimsPrincipal userClaims)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            return await _dbContext.Games.Where(g => g.UserId == userId).Include(g => g.Comments).ToListAsync();
        }

        public async Task<PaginatedGamesDto> GetGamesPaginatedAsync(ClaimsPrincipal userClaims, int page = 1, int pageSize = 12, string? filters = null, string? sortBy = null, string? sortOrder = null, string? search = null)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            
            var query = _dbContext.Games.Where(g => g.UserId == userId);

            // Applica ricerca
            if (!string.IsNullOrEmpty(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(g => 
                    g.Title.ToLower().Contains(searchLower) ||
                    (g.Developer != null && g.Developer.ToLower().Contains(searchLower)) ||
                    (g.Publisher != null && g.Publisher.ToLower().Contains(searchLower)) ||
                    g.Genres.Any(genre => genre.ToLower().Contains(searchLower))
                );            }            // Applica filtri
            if (!string.IsNullOrEmpty(filters))
            {
                try
                {
                    // Opzioni di deserializzazione per gestire correttamente gli enum
                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                        Converters = { new JsonStringEnumConverter() }
                    };                    var gameFilters = JsonSerializer.Deserialize<GameFiltersDto>(filters, options);
                    if (gameFilters != null)
                    {
                        // Filtro per status
                        if (gameFilters.Status?.Any() == true)
                        {
                            query = query.Where(g => gameFilters.Status.Contains(g.Status));
                        }

                        // Filtro per piattaforma
                        if (gameFilters.Platform?.Any() == true)
                        {
                            query = query.Where(g => gameFilters.Platform.Contains(g.Platform));
                        }

                        // Filtro per genere
                        if (gameFilters.Genre?.Any() == true)
                        {
                            query = query.Where(g => g.Genres.Any(genre => gameFilters.Genre.Contains(genre)));
                        }

                        // Filtro per range prezzo
                        if (gameFilters.PriceRange?.Length == 2)
                        {
                            var minPrice = gameFilters.PriceRange[0];
                            var maxPrice = gameFilters.PriceRange[1];
                            query = query.Where(g => g.Price >= minPrice && g.Price <= maxPrice);
                        }

                        // Filtro per range ore di gioco
                        if (gameFilters.HoursRange?.Length == 2)
                        {
                            var minHours = gameFilters.HoursRange[0];
                            var maxHours = gameFilters.HoursRange[1];
                            query = query.Where(g => g.HoursPlayed >= minHours && g.HoursPlayed <= maxHours);
                        }

                        // Filtro per range Metacritic
                        if (gameFilters.MetacriticRange?.Length == 2)
                        {
                            var minMetacritic = gameFilters.MetacriticRange[0];
                            var maxMetacritic = gameFilters.MetacriticRange[1];
                            query = query.Where(g => g.Metacritic >= minMetacritic && g.Metacritic <= maxMetacritic);
                        }                        // Filtro per data di acquisto
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
            if (!string.IsNullOrEmpty(sortBy))
            {
                var isAscending = sortOrder?.ToLower() != "desc";
                
                query = sortBy.ToLower() switch
                {
                    "title" => isAscending ? query.OrderBy(g => g.Title) : query.OrderByDescending(g => g.Title),
                    "releasedate" => isAscending ? query.OrderBy(g => g.ReleaseYear) : query.OrderByDescending(g => g.ReleaseYear),
                    "hoursplayed" => isAscending ? query.OrderBy(g => g.HoursPlayed) : query.OrderByDescending(g => g.HoursPlayed),
                    "rating" => isAscending ? query.OrderBy(g => g.Rating) : query.OrderByDescending(g => g.Rating),
                    "metacritic" => isAscending ? query.OrderBy(g => g.Metacritic) : query.OrderByDescending(g => g.Metacritic),
                    "price" => isAscending ? query.OrderBy(g => g.Price) : query.OrderByDescending(g => g.Price),
                    "purchasedate" => isAscending ? query.OrderBy(g => g.PurchaseDate) : query.OrderByDescending(g => g.PurchaseDate),
                    _ => query.OrderBy(g => g.Title)
                };
            }
            else
            {
                query = query.OrderBy(g => g.Title);
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);
            
            var games = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(g => g.Comments)
                .ToListAsync();

            return new PaginatedGamesDto
            {
                Games = games.Cast<object>().ToList(),
                CurrentPage = page,
                TotalPages = totalPages,
                TotalItems = totalItems,
                PageSize = pageSize,
                HasNextPage = page < totalPages,
                HasPreviousPage = page > 1
            };
        }

        public async Task<Game?> GetGameByIdAsync(ClaimsPrincipal userClaims, int gameId)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            return await _dbContext.Games.Include(g => g.Comments).FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
        }

        public async Task<Game?> GetGameByTitleAsync(ClaimsPrincipal userClaims, string title)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            return await _dbContext.Games.Include(g => g.Comments).FirstOrDefaultAsync(g => g.Title == title && g.UserId == userId);
        }               
        public async Task<object?> GetGamePublicInfoByIdAsync(int gameId, int? currentUserId = null)
        {
            var game = await _dbContext.Games
                .Include(g => g.User)
                .FirstOrDefaultAsync(g => g.Id == gameId);
            
            if (game == null)
            {
                return null;
            }
            
            // Verifica se la recensione può essere mostrata in base alle impostazioni di privacy
            bool canShowReview = false;
            bool isOwner = false;
            
            if (game.User != null && currentUserId.HasValue)
            {
                // Verifica se l'utente corrente è il proprietario
                isOwner = game.User.Id == currentUserId.Value;
                
                if (game.Review != null)
                {
                    // Se è il proprietario, può sempre vedere la recensione
                    if (isOwner)
                    {
                        canShowReview = true;
                    }
                    else
                    {
                        // Altrimenti applica le regole di privacy
                        canShowReview = await CanViewReview(game.Review, game.User, currentUserId.Value);
                    }
                }
            }
            
            // Restituisci le informazioni pubbliche essenziali
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
                // Includi la recensione solo se può essere visualizzata
                review = canShowReview ? new {
                    text = game.Review?.Text,
                    gameplay = game.Review?.Gameplay,
                    graphics = game.Review?.Graphics,
                    story = game.Review?.Story,
                    sound = game.Review?.Sound,
                    date = game.Review?.Date,
                    isPublic = game.Review?.IsPublic
                } : null
            };
        }

        public async Task<Game> AddGameAsync(ClaimsPrincipal userClaims, Game game)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            game.UserId = userId;
            _dbContext.Games.Add(game);
            await _dbContext.SaveChangesAsync();
            
            // Crea automaticamente l'attività "added" e eventuali attività aggiuntive usando il metodo helper ottimizzato
            await _activityService.CreateAddGameActivityAsync(game, userId);
            
            return game;
        }
        
        public async Task<Game?> UpdateGameAsync(ClaimsPrincipal userClaims, int gameId, UpdateGameDto updateDto)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var game = await _dbContext.Games.FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
            if (game == null) return null;

            // Aggiorna solo i campi specificati nel DTO (non null)
            if (!string.IsNullOrEmpty(updateDto.Title))
                game.Title = updateDto.Title;
            
            if (updateDto.Platform != null)
                game.Platform = updateDto.Platform;
            
            if (updateDto.ReleaseYear.HasValue)
                game.ReleaseYear = updateDto.ReleaseYear.Value;
            
            if (updateDto.Genres != null)
                game.Genres = updateDto.Genres;
            
            if (updateDto.CoverImage != null)
                game.CoverImage = updateDto.CoverImage;
            
            if (updateDto.Price.HasValue)
                game.Price = updateDto.Price.Value;            // Aggiorna la data di acquisto anche se è null/vuota (per "Family Share")
            if (updateDto.PurchaseDate != null)
            {
                game.PurchaseDate = string.IsNullOrEmpty(updateDto.PurchaseDate) ? null : updateDto.PurchaseDate;
            }
            
            if (updateDto.Developer != null)
                game.Developer = updateDto.Developer;
            
            if (updateDto.Publisher != null)
                game.Publisher = updateDto.Publisher;
            
            if (updateDto.CompletionDate != null)
                game.CompletionDate = updateDto.CompletionDate;
            
            if (updateDto.PlatinumDate != null)
                game.PlatinumDate = updateDto.PlatinumDate;
            
            if (updateDto.Metacritic.HasValue)
                game.Metacritic = updateDto.Metacritic.Value;
              if (updateDto.Rating.HasValue)
            {
                // Salva il rating precedente per creare l'attività
                var previousRating = game.Rating;
                game.Rating = updateDto.Rating.Value;
                
                // Crea l'attività "rated" se il rating è cambiato
                await _activityService.CreateRatingActivityAsync(game, updateDto.Rating.Value, previousRating, userId);
            }
            
            if (updateDto.Notes != null)
                game.Notes = updateDto.Notes;
            
            // Gestisci l'aggiornamento parziale della recensione
            if (updateDto.Review != null)
            {
                // Se il gioco non ha ancora una recensione, creala
                if (game.Review == null)
                {
                    game.Review = new GameReview();
                }
                
                // Aggiorna solo i campi specificati nel DTO (non null)
                if (updateDto.Review.Text != null)
                    game.Review.Text = updateDto.Review.Text;
                
                if (updateDto.Review.Gameplay.HasValue)
                    game.Review.Gameplay = updateDto.Review.Gameplay.Value;
                
                if (updateDto.Review.Graphics.HasValue)
                    game.Review.Graphics = updateDto.Review.Graphics.Value;
                
                if (updateDto.Review.Story.HasValue)
                    game.Review.Story = updateDto.Review.Story.Value;
                
                if (updateDto.Review.Sound.HasValue)
                    game.Review.Sound = updateDto.Review.Sound.Value;
                
                if (updateDto.Review.Date != null)
                    game.Review.Date = updateDto.Review.Date;
                
                if (updateDto.Review.IsPublic.HasValue)
                    game.Review.IsPublic = updateDto.Review.IsPublic.Value;
            }
            
            // Gestisci Status utilizzando la logica esistente
            if (!string.IsNullOrEmpty(updateDto.Status))
                await StatusChangeFunctionAsync(updateDto.Status, game, userId);
            
            // Gestisci HoursPlayed utilizzando la logica esistente
            if (updateDto.HoursPlayed.HasValue)
                await PlaytimeChangeFunctionAsync(updateDto.HoursPlayed.Value, game, userId);

            await _dbContext.SaveChangesAsync();
            return game;
        }

        public async Task<Game?> UpdateGameStatusAsync(ClaimsPrincipal userClaims, int gameId, string status)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var game = await _dbContext.Games.FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
            if (game == null) return null;

            // Salva lo status precedente per la creazione dell'attività
            var previousStatus = game.Status;
            
            await StatusChangeFunctionAsync(status, game, userId);
            await _dbContext.SaveChangesAsync();
            return game;
        }

        private async Task StatusChangeFunctionAsync(string status, Game game, int userId)
        {
            // Salva lo status precedente per gestire le date e attività
            var previousStatus = game.Status.ToString();
            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");

            // Converte la stringa status in enum
            if (Enum.TryParse<GameStatus>(status, out GameStatus newStatus))
            {
                game.Status = newStatus;

                // Gestisci automaticamente le date in base al nuovo stato
                if (newStatus == GameStatus.Completed)
                {
                    // Quando diventa completato: imposta CompletionDate
                    game.CompletionDate = today;
                    // Se aveva PlatinumDate, rimuovilo (non è più platino)
                    game.PlatinumDate = null;
                }
                else if (newStatus == GameStatus.Platinum)
                {
                    // Quando diventa platino: imposta PlatinumDate e mantieni/imposta CompletionDate
                    game.PlatinumDate = today;
                    // Se non ha già una data di completamento, impostala
                    if (string.IsNullOrEmpty(game.CompletionDate))
                    {
                        game.CompletionDate = today;
                    }
                }
                else
                {
                    // Per tutti gli altri stati, rimuovi entrambe le date se veniva da Completed o Platinum
                    if (previousStatus == "Completed" || previousStatus == "Platinum")
                    {
                        game.CompletionDate = null;
                        game.PlatinumDate = null;
                    }
                }

                // Crea l'attività appropriata per il cambio di stato
                await _activityService.CreateStatusChangeActivityAsync(game, newStatus, previousStatus, userId);
            }
        }

        public async Task<Game?> UpdateGamePlaytimeAsync(ClaimsPrincipal userClaims, int gameId, int hoursPlayed)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var game = await _dbContext.Games.FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
            if (game == null) return null;

            // Salva le ore precedenti per calcolare la differenza
            var previousHours = game.HoursPlayed;
            
            await PlaytimeChangeFunctionAsync(hoursPlayed, game, userId);

            await _dbContext.SaveChangesAsync();
            return game;
        }

        private async Task PlaytimeChangeFunctionAsync(int hoursPlayed, Game game, int userId)
        {
            // Salva le ore precedenti per calcolare la differenza
            var previousHours = game.HoursPlayed;
            var wasNotStarted = game.Status == GameStatus.NotStarted;
            
            // Aggiorna le ore di gioco
            game.HoursPlayed = hoursPlayed;

            // Se il gioco era "Da iniziare" e ora ha ore di gioco > 0, imposta lo stato a "In corso"
            if (wasNotStarted && hoursPlayed > 0)
            {
                game.Status = GameStatus.InProgress;
            }

            // Crea l'attività appropriata per il playtime
            await _activityService.CreatePlaytimeActivityAsync(game, hoursPlayed, previousHours, wasNotStarted, userId);
        }

        public async Task<bool> DeleteGameAsync(ClaimsPrincipal userClaims, int gameId)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var game = await _dbContext.Games.FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);
            if (game == null) return false;
            _dbContext.Games.Remove(game);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        // Statistiche
        public async Task<GameStatsDto> GetGameStatsAsync(ClaimsPrincipal userClaims)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var stats = GetUserStatsAsync(userId).Result;

            return stats;
        }

        public async Task<GameStatsDto> GetUserStatsAsync(int userId)
        {
            var games = await _dbContext.Games.Where(g => g.UserId == userId).ToListAsync();

            var stats = new GameStatsDto
            {
                Total = games.Count,
                InProgress = games.Count(g => g.Status == GameStatus.InProgress),
                Completed = games.Count(g => g.Status == GameStatus.Completed || g.Status == GameStatus.Platinum),
                NotStarted = games.Count(g => g.Status == GameStatus.NotStarted),
                Abandoned = games.Count(g => g.Status == GameStatus.Abandoned),
                Platinum = games.Count(g => g.Status == GameStatus.Platinum),
                TotalHours = games.Sum(g => g.HoursPlayed)
            };

            return stats;
        }

        public async Task<PaginatedGamesDto> GetInProgressGamesPaginatedAsync(ClaimsPrincipal userClaims, int page = 1, int pageSize = 6)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            
            var query = _dbContext.Games
                .Where(g => g.UserId == userId && g.Status == GameStatus.InProgress)
                .OrderByDescending(g => g.Id);

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);
            
            var games = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(g => new
                {
                    g.Id,
                    g.Title,
                    g.CoverImage,
                    g.Platform,
                    g.HoursPlayed,
                    g.Rating,
                    g.Genres
                })
                .ToListAsync();

            return new PaginatedGamesDto
            {
                Games = games.Cast<object>().ToList(),
                CurrentPage = page,
                TotalPages = totalPages,
                TotalItems = totalItems,
                PageSize = pageSize,
                HasNextPage = page < totalPages,
                HasPreviousPage = page > 1
            };
        }

        public async Task<List<GameComment>> GetCommentsAsync(ClaimsPrincipal userClaims, int gameId)
        {
            var userId = int.Parse(userClaims.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var game = await _dbContext.Games
                .Include(g => g.Comments)
                .FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);

            if (game == null)
                return new List<GameComment>();

            return game.Comments;
        }

        public async Task<GameComment?> AddCommentAsync(ClaimsPrincipal userClaims, int gameId, GameComment comment)
        {
            var userId = int.Parse(userClaims.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var game = await _dbContext.Games
                .FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);

            if (game == null)
                return null;

            comment.GameId = gameId;
            comment.Date = DateTime.UtcNow.ToString("yyyy-MM-dd");
            _dbContext.GameComments.Add(comment);
            await _dbContext.SaveChangesAsync();
            return comment;
        }

        public async Task<bool> DeleteCommentAsync(ClaimsPrincipal userClaims, int gameId, int commentId)
        {
            var userId = int.Parse(userClaims.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var game = await _dbContext.Games
                .FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);

            if (game == null)
                return false;

            var comment = await _dbContext.GameComments
                .FirstOrDefaultAsync(c => c.Id == commentId && c.GameId == gameId);

            if (comment == null)
                return false;

            _dbContext.GameComments.Remove(comment);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<GameComment?> UpdateCommentAsync(ClaimsPrincipal userClaims, int gameId, int commentId, GameComment updatedComment)
        {
            var userId = int.Parse(userClaims.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var game = await _dbContext.Games
                .FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == userId);

            if (game == null)
                return null;

            var comment = await _dbContext.GameComments
                .FirstOrDefaultAsync(c => c.Id == commentId && c.GameId == gameId);

            if (comment == null)
                return null;

            if (!string.IsNullOrWhiteSpace(updatedComment.Text))
                comment.Text = updatedComment.Text;

            // Aggiorna la data di modifica
            comment.Date = DateTime.UtcNow.ToString("yyyy-MM-dd");

            await _dbContext.SaveChangesAsync();
            return comment;
        }

        public async Task<int> DeleteAllGamesAsync(ClaimsPrincipal userClaims)
        {
            var userId = int.Parse(userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

            // Recupera tutti i giochi dell'utente
            var games = await _dbContext.Games.Where(g => g.UserId == userId).ToListAsync();

            if (games.Count == 0)
                return 0;

            _dbContext.Games.RemoveRange(games);
            await _dbContext.SaveChangesAsync();

            return games.Count;
        }        private async Task<bool> CanViewReview(GameReview? review, User targetUser, int currentUserId)
        {
            // Se la recensione non esiste, non può essere visualizzata
            if (review == null)
            {
                return false;
            }

            // REGOLA 1: Il proprietario può sempre vedere le proprie recensioni
            if (targetUser.Id == currentUserId)
            {
                return true;
            }

            // REGOLA 2: Le recensioni private non sono mai visibili agli altri
            var isReviewPublic = review.IsPublic ?? false;
            if (!isReviewPublic)
            {
                return false;
            }
            
            // Controlla se gli utenti sono amici
            var areFriends = await AreUsersFriendsAsync(currentUserId, targetUser.Id);
            
            // REGOLA 3: Per i profili privati, solo gli amici possono vedere i contenuti
            if (targetUser.PrivacySettings.IsPrivate)
            {
                return areFriends;
            }

            // REGOLA 4: Per profili pubblici con diari privati, solo gli amici possono vedere le recensioni
            if (!targetUser.PrivacySettings.ShowDiary)
            {
                return areFriends;
            }
            
            // REGOLA 5: Profilo pubblico + diario pubblico + recensione pubblica = visibile a tutti
            return true;
        }
        
        // Metodo di utility per verificare se due utenti sono amici
        private async Task<bool> AreUsersFriendsAsync(int userId1, int userId2)
        {
            var friendship = await _dbContext.Friendships
                .FirstOrDefaultAsync(f =>
                    ((f.SenderId == userId1 && f.ReceiverId == userId2) ||
                     (f.SenderId == userId2 && f.ReceiverId == userId1)) &&
                    f.Status == FriendshipStatus.Accepted);
                
            return friendship != null;
        }
    }
}
