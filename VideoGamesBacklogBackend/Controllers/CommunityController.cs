using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Interfaces;

namespace VideoGamesBacklogBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CommunityController : ControllerBase
    {
        private readonly ICommunityService _communityService;
        private readonly ILogger<CommunityController> _logger;        
        public CommunityController(ICommunityService communityService, ILogger<CommunityController> logger)
        {
            _communityService = communityService;
            _logger = logger;
        }

        /// <summary>
        /// Ottiene l'ID dell'utente corrente dal token JWT
        /// </summary>
        /// <returns>ID dell'utente corrente o null se non autenticato</returns>
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            return null;
        }

        /// <summary>
        /// Ottiene le statistiche aggregate della community per un gioco specifico
        /// </summary>
        /// <param name="gameTitle">Titolo del gioco</param>
        /// <returns>Statistiche aggregate della community</returns>
        [HttpGet("stats/{gameTitle}")]
        public async Task<ActionResult<CommunityStatsDto>> GetCommunityStats(string gameTitle)
        {
            try
            {
                var stats = await _communityService.GetCommunityStatsAsync(gameTitle);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel recupero delle statistiche community per {GameTitle}", gameTitle);
                return StatusCode(500, "Errore interno del server");
            }
        }

        /// <summary>
        /// Ottiene il rating medio della community per un gioco specifico
        /// </summary>
        /// <param name="gameTitle">Titolo del gioco</param>
        /// <returns>Rating medio della community</returns>
        [HttpGet("rating/{gameTitle}")]
        public async Task<ActionResult<decimal>> GetCommunityRating(string gameTitle)
        {
            try
            {
                var rating = await _communityService.GetCommunityRatingAsync(gameTitle);
                return Ok(rating);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel recupero del rating community per {GameTitle}", gameTitle);
                return StatusCode(500, "Errore interno del server");
            }
        }        /// <summary>
        /// Ottiene i rating della community per una lista di giochi
        /// </summary>
        /// <param name="gameTitles">Lista dei titoli dei giochi</param>
        /// <returns>Dizionario con i rating per ogni gioco</returns>
        [HttpPost("ratings")]
        public async Task<ActionResult<Dictionary<string, decimal>>> GetCommunityRatings([FromBody] List<string> gameTitles)
        {
            try
            {
                var ratings = await _communityService.GetCommunityRatingsAsync(gameTitles);
                return Ok(ratings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel recupero dei rating community per {GameTitles}", string.Join(", ", gameTitles));
                return StatusCode(500, "Errore interno del server");
            }
        }

        /// <summary>
        /// Ottiene i rating della community con numero di recensioni per una lista di giochi
        /// </summary>
        /// <param name="gameTitles">Lista dei titoli dei giochi</param>
        /// <returns>Dizionario con i rating e numero di recensioni per ogni gioco</returns>
        [HttpPost("ratings-with-count")]
        public async Task<ActionResult<Dictionary<string, CommunityRatingDto>>> GetCommunityRatingsWithCount([FromBody] List<string> gameTitles)
        {
            try
            {
                var ratingsWithCount = await _communityService.GetCommunityRatingsWithCountAsync(gameTitles);
                return Ok(ratingsWithCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel recupero dei rating community con conteggio per {GameTitles}", string.Join(", ", gameTitles));
                return StatusCode(500, "Errore interno del server");
            }
        }        /// <summary>
        /// Ottiene le recensioni per un gioco con paginazione
        /// </summary>
        /// <param name="gameTitle">Titolo del gioco</param>
        /// <param name="page">Numero di pagina (default: 1)</param>
        /// <param name="pageSize">Dimensione della pagina (default: 10)</param>
        /// <returns>Recensioni paginate</returns>
        [HttpGet("reviews/{gameTitle}")]
        public async Task<ActionResult<PaginatedReviewsDto>> GetReviews(
            string gameTitle,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var reviews = await _communityService.GetReviewsAsync(gameTitle, page, pageSize, currentUserId);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel recupero delle recensioni per {GameTitle}", gameTitle);
                return StatusCode(500, "Errore interno del server");
            }
        }

        /// <summary>
        /// Ottiene le statistiche dettagliate delle recensioni per un gioco
        /// </summary>
        /// <param name="gameTitle">Titolo del gioco</param>
        /// <returns>Statistiche dettagliate delle recensioni</returns>
        [HttpGet("review-stats/{gameTitle}")]
        public async Task<ActionResult<ReviewStatsDto>> GetReviewStats(string gameTitle)
        {
            try
            {
                var stats = await _communityService.GetReviewStatsAsync(gameTitle);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel recupero delle statistiche recensioni per {GameTitle}", gameTitle);
                return StatusCode(500, "Errore interno del server");
            }
        }        /// <summary>
        /// Ottiene le top recensioni della community (con più rating positivi)
        /// </summary>
        /// <param name="gameTitle">Titolo del gioco</param>
        /// <param name="limit">Numero massimo di recensioni da restituire (default: 5)</param>
        /// <returns>Lista delle top recensioni</returns>
        [HttpGet("top-reviews/{gameTitle}")]
        public async Task<ActionResult<List<CommunityReviewDto>>> GetTopReviews(
            string gameTitle, 
            [FromQuery] int limit = 5)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var reviews = await _communityService.GetTopReviewsAsync(gameTitle, limit, currentUserId);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel recupero delle top recensioni per {GameTitle}", gameTitle);
                return StatusCode(500, "Errore interno del server");
            }
        }

        /// <summary>
        /// Ottiene i commenti per una specifica recensione
        /// </summary>
        /// <param name="reviewGameId">ID del gioco della recensione</param>
        /// <returns>Lista dei commenti alla recensione</returns>
        [HttpGet("review-comments/{reviewGameId}")]
        public async Task<ActionResult<List<ReviewCommentDto>>> GetReviewComments(int reviewGameId)
        {
            try
            {
                var comments = await _communityService.GetReviewCommentsAsync(reviewGameId);
                return Ok(comments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel recupero dei commenti per la recensione {ReviewGameId}", reviewGameId);
                return StatusCode(500, "Errore interno del server");
            }
        }        /// <summary>
        /// Aggiunge un commento a una recensione
        /// </summary>
        /// <param name="createCommentDto">Dati del commento da creare</param>
        /// <returns>Il commento creato</returns>
        [HttpPost("review-comments")]
        public async Task<ActionResult<ReviewCommentDto>> AddReviewComment([FromBody] CreateReviewCommentDto createCommentDto)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                {
                    return Unauthorized("Utente non autenticato");
                }

                var comment = await _communityService.AddReviewCommentAsync(createCommentDto, currentUserId.Value);
                
                if (comment == null)
                {
                    return BadRequest("Impossibile aggiungere il commento. La recensione potrebbe non esistere o non essere pubblica.");
                }

                return Ok(comment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nell'aggiunta del commento alla recensione {ReviewGameId}", createCommentDto.ReviewGameId);
                return StatusCode(500, "Errore interno del server");
            }
        }        /// <summary>
        /// Elimina un commento a una recensione
        /// </summary>
        /// <param name="commentId">ID del commento da eliminare</param>
        /// <returns>Conferma dell'eliminazione</returns>
        [HttpDelete("review-comments/{commentId}")]
        public async Task<ActionResult> DeleteReviewComment(int commentId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                {
                    return Unauthorized("Utente non autenticato");
                }

                var success = await _communityService.DeleteReviewCommentAsync(commentId, currentUserId.Value);
                
                if (!success)
                {
                    return NotFound("Commento non trovato o non autorizzato ad eliminarlo.");
                }

                return Ok(new { message = "Commento eliminato con successo" });
            }            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nell'eliminazione del commento {CommentId}", commentId);
                return StatusCode(500, "Errore interno del server");
            }
        }

        /// <summary>
        /// Ottiene i commenti per una specifica attività
        /// </summary>
        /// <param name="activityId">ID dell'attività</param>
        /// <returns>Lista dei commenti all'attività</returns>
        [HttpGet("activity-comments/{activityId}")]
        public async Task<ActionResult<List<ActivityCommentDto>>> GetActivityComments(int activityId)
        {
            try
            {
                var comments = await _communityService.GetActivityCommentsAsync(activityId);
                return Ok(comments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel recupero dei commenti per l'attività {ActivityId}", activityId);
                return StatusCode(500, "Errore interno del server");
            }
        }

        /// <summary>
        /// Aggiunge un commento a una attività
        /// </summary>
        /// <param name="createCommentDto">Dati del commento da creare</param>
        /// <returns>Il commento creato</returns>
        [HttpPost("activity-comments")]
        public async Task<ActionResult<ActivityCommentDto>> AddActivityComment([FromBody] CreateActivityCommentDto createCommentDto)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                {
                    return Unauthorized("Utente non autenticato");
                }

                var comment = await _communityService.AddActivityCommentAsync(createCommentDto, currentUserId.Value);
                
                if (comment == null)
                {
                    return BadRequest("Impossibile aggiungere il commento. L'attività potrebbe non esistere o non essere di tipo 'Rated'.");
                }

                return Ok(comment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nell'aggiunta del commento all'attività {ActivityId}", createCommentDto.ActivityId);
                return StatusCode(500, "Errore interno del server");
            }
        }

        /// <summary>
        /// Elimina un commento a una attività
        /// </summary>
        /// <param name="commentId">ID del commento da eliminare</param>
        /// <returns>Conferma dell'eliminazione</returns>
        [HttpDelete("activity-comments/{commentId}")]
        public async Task<ActionResult> DeleteActivityComment(int commentId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                {
                    return Unauthorized("Utente non autenticato");
                }

                var success = await _communityService.DeleteActivityCommentAsync(commentId, currentUserId.Value);
                
                if (!success)
                {
                    return NotFound("Commento non trovato o non autorizzato ad eliminarlo.");
                }

                return Ok(new { message = "Commento eliminato con successo" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nell'eliminazione del commento {CommentId}", commentId);
                return StatusCode(500, "Errore interno del server");
            }
        }
    }
}
