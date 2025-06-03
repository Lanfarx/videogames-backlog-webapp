using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VideoGamesBacklogBackend.Data;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Models;

namespace VideoGamesBacklogBackend.Services
{    public class FriendshipService : IFriendshipService
    {
        private readonly AppDbContext _context;
        private readonly IGameService _gameService;
        private readonly INotificationService _notificationService;

        public FriendshipService(AppDbContext context, IGameService gameService, INotificationService notificationService)
        {
            _context = context;
            _gameService = gameService;
            _notificationService = notificationService;
        }

        private int GetUserId(ClaimsPrincipal userClaims)
        {
            var userIdString = userClaims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdString ?? "0");
        }

        public async Task<bool> SendFriendRequestAsync(ClaimsPrincipal userClaims, string targetUserName)
        {
            var senderId = GetUserId(userClaims);
            var targetUser = await _context.Users.FirstOrDefaultAsync(u => u.UserName == targetUserName);
            
            if (targetUser == null || targetUser.Id == senderId)
                return false;

            // Controlla se l'utente target accetta richieste di amicizia
            if (!targetUser.PrivacySettings.FriendRequests)
                return false;

            // Controlla se esiste già una richiesta o amicizia
            var existingFriendship = await _context.Friendships
                .FirstOrDefaultAsync(f => 
                    (f.SenderId == senderId && f.ReceiverId == targetUser.Id) ||
                    (f.SenderId == targetUser.Id && f.ReceiverId == senderId));

            if (existingFriendship != null)
                return false;            var friendship = new Friendship
            {
                SenderId = senderId,
                ReceiverId = targetUser.Id,
                Status = FriendshipStatus.Pending
            };

            _context.Friendships.Add(friendship);
            await _context.SaveChangesAsync();

            // Ottieni il nome utente del mittente per la notifica
            var senderUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == senderId);
            if (senderUser != null)
            {
                // Crea notifica per il destinatario
                await _notificationService.CreateFriendRequestNotificationAsync(
                    targetUser.Id, 
                    senderId, 
                    senderUser.UserName ?? "",
                    friendship.Id
                );
            }

