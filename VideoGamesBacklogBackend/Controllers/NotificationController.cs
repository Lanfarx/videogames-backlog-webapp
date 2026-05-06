using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Helpers;

namespace VideoGamesBacklogBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController(INotificationService notificationService) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotificationDto>>> GetNotifications()
        {
            var notifications = await notificationService.GetUserNotificationsAsync(User.GetUserId());
            return Ok(notifications);
        }

        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            var count = await notificationService.GetUnreadCountAsync(User.GetUserId());
            return Ok(count);
        }

        [HttpPut("{id:int}/mark-read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var result = await notificationService.MarkAsReadAsync(id, User.GetUserId());
            if (!result)
                throw new KeyNotFoundException("Notifica non trovata.");
            return Ok();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var result = await notificationService.DeleteNotificationAsync(id, User.GetUserId());
            if (!result)
                throw new KeyNotFoundException("Notifica non trovata.");
            return Ok();
        }

        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            await notificationService.MarkAllAsReadAsync(User.GetUserId());
            return Ok();
        }

        [HttpDelete("read")]
        public async Task<IActionResult> DeleteReadNotifications()
        {
            await notificationService.DeleteReadNotificationsAsync(User.GetUserId());
            return Ok();
        }
    }
}
