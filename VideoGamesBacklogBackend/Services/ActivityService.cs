using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Data;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Models;

namespace VideoGamesBacklogBackend.Services
{    public class ActivityService : IActivityService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notificationService;

        public ActivityService(AppDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }public async Task<PaginatedActivitiesDto> GetActivitiesAsync(int userId, ActivityFiltersDto filters, int page = 1, int pageSize = 20)
        {
            var query = _context.Activities
                .Include(a => a.Game)
                .Include(a => a.Reactions)
                    .ThenInclude(r => r.User)
                .Include(a => a.ActivityComments)
                    .ThenInclude(c => c.Author)
                .Where(a => a.Game!.UserId == userId);

            // Applicazione filtri
            if (filters.Types?.Any() == true)
            {
                query = query.Where(a => filters.Types.Contains(a.Type));
            }

            if (filters.Year.HasValue)
            {
                query = query.Where(a => a.Timestamp.Year == filters.Year.Value);
            }

            if (filters.Month.HasValue)
            {
                query = query.Where(a => a.Timestamp.Month == filters.Month.Value);
            }

            if (filters.GameId.HasValue)
            {
                query = query.Where(a => a.GameId == filters.GameId.Value);
            }

            // Ordinamento
            if (filters.SortDirection?.ToLower() == "asc")
            {
                query = query.OrderBy(a => a.Timestamp);
            }
            else
            {
                query = query.OrderByDescending(a => a.Timestamp);
            }

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            var activities = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PaginatedActivitiesDto
            {
                Activities = activities.Select(activity => MapActivityToDto(activity, userId)).ToList(),
                TotalCount = totalCount,
                PageSize = pageSize,
                CurrentPage = page,
                TotalPages = totalPages
            };
        }        public async Task<ActivityDto?> GetActivityByIdAsync(int activityId, int userId)
        {
            var activity = await _context.Activities
                .Include(a => a.Game)
                .Include(a => a.Reactions)
                    .ThenInclude(r => r.User)
                .Include(a => a.ActivityComments)
                    .ThenInclude(c => c.Author)
                .FirstOrDefaultAsync(a => a.Id == activityId && a.Game!.UserId == userId);

            if (activity == null)
                return null;

            return MapActivityToDto(activity, userId);
        }

        public async Task<ActivityDto> CreateActivityAsync(int userId, CreateActivityDto createActivityDto)
        {
            // Verifica che il gioco appartenga all'utente
            var game = await _context.Games
                .FirstOrDefaultAsync(g => g.Id == createActivityDto.GameId && g.UserId == userId);

            if (game == null)
                throw new UnauthorizedAccessException("Gioco non trovato o non autorizzato");

            var activity = new Activity
            {
                Type = createActivityDto.Type,
                GameId = createActivityDto.GameId,
                GameTitle = game.Title,
                AdditionalInfo = createActivityDto.AdditionalInfo,
                Timestamp = DateTime.UtcNow
            };            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();            // Ricarica l'attività con le reazioni (anche se vuote inizialmente)
            var createdActivity = await _context.Activities
                .Include(a => a.Game)
                .Include(a => a.Reactions)
                    .ThenInclude(r => r.User)
                .Include(a => a.ActivityComments)
                    .ThenInclude(c => c.Author)
                .FirstAsync(a => a.Id == activity.Id);

            return MapActivityToDto(createdActivity, userId);
        }        public async Task<ActivityDto?> UpdateActivityAsync(int activityId, int userId, UpdateActivityDto updateActivityDto)
        {
            var activity = await _context.Activities
                .Include(a => a.Game)
                .Include(a => a.Reactions)
                    .ThenInclude(r => r.User)
                .Include(a => a.ActivityComments)
                    .ThenInclude(c => c.Author)
                .FirstOrDefaultAsync(a => a.Id == activityId && a.Game!.UserId == userId);

            if (activity == null)
                return null;

            if (updateActivityDto.Type.HasValue)
                activity.Type = updateActivityDto.Type.Value;

            if (!string.IsNullOrEmpty(updateActivityDto.AdditionalInfo))
                activity.AdditionalInfo = updateActivityDto.AdditionalInfo;

            await _context.SaveChangesAsync();

            return MapActivityToDto(activity, userId);
        }