            return true;
        }        public async Task<bool> AcceptFriendRequestAsync(ClaimsPrincipal userClaims, int friendshipId)
        {
            var userId = GetUserId(userClaims);
            var friendship = await _context.Friendships
                .Include(f => f.Sender)
                .Include(f => f.Receiver)
                .FirstOrDefaultAsync(f => f.Id == friendshipId && f.ReceiverId == userId && f.Status == FriendshipStatus.Pending);

            if (friendship == null)
                return false;

            friendship.Status = FriendshipStatus.Accepted;
            friendship.AcceptedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Crea notifica per il mittente della richiesta originale
            await _notificationService.CreateFriendAcceptedNotificationAsync(
                friendship.SenderId,
                userId,
                friendship.Receiver.UserName ?? ""
            );

            return true;
        }        public async Task<bool> RejectFriendRequestAsync(ClaimsPrincipal userClaims, int friendshipId)
        {
            var userId = GetUserId(userClaims);
            var friendship = await _context.Friendships
                .Include(f => f.Sender)
                .Include(f => f.Receiver)
                .FirstOrDefaultAsync(f => f.Id == friendshipId && f.ReceiverId == userId && f.Status == FriendshipStatus.Pending);

            if (friendship == null)
                return false;

            friendship.Status = FriendshipStatus.Rejected;
            await _context.SaveChangesAsync();

            // Crea notifica per il mittente della richiesta originale
            await _notificationService.CreateFriendRejectedNotificationAsync(
                friendship.SenderId,
                userId,
                friendship.Receiver.UserName ?? ""
            );

            return true;
        }

        public async Task<bool> RemoveFriendAsync(ClaimsPrincipal userClaims, int friendUserId)
        {
            var userId = GetUserId(userClaims);
            var friendship = await _context.Friendships
                .FirstOrDefaultAsync(f => 
                    ((f.SenderId == userId && f.ReceiverId == friendUserId) ||
                     (f.SenderId == friendUserId && f.ReceiverId == userId)) &&
                    f.Status == FriendshipStatus.Accepted);

            if (friendship == null)
                return false;

            _context.Friendships.Remove(friendship);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> BlockUserAsync(ClaimsPrincipal userClaims, int targetUserId)
        {
            var userId = GetUserId(userClaims);
            
            // Rimuovi qualsiasi amicizia esistente
            var existingFriendship = await _context.Friendships
                .FirstOrDefaultAsync(f => 
                    (f.SenderId == userId && f.ReceiverId == targetUserId) ||
                    (f.SenderId == targetUserId && f.ReceiverId == userId));

            if (existingFriendship != null)
            {
                _context.Friendships.Remove(existingFriendship);
            }

            // Crea un nuovo record di blocco
            var blockFriendship = new Friendship
            {
                SenderId = userId,
                ReceiverId = targetUserId,
                Status = FriendshipStatus.Blocked
            };

            _context.Friendships.Add(blockFriendship);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<FriendshipDto>> GetPendingFriendRequestsAsync(ClaimsPrincipal userClaims)
        {
            var userId = GetUserId(userClaims);
            
            return await _context.Friendships
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

        public async Task<List<FriendshipDto>> GetSentFriendRequestsAsync(ClaimsPrincipal userClaims)
        {
            var userId = GetUserId(userClaims);
            
            return await _context.Friendships
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

        public async Task<List<FriendDto>> GetFriendsAsync(ClaimsPrincipal userClaims)
        {
            var userId = GetUserId(userClaims);
            
            var friendships = await _context.Friendships
                .Include(f => f.Sender)
                .Include(f => f.Receiver)
                .Where(f => 
                    (f.SenderId == userId || f.ReceiverId == userId) && 
                    f.Status == FriendshipStatus.Accepted)
                .ToListAsync();

            var friends = new List<FriendDto>();
            
            foreach (var friendship in friendships)
            {
                var friend = friendship.SenderId == userId ? friendship.Receiver : friendship.Sender;
                friends.Add(new FriendDto
                {
                    UserId = friend.Id,
                    UserName = friend.UserName ?? "",
                    FullName = friend.FullName,
                    Avatar = friend.Avatar,
                    Bio = friend.Bio,
                    MemberSince = friend.MemberSince
                });
            }

            return friends;
        }

        public async Task<List<PublicProfileDto>> SearchUsersAsync(ClaimsPrincipal userClaims, string searchQuery)
        {
            var userId = GetUserId(userClaims);
            
            if (string.IsNullOrWhiteSpace(searchQuery) || searchQuery.Length < 2)
                return new List<PublicProfileDto>();

            var users = await _context.Users
                .Where(u => u.Id != userId && 
                           (u.UserName!.Contains(searchQuery) || 
                            (u.FullName != null && u.FullName.Contains(searchQuery))))
                .Take(20)
                .ToListAsync();

            var result = new List<PublicProfileDto>();
            
            foreach (var user in users)
            {
                var friendship = await _context.Friendships
                    .FirstOrDefaultAsync(f => 
                        (f.SenderId == userId && f.ReceiverId == user.Id) ||
                        (f.SenderId == user.Id && f.ReceiverId == userId));

                var profile = new PublicProfileDto
                {
                    UserId = user.Id,
                    UserName = user.UserName ?? "",
                    FullName = user.FullName,
                    Avatar = user.Avatar,
                    Bio = user.Bio,
                    MemberSince = user.MemberSince,
                    Tags = user.Tags?.Split(',', StringSplitOptions.RemoveEmptyEntries),
                    IsProfilePrivate = user.PrivacySettings.IsPrivate,
                    CanViewStats = !user.PrivacySettings.IsPrivate && user.PrivacySettings.ShowStats,
                    CanViewDiary = !user.PrivacySettings.IsPrivate && user.PrivacySettings.ShowDiary,
                    AcceptsFriendRequests = user.PrivacySettings.FriendRequests,
                    FriendshipStatus = friendship?.Status.ToString(),
                    IsFriend = friendship?.Status == FriendshipStatus.Accepted
                };

                result.Add(profile);
            }

            return result;
        }

        public async Task<PublicProfileDto?> GetPublicProfileAsync(ClaimsPrincipal userClaims, string userName)
        {
            var userId = GetUserId(userClaims);
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserName == userName);

            if (user == null)
                return null;

            var friendship = await _context.Friendships
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
                Avatar = user.Avatar,
                Bio = user.Bio,
                MemberSince = user.MemberSince,
                Tags = user.Tags?.Split(',', StringSplitOptions.RemoveEmptyEntries),
                IsProfilePrivate = user.PrivacySettings.IsPrivate,
                CanViewStats = (!user.PrivacySettings.IsPrivate && user.PrivacySettings.ShowStats) || canViewPrivateContent,
                CanViewDiary = (!user.PrivacySettings.IsPrivate && user.PrivacySettings.ShowDiary) || canViewPrivateContent,
                AcceptsFriendRequests = user.PrivacySettings.FriendRequests,
                FriendshipStatus = friendship?.Status.ToString(),
                IsFriend = isFriend
            };

            // Aggiungi statistiche se visibili
            if (profile.CanViewStats)
            {
                profile.Stats = await _gameService.GetUserStatsAsync(user.Id);
            }

            return profile;
        }
    }
}
