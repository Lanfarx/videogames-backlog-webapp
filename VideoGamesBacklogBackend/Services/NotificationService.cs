using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using VideoGamesBacklogBackend.Data;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Models;

namespace VideoGamesBacklogBackend.Services
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;

        public NotificationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return notifications.Select(MapToDto);
        }

        public async Task<IEnumerable<NotificationDto>> GetUnreadNotificationsAsync(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return notifications.Select(MapToDto);        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _context.Notifications
                .CountAsync(n => n.UserId == userId && !n.IsRead);
        }

        public async Task<NotificationDto?> CreateNotificationAsync(CreateNotificationDto createDto)
        {
            var notification = new Notification
            {
                UserId = createDto.UserId,
                Type = createDto.Type,
                Title = createDto.Title,
                Message = createDto.Message,
                Data = createDto.Data != null ? JsonSerializer.Serialize(createDto.Data) : null,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return MapToDto(notification);
        }

        public async Task<bool> MarkAsReadAsync(int notificationId, int userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

            if (notification == null)
                return false;

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }        public async Task<bool> MarkAllAsReadAsync(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteNotificationAsync(int notificationId, int userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

            if (notification == null)
                return false;

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteReadNotificationsAsync(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && n.IsRead)
                .ToListAsync();

            _context.Notifications.RemoveRange(notifications);
            await _context.SaveChangesAsync();
            return true;
        }

        // Metodi helper per creare notifiche specifiche
        public async Task CreateFriendRequestNotificationAsync(int receiverId, int senderId, string senderUserName, int friendshipId)
        {
            var createDto = new CreateNotificationDto
            {
                UserId = receiverId,
                Type = "friend_request",
                Title = "Nuova richiesta di amicizia",
                Message = $"{senderUserName} ti ha inviato una richiesta di amicizia",
                Data = new
                {
                    userId = senderId,
                    requestId = friendshipId,
                    userName = senderUserName
                }
            };

            await CreateNotificationAsync(createDto);
        }

        public async Task CreateFriendAcceptedNotificationAsync(int receiverId, int senderId, string senderUserName)
        {
            var createDto = new CreateNotificationDto
            {
                UserId = receiverId,
                Type = "friend_accepted",
                Title = "Richiesta di amicizia accettata",
                Message = $"{senderUserName} ha accettato la tua richiesta di amicizia",
                Data = new
                {
                    userId = senderId,
                    userName = senderUserName
                }
            };

            await CreateNotificationAsync(createDto);
        }

        public async Task CreateFriendRejectedNotificationAsync(int receiverId, int senderId, string senderUserName)
        {
            var createDto = new CreateNotificationDto
            {
                UserId = receiverId,
                Type = "friend_rejected",
                Title = "Richiesta di amicizia rifiutata",
                Message = $"{senderUserName} ha rifiutato la tua richiesta di amicizia",
                Data = new
                {
                    userId = senderId,
                    userName = senderUserName
                }
            };

            await CreateNotificationAsync(createDto);
        }

        private static NotificationDto MapToDto(Notification notification)
        {
            object? data = null;
            if (!string.IsNullOrEmpty(notification.Data))
            {
                try
                {
                    data = JsonSerializer.Deserialize<object>(notification.Data);
                }
                catch
                {
                    // Se la deserializzazione fallisce, usa il dato grezzo
                    data = notification.Data;
                }
            }

            return new NotificationDto
            {
                Id = notification.Id,
                Type = notification.Type,
                Title = notification.Title,
                Message = notification.Message,
                CreatedAt = notification.CreatedAt,
                IsRead = notification.IsRead,
                Data = data
            };
        }
    }
}