        public async Task<bool> DeleteActivityAsync(int activityId, int userId)
        {
            var activity = await _context.Activities
                .Include(a => a.Game)
                .FirstOrDefaultAsync(a => a.Id == activityId && a.Game!.UserId == userId);

            if (activity == null)
                return false;

            _context.Activities.Remove(activity);
            await _context.SaveChangesAsync();
            return true;
        }        public async Task<List<ActivityDto>> GetRecentActivitiesAsync(int userId, int count = 10)
        {
            var activities = await _context.Activities
                .Include(a => a.Game)
                .Include(a => a.Reactions)
                    .ThenInclude(r => r.User)
                .Include(a => a.ActivityComments)
                    .ThenInclude(c => c.Author)
                .Where(a => a.Game!.UserId == userId)
                .OrderByDescending(a => a.Timestamp)
                .Take(count)
                .ToListAsync();

            return activities.Select(a => MapActivityToDto(a, userId)).ToList();
        }        public async Task<List<ActivityDto>> GetActivitiesByGameAsync(int gameId, int userId)
        {
            var activities = await _context.Activities
                .Include(a => a.Game)
                .Include(a => a.Reactions)
                    .ThenInclude(r => r.User)
                .Include(a => a.ActivityComments)
                    .ThenInclude(c => c.Author)
                .Where(a => a.GameId == gameId && a.Game!.UserId == userId)
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync();

            return activities.Select(a => MapActivityToDto(a, userId)).ToList();
        }

        public async Task<Dictionary<string, int>> GetActivityStatsByTypeAsync(int userId, int? year = null)
        {
            var query = _context.Activities
                .Include(a => a.Game)
                .Where(a => a.Game!.UserId == userId);

            if (year.HasValue)
            {
                query = query.Where(a => a.Timestamp.Year == year.Value);
            }

            var stats = await query
                .GroupBy(a => a.Type)
                .Select(g => new { Type = g.Key.ToString(), Count = g.Count() })
                .ToDictionaryAsync(x => x.Type, x => x.Count);            return stats;
        }

