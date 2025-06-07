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
    public class ActivityController : ControllerBase
    {
        private readonly IActivityService _activityService;

        public ActivityController(IActivityService activityService)
        {
            _activityService = activityService;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("User ID non valido");
        }        /// <summary>
        /// Ottiene le attività dell'utente con filtri e paginazione
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<PaginatedActivitiesDto>> GetActivities(
            [FromQuery] ActivityFiltersDto filters,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var userId = GetUserId();
                
                // Assicurati che filters non sia null
                filters ??= new ActivityFiltersDto();
                
                var result = await _activityService.GetActivitiesAsync(userId, filters, page, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Ottiene una specifica attività per ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ActivityDto>> GetActivity(int id)
        {
            try
            {
                var userId = GetUserId();
                var activity = await _activityService.GetActivityByIdAsync(id, userId);
                
                if (activity == null)
                    return NotFound(new { message = "Attività non trovata" });

                return Ok(activity);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Crea una nuova attività
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ActivityDto>> CreateActivity([FromBody] CreateActivityDto createActivityDto)
        {
            try
            {
                var userId = GetUserId();
                var activity = await _activityService.CreateActivityAsync(userId, createActivityDto);
                return CreatedAtAction(nameof(GetActivity), new { id = activity.Id }, activity);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Aggiorna un'attività esistente
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ActivityDto>> UpdateActivity(int id, [FromBody] UpdateActivityDto updateActivityDto)
        {
            try
            {
                var userId = GetUserId();
                var activity = await _activityService.UpdateActivityAsync(id, userId, updateActivityDto);
                
                if (activity == null)
                    return NotFound(new { message = "Attività non trovata" });

                return Ok(activity);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Elimina un'attività
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteActivity(int id)
        {
            try
            {
                var userId = GetUserId();
                var success = await _activityService.DeleteActivityAsync(id, userId);
                
                if (!success)
                    return NotFound(new { message = "Attività non trovata" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Ottiene le attività recenti dell'utente
        /// </summary>
        [HttpGet("recent")]
        public async Task<ActionResult<List<ActivityDto>>> GetRecentActivities([FromQuery] int count = 10)
        {
            try
            {
                var userId = GetUserId();
                var activities = await _activityService.GetRecentActivitiesAsync(userId, count);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Ottiene le attività per un gioco specifico
        /// </summary>
        [HttpGet("game/{gameId}")]
        public async Task<ActionResult<List<ActivityDto>>> GetActivitiesByGame(int gameId)
        {
            try
            {
                var userId = GetUserId();
                var activities = await _activityService.GetActivitiesByGameAsync(gameId, userId);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }        /// <summary>
        /// Ottiene statistiche delle attività per tipo
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult<Dictionary<string, int>>> GetActivityStats([FromQuery] int? year = null)
        {
            try
            {
                var userId = GetUserId();
                var stats = await _activityService.GetActivityStatsByTypeAsync(userId, year);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Ottiene le attività pubbliche di un utente per il suo profilo pubblico
        /// </summary>
        [HttpGet("public/{userIdOrUsername}")]
        public async Task<ActionResult<PaginatedActivitiesDto>> GetPublicActivities(
            string userIdOrUsername,
            [FromQuery] ActivityFiltersDto filters,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var currentUserId = GetUserId();
                
                // Assicurati che filters non sia null
                filters ??= new ActivityFiltersDto();
                
                var result = await _activityService.GetPublicActivitiesAsync(userIdOrUsername, currentUserId, filters, page, pageSize);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
