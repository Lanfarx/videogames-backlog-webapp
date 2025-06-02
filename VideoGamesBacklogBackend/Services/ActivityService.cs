using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Data;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Models;

namespace VideoGamesBacklogBackend.Services
{
    public class ActivityService : IActivityService
    {
        private readonly AppDbContext _context;

        public ActivityService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PaginatedActivitiesDto> GetActivitiesAsync(int userId, ActivityFiltersDto filters, int page = 1, int pageSize = 20)
        {
            var query = _context.Activities
                .Include(a => a.Game)
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
                .Select(a => new ActivityDto
                {
                    Id = a.Id,
                    Type = a.Type,
                    GameId = a.GameId,
                    GameTitle = a.GameTitle,
                    Timestamp = a.Timestamp,
                    AdditionalInfo = a.AdditionalInfo
                })
                .ToListAsync();

            return new PaginatedActivitiesDto
            {
                Activities = activities,
                TotalCount = totalCount,
                PageSize = pageSize,
                CurrentPage = page,
                TotalPages = totalPages
            };
        }

        public async Task<ActivityDto?> GetActivityByIdAsync(int activityId, int userId)
        {
            var activity = await _context.Activities
                .Include(a => a.Game)
                .FirstOrDefaultAsync(a => a.Id == activityId && a.Game!.UserId == userId);

            if (activity == null)
                return null;

            return new ActivityDto
            {
                Id = activity.Id,
                Type = activity.Type,
                GameId = activity.GameId,
                GameTitle = activity.GameTitle,
                Timestamp = activity.Timestamp,
                AdditionalInfo = activity.AdditionalInfo
            };
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
            };

            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();

            return new ActivityDto
            {
                Id = activity.Id,
                Type = activity.Type,
                GameId = activity.GameId,
                GameTitle = activity.GameTitle,
                Timestamp = activity.Timestamp,
                AdditionalInfo = activity.AdditionalInfo
            };
        }

        public async Task<ActivityDto?> UpdateActivityAsync(int activityId, int userId, UpdateActivityDto updateActivityDto)
        {
            var activity = await _context.Activities
                .Include(a => a.Game)
                .FirstOrDefaultAsync(a => a.Id == activityId && a.Game!.UserId == userId);

            if (activity == null)
                return null;

            if (updateActivityDto.Type.HasValue)
                activity.Type = updateActivityDto.Type.Value;

            if (!string.IsNullOrEmpty(updateActivityDto.AdditionalInfo))
                activity.AdditionalInfo = updateActivityDto.AdditionalInfo;

            await _context.SaveChangesAsync();

            return new ActivityDto
            {
                Id = activity.Id,
                Type = activity.Type,
                GameId = activity.GameId,
                GameTitle = activity.GameTitle,
                Timestamp = activity.Timestamp,
                AdditionalInfo = activity.AdditionalInfo
            };
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
        }

        public async Task<List<ActivityDto>> GetRecentActivitiesAsync(int userId, int count = 10)
        {
            var activities = await _context.Activities
                .Include(a => a.Game)
                .Where(a => a.Game!.UserId == userId)
                .OrderByDescending(a => a.Timestamp)
                .Take(count)
                .Select(a => new ActivityDto
                {
                    Id = a.Id,
                    Type = a.Type,
                    GameId = a.GameId,
                    GameTitle = a.GameTitle,
                    Timestamp = a.Timestamp,
                    AdditionalInfo = a.AdditionalInfo
                })
                .ToListAsync();

            return activities;
        }

        public async Task<List<ActivityDto>> GetActivitiesByGameAsync(int gameId, int userId)
        {
            var activities = await _context.Activities
                .Include(a => a.Game)
                .Where(a => a.GameId == gameId && a.Game!.UserId == userId)
                .OrderByDescending(a => a.Timestamp)
                .Select(a => new ActivityDto
                {
                    Id = a.Id,
                    Type = a.Type,
                    GameId = a.GameId,
                    GameTitle = a.GameTitle,
                    Timestamp = a.Timestamp,
                    AdditionalInfo = a.AdditionalInfo
                })
                .ToListAsync();

            return activities;
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

        /// <summary>
        /// Crea un'attività per il cambio di stato di un gioco
        /// </summary>
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

        /// <summary>
        /// Crea un'attività per l'aggiornamento delle ore di gioco
        /// </summary>
        public async Task CreatePlaytimeActivityAsync(Game game, int newHours, int previousHours, bool wasNotStarted, int userId)
        {
            try
            {
                var hoursDifference = newHours - previousHours;
                string additionalInfo;

                if (wasNotStarted && newHours > 0)
                {
                    // Prima sessione di gioco
                    additionalInfo = $"iniziato:{Math.Abs(hoursDifference)} ore";
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

        /// <summary>
        /// Crea un'attività per la valutazione di un gioco
        /// </summary>
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
        }        /// <summary>
        /// Crea un'attività "Added" quando viene aggiunto un nuovo gioco alla libreria
        /// </summary>
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
                        AdditionalInfo = game.HoursPlayed > 0 ? $"iniziato:{game.HoursPlayed} ore" : null
                    };

                    await CreateActivityAsync(userId, playedActivityDto);
                }
            }
            catch (Exception ex)
            {
                // Log l'errore ma non fermare l'operazione principale
                Console.WriteLine($"Errore durante la creazione dell'attività per aggiunta gioco: {ex.Message}");
            }
        }
        }
    }
