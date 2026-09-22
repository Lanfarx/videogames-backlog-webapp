using VideoGamesBacklogBackend.Common.DTOs.Pagination;
using VideoGamesBacklogBackend.DTOs.Social;

namespace VideoGamesBacklogBackend.Interfaces.Social;

public interface IFriendshipService
{
    Task<bool> SendFriendRequestAsync(int userId, string targetUserName);
    Task<bool> AcceptFriendRequestAsync(int userId, int friendshipId);
    Task<bool> RejectFriendRequestAsync(int userId, int friendshipId);
    Task<bool> RemoveFriendAsync(int userId, int friendUserId);
    Task<bool> BlockUserAsync(int userId, int targetUserId);
        
    // Recupero dati amicizie
    Task<List<FriendshipDto>> GetPendingFriendRequestsAsync(int userId);
    Task<List<FriendshipDto>> GetSentFriendRequestsAsync(int userId);
    Task<List<FriendDto>> GetFriendsAsync(int userId);
        
    // Ricerca utenti e profili pubblici
    Task<PaginatedResult<PublicProfileDto>> SearchUsersAsync(int userId, string searchQuery, PaginationQueryParameters queryParams);
    Task<PublicProfileDto> GetPublicProfileAsync(int userId, string userName);

    // Utility condivisa per check di amicizia
    Task<bool> AreUsersFriendsAsync(int userId1, int userId2);
}