        public async Task CreateStatusChangeActivityAsync(Game game, GameStatus newStatus, string previousStatus, int userId)
        {
            try
            {
                ActivityType activityType;
                string? additionalInfo = null;

                // Determina il tipo di attività basato sul nuovo stato
                switch (newStatus)
                {
                    case GameStatus.Completed:
                        activityType = ActivityType.Completed;
                        break;
                    case GameStatus.Platinum:
                        activityType = ActivityType.Platinum;
                        break;
                    case GameStatus.Abandoned:
                        activityType = ActivityType.Abandoned;
                        break;
                    case GameStatus.InProgress:
                        // Caso speciale: se il gioco viene ripreso da uno stato finale
                        if (previousStatus == "Abandoned" || previousStatus == "Completed" || previousStatus == "Platinum")
                        {
                            activityType = ActivityType.Played;
                            additionalInfo = "ripreso";
                        }
                        else
                        {
                            // Se è il primo avvio (da NotStarted), non creare attività qui
                            // sarà gestita dalla funzione di playtime
                            return;
                        }
                        break;
                    default:
                        // Per NotStarted e altri stati, non creare attività specifiche
                        return;
                }

                var createActivityDto = new CreateActivityDto
                {
                    Type = activityType,
                    GameId = game.Id,
                    AdditionalInfo = additionalInfo
                };

                await CreateActivityAsync(userId, createActivityDto);
            }
            catch (Exception ex)
            {
                // Log l'errore ma non fermare l'operazione principale
                Console.WriteLine($"Errore durante la creazione dell'attività per cambio stato: {ex.Message}");
            }
        }

    
        public async Task CreatePlaytimeActivityAsync(Game game, int newHours, int previousHours, bool wasNotStarted, int userId)
        {
            try
            {
                var hoursDifference = newHours - previousHours;
                string additionalInfo;                if (wasNotStarted && newHours > 0)
                {
                    // Prima sessione di gioco
                    additionalInfo = hoursDifference == 1 
                        ? $"iniziato - {hoursDifference} ora giocata" 
                        : $"iniziato - {hoursDifference} ore giocate";
                }
                else if (hoursDifference < 0)
                {
                    // Ore rimosse
                    additionalInfo = $"-{Math.Abs(hoursDifference)} ore";
                }
                else if (hoursDifference > 0)
                {
                    // Ore aggiunte
                    additionalInfo = $"{hoursDifference} ore";
                }
                else
                {
                    // Nessun cambiamento nelle ore
                    return;
                }

                var createActivityDto = new CreateActivityDto
                {
                    Type = ActivityType.Played,
                    GameId = game.Id,
                    AdditionalInfo = additionalInfo
                };

                await CreateActivityAsync(userId, createActivityDto);
            }
            catch (Exception ex)
            {                // Log l'errore ma non fermare l'operazione principale
                Console.WriteLine($"Errore durante la creazione dell'attività per playtime: {ex.Message}");
            }
        }

