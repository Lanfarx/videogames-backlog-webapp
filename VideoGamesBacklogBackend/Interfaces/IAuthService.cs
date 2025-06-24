using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using VideoGamesBacklogBackend.Models;
using VideoGamesBacklogBackend.Models.auth;

namespace VideoGamesBacklogBackend.Interfaces
{
    public interface IAuthService
    {
        Task<IdentityResult> RegisterAsync(RegisterModel model);
        Task<string?> LoginAsync(LoginModel model);
        Task<User?> GetCurrentUserAsync(ClaimsPrincipal user);
        Task<bool> ForgotPasswordAsync(ForgotPasswordModel model);
        Task<bool> ResetPasswordAsync(ResetPasswordModel model);
    }
}
