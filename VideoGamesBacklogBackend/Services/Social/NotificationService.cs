using JetBrains.Annotations;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.DTOs.Social;
using VideoGamesBacklogBackend.Infrastructure.Data;
using VideoGamesBacklogBackend.Interfaces.Social;

namespace VideoGamesBacklogBackend.Services.Social;

[UsedImplicitly]
public class NotificationService(AppDbContext context, IMapper mapper) : INotificationService
{
    public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(int userId)
    {
        var notifications = await context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return mapper.Map<IEnumerable<NotificationDto>>(notifications);
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task<NotificationDto?> CreateNotificationAsync(CreateNotificationDto createDto)
    {
        var notification = mapper.Map<Notification>(createDto);

        context.Notifications.Add(notification);
        await context.SaveChangesAsync();

        return mapper.Map<NotificationDto>(notification);
    }

    public async Task<bool> MarkAsReadAsync(int notificationId, int userId)
    {
        var notification = await context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null)
            return false;

        notification.IsRead = true;
        await context.SaveChangesAsync();
        return true;
    }        public async Task<bool> MarkAllAsReadAsync(int userId)
    {
        var notifications = await context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }

        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteNotificationAsync(int notificationId, int userId)
    {
        var notification = await context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null)
            return false;

        context.Notifications.Remove(notification);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteReadNotificationsAsync(int userId)
    {
        var notifications = await context.Notifications
            .Where(n => n.UserId == userId && n.IsRead)
            .ToListAsync();

        context.Notifications.RemoveRange(notifications);
        await context.SaveChangesAsync();
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
    }        public async Task CreateFriendRejectedNotificationAsync(int receiverId, int senderId, string senderUserName)
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

    public async Task CreateReviewCommentNotificationAsync(int reviewOwnerId, int commentAuthorId, string commentAuthorName, string gameTitle, int reviewGameId)
    {
        // Non inviare notifica se l'autore del commento è il proprietario della recensione
        if (reviewOwnerId == commentAuthorId) return;

        var createDto = new CreateNotificationDto
        {
            UserId = reviewOwnerId,
            Type = "review_comment",
            Title = "Nuovo commento alla recensione",
            Message = $"{commentAuthorName} ha commentato la tua recensione di {gameTitle}",
            Data = new
            {
                userId = commentAuthorId,
                userName = commentAuthorName,
                gameTitle,
                reviewGameId
            }
        };

        await CreateNotificationAsync(createDto);
    }

    public async Task CreateActivityReactionNotificationAsync(int activityOwnerId, int reactorId, string reactorName, string emoji, string gameTitle, int activityId)
    {
        // Non inviare notifica se l'utente reagisce alla propria attività
        if (activityOwnerId == reactorId) return;

        var createDto = new CreateNotificationDto
        {
            UserId = activityOwnerId,
            Type = "activity_reaction",
            Title = "Reazione all'attività",
            Message = $"{reactorName} ha reagito {emoji} alla tua attività su {gameTitle}",
            Data = new
            {
                userId = reactorId,
                userName = reactorName,
                emoji,
                gameTitle,
                activityId
            }
        };

        await CreateNotificationAsync(createDto);
    }


}