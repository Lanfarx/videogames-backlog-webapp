using VideoGamesBacklogBackend.DTOs.Users;

namespace VideoGamesBacklogBackend.Interfaces.Profiles;

public interface IProfileService
{
    Task<UserProfileDto> GetProfileAsync(int userId);
    Task<UserProfileDto> UpdateProfileAsync(int userId, UpdateProfileDto updated);
    Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
    Task<string?> GetUserAvatarAsync(string username);
}