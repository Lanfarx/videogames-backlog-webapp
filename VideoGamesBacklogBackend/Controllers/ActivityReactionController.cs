using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Interfaces;

namespace VideoGamesBacklogBackend.Controllers
{
    [ApiController]
    [Route("api/activity-reactions")]
    [Authorize]
    public class ActivityReactionController : ControllerBase
    {
        private readonly IActivityService _activityService;

        public ActivityReactionController(IActivityService activityService)
        {
            _activityService = activityService;
        }

        /// <summary>
        /// Aggiunge o rimuove una reazione emoji a un'attività (toggle)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> ToggleReaction([FromBody] CreateActivityReactionDto createReactionDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized("Utente non autenticato");
                }

                var result = await _activityService.AddReactionAsync(createReactionDto, userId.Value);
                
                if (result == null)
                {
                    return Ok(new { message = "Reazione rimossa", removed = true });
                }            return Ok(new { message = "Reazione aggiunta", reaction = result, removed = false });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore nell'aggiunta della reazione", error = ex.Message });
            }
        }        /// <summary>
        /// Ottiene tutte le reazioni per una specifica attività
        /// </summary>
        [HttpGet("activity/{activityId}")]
        public async Task<IActionResult> GetActivityReactions(int activityId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized("Utente non autenticato");
                }

                var reactions = await _activityService.GetActivityReactionsAsync(activityId, userId.Value);
                
                return Ok(new { 
                    activityId = activityId,
                    reactions = reactions,
                    message = "Reazioni recuperate con successo" 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore nel recupero delle reazioni", error = ex.Message });
            }
        }

        /// <summary>
        /// Rimuove una reazione specifica
        /// </summary>
        [HttpDelete("{reactionId}")]
        public async Task<IActionResult> RemoveReaction(int reactionId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized("Utente non autenticato");
                }

                var success = await _activityService.RemoveReactionAsync(reactionId, userId.Value);
                
                if (!success)
                {
                    return NotFound("Reazione non trovata o non autorizzato");
                }

                return Ok(new { message = "Reazione rimossa con successo" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore nella rimozione della reazione", error = ex.Message });
            }        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }
}