        public async Task CreateRatingActivityAsync(Game game, decimal newRating, decimal previousRating, int userId)
        {
            try
            {
                // Solo se il rating è effettivamente cambiato e non è zero
                if (newRating == previousRating || newRating == 0)
                    return;

                // Formatta il rating rimuovendo i decimali inutili
                var formattedRating = newRating % 1 == 0 ? newRating.ToString("0") : newRating.ToString("0.0");
                var additionalInfo = $"{formattedRating}/5 stelle";

                var createActivityDto = new CreateActivityDto
                {
                    Type = ActivityType.Rated,
                    GameId = game.Id,
                    AdditionalInfo = additionalInfo
                };                
                await CreateActivityAsync(userId, createActivityDto);
            }
            catch (Exception ex)
            {
                // Log l'errore ma non fermare l'operazione principale
                Console.WriteLine($"Errore durante la creazione dell'attività per rating: {ex.Message}");
            }
        }       
        public async Task CreateAddGameActivityAsync(Game game, int userId)
        {
            try
            {
                // Crea informazioni aggiuntive dettagliate per l'aggiunta del gioco
                var additionalInfoParts = new List<string>();
                
                // Aggiungi la piattaforma se disponibile
                if (!string.IsNullOrEmpty(game.Platform))
                {
                    additionalInfoParts.Add($"Piattaforma: {game.Platform}");
                }
                
                // Aggiungi l'anno se disponibile e diverso dall'anno corrente
                if (game.ReleaseYear != 0 && game.ReleaseYear != DateTime.UtcNow.Year)
                {
                    additionalInfoParts.Add($"Anno: {game.ReleaseYear}");
                }
                
                // Aggiungi il prezzo se maggiore di 0
                if (game.Price > 0)
                {
                    additionalInfoParts.Add($"Prezzo: {game.Price:C}");
                }
                
                // Aggiungi lo stato iniziale se diverso da NotStarted
                if (game.Status != GameStatus.NotStarted)
                {
                    var statusLabel = game.Status switch
                    {
                        GameStatus.InProgress => "In corso",
                        GameStatus.Completed => "Completato",
                        GameStatus.Platinum => "Platino",
                        GameStatus.Abandoned => "Abbandonato",
                        _ => game.Status.ToString()
                    };
                    additionalInfoParts.Add($"Stato: {statusLabel}");
                }
                
                // Aggiungi le ore se maggiori di 0
                if (game.HoursPlayed > 0)
                {
                    additionalInfoParts.Add($"Ore: {game.HoursPlayed}h");
                }

                // Unisci tutte le informazioni con " • "
                var additionalInfo = additionalInfoParts.Count > 0 
                    ? string.Join(" • ", additionalInfoParts) 
                    : null;

                // Crea l'attività "Added"
                var createActivityDto = new CreateActivityDto
                {
                    Type = ActivityType.Added,
                    GameId = game.Id,
                    AdditionalInfo = additionalInfo
                };

                await CreateActivityAsync(userId, createActivityDto);

                // Se il gioco ha ore di gioco e non è "NotStarted", crea anche l'attività "played"
                if (game.HoursPlayed > 0 && game.Status != GameStatus.NotStarted)
                {
                    var activityType = game.Status switch
                    {
                        GameStatus.InProgress => ActivityType.Played,
                        GameStatus.Completed => ActivityType.Completed,
                        GameStatus.Platinum => ActivityType.Platinum,
                        GameStatus.Abandoned => ActivityType.Abandoned,
                        _ => ActivityType.Played
                    };
                    
                    var playedActivityDto = new CreateActivityDto
                    {
                        Type = activityType,
                        GameId = game.Id,
                        AdditionalInfo = game.HoursPlayed > 0 
                            ? (game.HoursPlayed == 1 
                                ? $"iniziato - {game.HoursPlayed} ora giocata" 
                                : $"iniziato - {game.HoursPlayed} ore giocate") 
                            : null
                    };

                    await CreateActivityAsync(userId, playedActivityDto);
                }
            }
            catch (Exception ex)
            {                // Log l'errore ma non fermare l'operazione principale
                Console.WriteLine($"Errore durante la creazione dell'attività per aggiunta gioco: {ex.Message}");
            }
        }       
        public async Task<PaginatedActivitiesDto> GetPublicActivitiesAsync(string userIdOrUsername, int currentUserId, ActivityFiltersDto filters, int page = 1, int pageSize = 20)
        {
            // Prima determina l'ID dell'utente target
            int targetUserId;
            User? targetUser = null;

            if (int.TryParse(userIdOrUsername, out targetUserId))
            {
                // È un ID numerico
                targetUser = await _context.Users.FindAsync(targetUserId);
            }
            else
            {
                // È un username
                targetUser = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userIdOrUsername);
                if (targetUser != null)
                {
                    targetUserId = targetUser.Id;
                }
            }

            if (targetUser == null)
            {
                throw new ArgumentException("Utente non trovato");
            }

            // Controlla i permessi di visibilità
            bool canViewDiary = await CanViewUserDiary(targetUserId, currentUserId);
            
            if (!canViewDiary)
            {
                throw new UnauthorizedAccessException("Non hai i permessi per visualizzare il diario di questo utente");
            }            // Ottieni le attività CON le reazioni
            var query = _context.Activities
                .Include(a => a.Game)
                .Include(a => a.Reactions)
                    .ThenInclude(r => r.User)
                .Include(a => a.ActivityComments)
                    .ThenInclude(c => c.Author)
                .Where(a => a.Game!.UserId == targetUserId);

            // Applicazione filtri
            if (filters.Types?.Any() == true)
            {
                query = query.Where(a => filters.Types.Contains(a.Type));
            }

            if (filters.Year.HasValue)
            {
                query = query.Where(a => a.Timestamp.Year == filters.Year.Value);
            }

            if (filters.Month.HasValue)
            {
                query = query.Where(a => a.Timestamp.Month == filters.Month.Value);
            }

            if (filters.GameId.HasValue)
            {
                query = query.Where(a => a.GameId == filters.GameId.Value);
            }

            // Ordinamento
            if (filters.SortDirection?.ToLower() == "asc")
            {
                query = query.OrderBy(a => a.Timestamp);
            }
            else
            {
                query = query.OrderByDescending(a => a.Timestamp);
            }

