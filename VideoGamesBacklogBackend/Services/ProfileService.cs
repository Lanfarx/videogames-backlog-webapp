using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VideoGamesBacklogBackend.Data;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Models;

namespace VideoGamesBacklogBackend.Services
{
    public class ProfileService : IProfileService
    {
        private readonly AppDbContext _dbContext;
        private readonly UserManager<User> _userManager;
        public ProfileService(AppDbContext dbContext, UserManager<User> userManager)
        {
            _dbContext = dbContext;
            _userManager = userManager;
        }

        public async Task<User?> GetProfileAsync(ClaimsPrincipal userClaims)
        {
            var userId = userClaims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Id.ToString() == userId);
        }

        public async Task<User?> UpdateProfileAsync(ClaimsPrincipal userClaims, User updated)
        {
            var userId = userClaims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id.ToString() == userId);
            if (user == null) return null;
            user.FullName = updated.FullName;
            user.Bio = updated.Bio;
            user.Avatar = updated.Avatar;
            user.Tags = updated.Tags;
            user.PrivacySettings = updated.PrivacySettings;
            user.steamId = updated.steamId;
            user.AppPreferences = updated.AppPreferences;
            await _dbContext.SaveChangesAsync();
            return user;
        }

        public async Task<bool> ChangePasswordAsync(ClaimsPrincipal userClaims, string currentPassword, string newPassword)
        {
            var userId = userClaims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id.ToString() == userId);
            if (user == null) return false;
            var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
            return result.Succeeded;
        }
    }
}
