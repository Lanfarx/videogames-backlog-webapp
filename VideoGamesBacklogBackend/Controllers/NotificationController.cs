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
        }        [HttpPut("{id}/mark-read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _notificationService.MarkAsReadAsync(id, userId);
                if (!result)
                {
                    return NotFound(new { message = "Notifica non trovata" });
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore durante l'aggiornamento della notifica", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _notificationService.DeleteNotificationAsync(id, userId);
                if (!result)
                {
                    return NotFound(new { message = "Notifica non trovata" });
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore durante l'eliminazione della notifica", error = ex.Message });
            }
        }

        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _notificationService.MarkAllAsReadAsync(userId);
                if (!result)
                {
                    return BadRequest(new { message = "Errore durante l'aggiornamento delle notifiche" });
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore durante l'aggiornamento delle notifiche", error = ex.Message });
            }
        }

        [HttpDelete("read")]
        public async Task<IActionResult> DeleteReadNotifications()
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _notificationService.DeleteReadNotificationsAsync(userId);
                if (!result)
                {
                    return BadRequest(new { message = "Errore durante l'eliminazione delle notifiche" });
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore durante l'eliminazione delle notifiche", error = ex.Message });
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("User ID non valido");
        }
    }
}
