using System.Security.Claims;
using VideoGamesBacklogBackend.Models;

namespace VideoGamesBacklogBackend.Interfaces
{
    public interface IProfileService
    {
        Task<User?> GetProfileAsync(ClaimsPrincipal userClaims);
        Task<User?> UpdateProfileAsync(ClaimsPrincipal userClaims, User updated);
        Task<bool> ChangePasswordAsync(ClaimsPrincipal userClaims, string currentPassword, string newPassword);
    }
}
