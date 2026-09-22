using Microsoft.AspNetCore.Identity;
using VideoGamesBacklogBackend.Common.DTOs.Auth;
using VideoGamesBacklogBackend.Entities;

namespace VideoGamesBacklogBackend.Interfaces.Auth;

public interface IAuthService
{
    Task<IdentityResult> RegisterAsync(RegisterModel model);
    Task<string?> LoginAsync(LoginModel model);
    Task<User?> GetCurrentUserAsync(int userId);
    Task<bool> ForgotPasswordAsync(ForgotPasswordModel model);
    Task<bool> ResetPasswordAsync(ResetPasswordModel model);
}