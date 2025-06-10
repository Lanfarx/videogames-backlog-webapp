using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Models;

namespace VideoGamesBacklogBackend.Interfaces
{
    public interface INotificationService
    {
        Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(int userId);
        Task<IEnumerable<NotificationDto>> GetUnreadNotificationsAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);
        Task<NotificationDto?> CreateNotificationAsync(CreateNotificationDto createDto);
        Task<bool> MarkAsReadAsync(int notificationId, int userId);
        Task<bool> MarkAllAsReadAsync(int userId);
        Task<bool> DeleteNotificationAsync(int notificationId, int userId);
        Task<bool> DeleteReadNotificationsAsync(int userId);
        
        // Metodi helper per creare notifiche specifiche
        Task CreateFriendRequestNotificationAsync(int receiverId, int senderId, string senderUserName, int friendshipId);
        Task CreateFriendAcceptedNotificationAsync(int receiverId, int senderId, string senderUserName);
        Task CreateFriendRejectedNotificationAsync(int receiverId, int senderId, string senderUserName);
    }
}
