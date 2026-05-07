using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.DTOs.Social;
using VideoGamesBacklogBackend.Common.DTOs.Pagination;
using VideoGamesBacklogBackend.Common.Extensions;
using VideoGamesBacklogBackend.Infrastructure.Data;
using VideoGamesBacklogBackend.Interfaces.Games;
using VideoGamesBacklogBackend.Interfaces.Social;

namespace VideoGamesBacklogBackend.Services.Social
{
    public class FriendshipService(
        AppDbContext context,
        IGameStatsService gameStatsService,
        INotificationService notificationService)
        : IFriendshipService
    {
        public async Task<bool> SendFriendRequestAsync(int userId, string targetUserName)
        {
            var targetUser = await context.Users.FirstOrDefaultAsync(u => u.UserName == targetUserName);

            if (targetUser == null) throw new KeyNotFoundException("Utente non trovato.");
            if (targetUser.Id == userId) throw new ArgumentException("Non puoi inviare una richiesta a te stesso.");
            if (!targetUser.PrivacySettings.FriendRequests) throw new ArgumentException("Questo utente non accetta richieste di amicizia.");

            var existingFriendship = await context.Friendships
                .FirstOrDefaultAsync(f =>
                    (f.SenderId == userId && f.ReceiverId == targetUser.Id) ||
                    (f.SenderId == targetUser.Id && f.ReceiverId == userId));

            if (existingFriendship != null)
            {
                if (existingFriendship.Status == FriendshipStatus.Rejected)
                {
                    context.Friendships.Remove(existingFriendship);
                    await context.SaveChangesAsync();
                }
                else
                {
                    throw new ArgumentException("Richiesta di amicizia già inviata o siete già amici.");
                }
            }

            var friendship = new Friendship
            {
                SenderId = userId,
                ReceiverId = targetUser.Id,
                Status = FriendshipStatus.Pending
            };

            context.Friendships.Add(friendship);
            await context.SaveChangesAsync();

            var senderUser = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (senderUser != null)
            {
                await notificationService.CreateFriendRequestNotificationAsync(
                    targetUser.Id,
                    userId,
                    senderUser.UserName ?? "",
                    friendship.Id
                );
            }

            return true;
        }

        public async Task<bool> AcceptFriendRequestAsync(int userId, int friendshipId)
        {
            var friendship = await context.Friendships
                .Include(f => f.Sender)
                .Include(f => f.Receiver)
                .FirstOrDefaultAsync(f =>
                    f.Id == friendshipId && f.ReceiverId == userId && f.Status == FriendshipStatus.Pending);

            if (friendship == null) throw new KeyNotFoundException("Richiesta di amicizia non trovata o non valida.");

            friendship.Status = FriendshipStatus.Accepted;
            friendship.AcceptedAt = DateTime.UtcNow;
            await context.SaveChangesAsync();

            await notificationService.CreateFriendAcceptedNotificationAsync(
                friendship.SenderId,
                userId,
                friendship.Receiver.UserName ?? ""
            );

            return true;
        }

        public async Task<bool> RejectFriendRequestAsync(int userId, int friendshipId)
        {
            var friendship = await context.Friendships
                .Include(f => f.Sender)
                .Include(f => f.Receiver)
                .FirstOrDefaultAsync(f =>
                    f.Id == friendshipId && f.ReceiverId == userId && f.Status == FriendshipStatus.Pending);

            if (friendship == null) throw new KeyNotFoundException("Richiesta di amicizia non trovata o non valida.");

            friendship.Status = FriendshipStatus.Rejected;
            await context.SaveChangesAsync();

            await notificationService.CreateFriendRejectedNotificationAsync(
                friendship.SenderId,
                userId,
                friendship.Receiver.UserName ?? ""
            );

            return true;
        }

        public async Task<bool> RemoveFriendAsync(int userId, int friendUserId)
        {
            var friendship = await context.Friendships
                .FirstOrDefaultAsync(f =>
                    ((f.SenderId == userId && f.ReceiverId == friendUserId) ||
                     (f.SenderId == friendUserId && f.ReceiverId == userId)) &&
                    f.Status == FriendshipStatus.Accepted);

            if (friendship == null) throw new KeyNotFoundException("Amicizia non trovata.");

            context.Friendships.Remove(friendship);
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> BlockUserAsync(int userId, int targetUserId)
        {
            var existingFriendship = await context.Friendships
                .FirstOrDefaultAsync(f =>
                    (f.SenderId == userId && f.ReceiverId == targetUserId) ||
                    (f.SenderId == targetUserId && f.ReceiverId == userId));

            if (existingFriendship != null)
            {
                if (existingFriendship.Status == FriendshipStatus.Blocked && existingFriendship.SenderId == userId)
                {
                    context.Friendships.Remove(existingFriendship);
                    await context.SaveChangesAsync();
                    return true;
                }

                context.Friendships.Remove(existingFriendship);
                await context.SaveChangesAsync();
            }

            var blockFriendship = new Friendship
            {
                SenderId = userId,
                ReceiverId = targetUserId,
                Status = FriendshipStatus.Blocked
            };

            context.Friendships.Add(blockFriendship);
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<List<FriendshipDto>> GetPendingFriendRequestsAsync(int userId)
        {
            return await context.Friendships
                .Include(f => f.Sender)
                .Where(f => f.ReceiverId == userId && f.Status == FriendshipStatus.Pending)
                .Select(f => new FriendshipDto
                {
                    Id = f.Id,
                    SenderId = f.SenderId,
                    ReceiverId = f.ReceiverId,
                    SenderUserName = f.Sender.UserName ?? "",
                    SenderFullName = f.Sender.FullName ?? "",
                    SenderAvatar = f.Sender.Avatar,
                    Status = f.Status.ToString(),
                    CreatedAt = f.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<List<FriendshipDto>> GetSentFriendRequestsAsync(int userId)
        {
            return await context.Friendships
                .Include(f => f.Receiver)
                .Where(f => f.SenderId == userId && f.Status == FriendshipStatus.Pending)
                .Select(f => new FriendshipDto
                {
                    Id = f.Id,
                    SenderId = f.SenderId,
                    ReceiverId = f.ReceiverId,
                    ReceiverUserName = f.Receiver.UserName ?? "",
                    ReceiverFullName = f.Receiver.FullName ?? "",
                    ReceiverAvatar = f.Receiver.Avatar,
                    Status = f.Status.ToString(),
                    CreatedAt = f.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<List<FriendDto>> GetFriendsAsync(int userId)
        {
            var friendships = await context.Friendships
                .Include(f => f.Sender)
                .Include(f => f.Receiver)
                .Where(f =>
                    (f.SenderId == userId || f.ReceiverId == userId) &&
                    f.Status == FriendshipStatus.Accepted)
                .ToListAsync();

            return friendships.Select(friendship =>
                    friendship.SenderId == userId ? friendship.Receiver : friendship.Sender)
                .Select(friend => new FriendDto
                {
                    UserId = friend.Id,
                    UserName = friend.UserName ?? "",
                    FullName = friend.FullName,
                    Avatar = friend.Avatar,
                    Bio = friend.Bio,
                    MemberSince = friend.MemberSince
                })
                .ToList();
        }

        public async Task<PaginatedResult<PublicProfileDto>> SearchUsersAsync(int userId, string searchQuery,
            PaginationQueryParameters queryParams)
        {
            if (string.IsNullOrWhiteSpace(searchQuery) || searchQuery.Length < 2)
            {
                return new PaginatedResult<PublicProfileDto>
                {
                    Items = [],
                    TotalItems = 0,
                    CurrentPage = queryParams.Page,
                    TotalPages = 0,
                    PageSize = queryParams.PageSize
                };
            }

            var queryable = context.Users
                .Where(u => u.Id != userId &&
                            (u.UserName!.Contains(searchQuery) ||
                             (u.FullName != null && u.FullName.Contains(searchQuery))));

            var result = await queryable.OrderBy(u => u.UserName).PaginateAsync(queryParams);

            var profiles = new List<PublicProfileDto>();
            foreach (var user in result.Items)
            {
                var friendship = await context.Friendships
                    .FirstOrDefaultAsync(f =>
                        (f.SenderId == userId && f.ReceiverId == user.Id) ||
                        (f.SenderId == user.Id && f.ReceiverId == userId));
                var profile = new PublicProfileDto
                {
                    UserId = user.Id,
                    UserName = user.UserName ?? "", FullName = user.FullName,
                    Avatar = user.Avatar,
                    Bio = user.Bio,
                    MemberSince = user.MemberSince,
                    Tags = user.Tags?.Split(',', StringSplitOptions.RemoveEmptyEntries),
                    IsProfilePrivate = user.PrivacySettings.IsPrivate,
                    CanViewStats = user.PrivacySettings is { IsPrivate: false, ShowStats: true },
                    CanViewDiary = user.PrivacySettings is { IsPrivate: false, ShowDiary: true },
                    AcceptsFriendRequests = user.PrivacySettings.FriendRequests,
                    FriendshipId = friendship?.Id,
                    FriendshipStatus = friendship?.Status.ToString(),
                    IsFriend = friendship?.Status == FriendshipStatus.Accepted,
                    IsRequestSender = friendship?.SenderId == userId
                };
                profiles.Add(profile);
            }

            return new PaginatedResult<PublicProfileDto>
            {
                Items = profiles,
                TotalItems = result.TotalItems,
                CurrentPage = result.CurrentPage,
                TotalPages = result.TotalPages,
                PageSize = result.PageSize
            };
        }

        public async Task<PublicProfileDto> GetPublicProfileAsync(int userId, string userName)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.UserName == userName);

            if (user == null) throw new KeyNotFoundException("Utente non trovato.");

            var friendship = await context.Friendships
                .FirstOrDefaultAsync(f =>
                    (f.SenderId == userId && f.ReceiverId == user.Id) ||
                    (f.SenderId == user.Id && f.ReceiverId == userId));

            var isFriend = friendship?.Status == FriendshipStatus.Accepted;
            var canViewPrivateContent = user.Id == userId || isFriend;
            var profile = new PublicProfileDto
            {
                UserId = user.Id,
                UserName = user.UserName ?? "",
                FullName = user.FullName,
                Avatar = user.Avatar, Bio = user.Bio,
                MemberSince = user.MemberSince,
                Tags = user.Tags?.Split(',', StringSplitOptions.RemoveEmptyEntries),
                IsProfilePrivate = user.PrivacySettings.IsPrivate,
                CanViewStats = user.PrivacySettings is { IsPrivate: false, ShowStats: true } || canViewPrivateContent,
                CanViewDiary = user.PrivacySettings is { IsPrivate: false, ShowDiary: true } || canViewPrivateContent,
                AcceptsFriendRequests = user.PrivacySettings.FriendRequests,
                FriendshipId = friendship?.Id,
                FriendshipStatus = friendship?.Status.ToString(),
                IsFriend = isFriend,
                IsRequestSender = friendship?.SenderId == userId
            };

            if (profile.CanViewStats)
            {
                profile.Stats = await gameStatsService.GetUserStatsAsync(user.Id);
            }

            return profile;
        }

        public async Task<bool> AreUsersFriendsAsync(int userId1, int userId2)
        {
            return await context.Friendships
                .AnyAsync(f =>
                    ((f.SenderId == userId1 && f.ReceiverId == userId2) ||
                     (f.SenderId == userId2 && f.ReceiverId == userId1)) &&
                    f.Status == FriendshipStatus.Accepted);
        }
    }
}