            // Conta il totale prima della paginazione
            var totalCount = await query.CountAsync();            // Applica paginazione
            var activities = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PaginatedActivitiesDto
            {
                Activities = activities.Select(a => MapActivityToDto(a, currentUserId)).ToList(),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };}

        private async Task<bool> CanViewUserDiary(int targetUserId, int currentUserId)
        {
            // Se è lo stesso utente, può sempre vedere
            if (targetUserId == currentUserId)
            {
                return true;
            }

            var targetUser = await _context.Users.FindAsync(targetUserId);
            if (targetUser == null)
            {
                return false;
            }

            // Se il profilo è privato, controlla se sono amici
            if (targetUser.PrivacySettings.IsPrivate)
            {
                var friendship = await _context.Friendships
                    .FirstOrDefaultAsync(f =>
                        ((f.SenderId == currentUserId && f.ReceiverId == targetUserId) ||
                         (f.SenderId == targetUserId && f.ReceiverId == currentUserId)) &&
                        f.Status == FriendshipStatus.Accepted);

                return friendship != null;
            }

            // Altrimenti, il diario è pubblico
            return true;
        }        // Metodi per le reazioni emoji alle attività

        public async Task<ActivityReactionDto?> AddReactionAsync(CreateActivityReactionDto createReactionDto, int userId)
        {
            try
            {
                // Verifica che l'attività esista e carica i dati del gioco
                var activity = await _context.Activities
                    .Include(a => a.Game)
                    .FirstOrDefaultAsync(a => a.Id == createReactionDto.ActivityId);
                if (activity == null) return null;

                // Verifica se l'utente ha già reagito con la stessa emoji a questa attività
                var existingReaction = await _context.ActivityReactions
                    .FirstOrDefaultAsync(r => r.ActivityId == createReactionDto.ActivityId 
                                            && r.UserId == userId 
                                            && r.Emoji == createReactionDto.Emoji);

                if (existingReaction != null)
                {
                    // Se esiste già, rimuovila (toggle)
                    _context.ActivityReactions.Remove(existingReaction);
                    await _context.SaveChangesAsync();
                    return null; // Indica che la reazione è stata rimossa
                }

                // Crea una nuova reazione
                var reaction = new ActivityReaction
                {
                    Emoji = createReactionDto.Emoji,
                    ActivityId = createReactionDto.ActivityId,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.ActivityReactions.Add(reaction);
                await _context.SaveChangesAsync();

                // Carica i dati dell'utente per il DTO
                var user = await _context.Users.FindAsync(userId);

                // Crea notifica per il proprietario dell'attività (se non è lui stesso)
                if (activity.Game != null && activity.Game.UserId != userId)
                {
                    try
                    {
                        await _notificationService.CreateActivityReactionNotificationAsync(
                            activity.Game.UserId,
                            userId,
                            user?.UserName ?? "Utente sconosciuto",
                            createReactionDto.Emoji,
                            activity.GameTitle,
                            createReactionDto.ActivityId
                        );
                    }
                    catch (Exception notificationEx)
                    {
                        // Log dell'errore ma non bloccare l'operazione principale
                        Console.WriteLine($"Errore nella creazione della notifica per reazione: {notificationEx.Message}");
                    }
                }

                return new ActivityReactionDto
                {
                    Id = reaction.Id,
                    Emoji = reaction.Emoji,
                    CreatedAt = reaction.CreatedAt,
                    ActivityId = reaction.ActivityId,
                    UserId = reaction.UserId,
                    UserName = user?.UserName
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Errore nell'aggiunta della reazione: {ex.Message}");
                return null;
            }
        }
        
        public async Task<bool> RemoveReactionAsync(int reactionId, int userId)
        {
            try
            {
                var reaction = await _context.ActivityReactions
                    .FirstOrDefaultAsync(r => r.Id == reactionId && r.UserId == userId);

                if (reaction == null) return false;

                _context.ActivityReactions.Remove(reaction);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Errore nella rimozione della reazione: {ex.Message}");
                return false;
            }
        }

        public async Task<List<ActivityReactionDto>> GetActivityReactionsAsync(int activityId, int userId)
        {
            try
            {
                // Verifica che l'attività esista
                var activity = await _context.Activities
                    .Include(a => a.Game)
                    .FirstOrDefaultAsync(a => a.Id == activityId);

                if (activity == null)
                {
                    throw new ArgumentException("Attività non trovata");
                }

                // Verifica i permessi di visibilità dell'attività
                // Se l'attività appartiene a un altro utente, controlla se il diary è pubblico
                if (activity.Game!.UserId != userId)
                {
                    bool canViewDiary = await CanViewUserDiary(activity.Game.UserId, userId);
                    if (!canViewDiary)
                    {
                        throw new UnauthorizedAccessException("Non hai i permessi per visualizzare le reazioni di questa attività");
                    }
                }

                // Ottieni tutte le reazioni per l'attività con i dati degli utenti
                var reactions = await _context.ActivityReactions
                    .Include(r => r.User)
                    .Where(r => r.ActivityId == activityId)
                    .OrderBy(r => r.CreatedAt)
                    .ToListAsync();

                return reactions.Select(r => new ActivityReactionDto
                {
                    Id = r.Id,
                    Emoji = r.Emoji,
                    CreatedAt = r.CreatedAt,
                    ActivityId = r.ActivityId,
                    UserId = r.UserId,
                    UserName = r.User?.UserName
                }).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Errore nel recupero delle reazioni per l'attività {activityId}: {ex.Message}");
                throw;
            }
        }

        private ActivityDto MapActivityToDto(Activity activity, int currentUserId)
        {
            // Calcola il sommario delle reazioni raggruppate per emoji
            var reactionsSummary = activity.Reactions
                .GroupBy(r => r.Emoji)
                .Select(g => new ActivityReactionSummaryDto
                {
                    Emoji = g.Key,
                    Count = g.Count(),
                    UserNames = g.Select(r => r.User?.UserName ?? "").Where(u => !string.IsNullOrEmpty(u)).ToList()
                })
                .ToList();

            // Trova la reazione dell'utente corrente (se presente)
            var userReaction = activity.Reactions
                .FirstOrDefault(r => r.UserId == currentUserId)?.Emoji;            return new ActivityDto
            {
                Id = activity.Id,
                Type = activity.Type,
                GameId = activity.GameId,
                GameTitle = activity.GameTitle,
                Timestamp = activity.Timestamp,
                AdditionalInfo = activity.AdditionalInfo,
                GameImageUrl = activity.Game?.CoverImage,
                ReactionsSummary = reactionsSummary,
                UserReaction = userReaction,
                Reactions = activity.Reactions.Select(r => new ActivityReactionDto
                {
                    Id = r.Id,
                    Emoji = r.Emoji,
                    CreatedAt = r.CreatedAt,
                    ActivityId = r.ActivityId,
                    UserId = r.UserId,
                    UserName = r.User?.UserName
                }).ToList(),
                ReactionCounts = activity.Reactions
                    .GroupBy(r => r.Emoji)
                    .ToDictionary(g => g.Key, g => g.Count()),
                Comments = activity.ActivityComments.Select(c => new ActivityCommentDto
                {
                    Id = c.Id,
                    Text = c.Text,
                    Date = c.Date,
                    ActivityId = c.ActivityId,
                    AuthorId = c.AuthorId,
                    AuthorUsername = c.Author?.UserName ?? "Utente sconosciuto",
                    AuthorAvatar = c.Author?.Avatar
                }).ToList(),
                CommentsCount = activity.ActivityComments.Count
            };
        }
    }
}
