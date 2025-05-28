using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using VideoGamesBacklogBackend.Models.auth;

namespace VideoGamesBacklogBackend.Interfaces
{
    public interface IAuthService
    {
        Task<IdentityResult> RegisterAsync(RegisterModel model);
        Task<string?> LoginAsync(LoginModel model);
        Task<IdentityUser?> GetCurrentUserAsync(ClaimsPrincipal user);
    }
}
