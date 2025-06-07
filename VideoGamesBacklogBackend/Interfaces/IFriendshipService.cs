using System.Security.Claims;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Models;

namespace VideoGamesBacklogBackend.Interfaces
{
    public interface IFriendshipService
    {
        // Gestione richieste di amicizia
        Task<bool> SendFriendRequestAsync(ClaimsPrincipal userClaims, string targetUserName);
        Task<bool> AcceptFriendRequestAsync(ClaimsPrincipal userClaims, int friendshipId);
        Task<bool> RejectFriendRequestAsync(ClaimsPrincipal userClaims, int friendshipId);
        Task<bool> RemoveFriendAsync(ClaimsPrincipal userClaims, int friendUserId);
        Task<bool> BlockUserAsync(ClaimsPrincipal userClaims, int targetUserId);
        
        // Recupero dati amicizie
        Task<List<FriendshipDto>> GetPendingFriendRequestsAsync(ClaimsPrincipal userClaims);
        Task<List<FriendshipDto>> GetSentFriendRequestsAsync(ClaimsPrincipal userClaims);
        Task<List<FriendDto>> GetFriendsAsync(ClaimsPrincipal userClaims);
        
        // Ricerca utenti e profili pubblici
        Task<PaginatedUsersDto> SearchUsersAsync(ClaimsPrincipal userClaims, string searchQuery, int page, int pageSize);
        Task<PublicProfileDto?> GetPublicProfileAsync(ClaimsPrincipal userClaims, string userName);
    }
}
