using Microsoft.AspNetCore.Identity;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.Entities.auth;

namespace VideoGamesBacklogBackend.Interfaces
{
    public interface IAuthService
    {
        Task<IdentityResult> RegisterAsync(RegisterModel model);
        Task<string?> LoginAsync(LoginModel model);
        Task<User?> GetCurrentUserAsync(int userId);
        Task<bool> ForgotPasswordAsync(ForgotPasswordModel model);
        Task<bool> ResetPasswordAsync(ResetPasswordModel model);
    }
}
