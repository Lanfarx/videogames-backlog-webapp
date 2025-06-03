using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Interfaces;
using System.Security.Claims;

namespace VideoGamesBacklogBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        /// <summary>
        /// Ottiene tutte le notifiche dell'utente corrente
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<NotificationDto>>> GetNotifications()
        {
            try
            {
                var userId = GetCurrentUserId();
                var notifications = await _notificationService.GetUserNotificationsAsync(userId);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore durante il recupero delle notifiche", error = ex.Message });
            }
        }

        /// <summary>
        /// Ottiene il conteggio delle notifiche non lette dell'utente corrente
        /// </summary>
        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                var count = await _notificationService.GetUnreadCountAsync(userId);
                return Ok(count);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore durante il recupero del conteggio notifiche", error = ex.Message });
            }
        }

        /// <summary>
        /// Marca una notifica come letta
        /// </summary>
        [HttpPut("{id}/mark-read")]
        public async Task<ActionResult> MarkAsRead(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _notificationService.MarkAsReadAsync(id, userId);
                
                if (!result)
                {
                    return NotFound(new { message = "Notifica non trovata o non autorizzato" });
                }

                return Ok(new { message = "Notifica marcata come letta" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore durante l'aggiornamento della notifica", error = ex.Message });
            }
        }

        /// <summary>
        /// Marca tutte le notifiche dell'utente come lette
        /// </summary>
        [HttpPut("mark-all-read")]
        public async Task<ActionResult> MarkAllAsRead()
        {
            try
            {
                var userId = GetCurrentUserId();
                await _notificationService.MarkAllAsReadAsync(userId);
                return Ok(new { message = "Tutte le notifiche sono state marcate come lette" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore durante l'aggiornamento delle notifiche", error = ex.Message });
            }
        }

        /// <summary>
        /// Elimina una notifica
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteNotification(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _notificationService.DeleteNotificationAsync(id, userId);
                
                if (!result)
                {
                    return NotFound(new { message = "Notifica non trovata o non autorizzato" });
                }

                return Ok(new { message = "Notifica eliminata con successo" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore durante l'eliminazione della notifica", error = ex.Message });
            }
        }

        /// <summary>
        /// Elimina tutte le notifiche lette dell'utente
        /// </summary>
        [HttpDelete("read")]
        public async Task<ActionResult> DeleteReadNotifications()
        {
            try
            {
                var userId = GetCurrentUserId();
                await _notificationService.DeleteReadNotificationsAsync(userId);
                return Ok(new { message = "Notifiche lette eliminate con successo" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore durante l'eliminazione delle notifiche", error = ex.Message });
            }
        }

        /// <summary>
        /// Ottiene l'ID dell'utente corrente dal token JWT
        /// </summary>
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("Token non valido");
            }
            return userId;
        }
    }
}
