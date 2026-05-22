using AutoMapper;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.DTOs.Users;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.Infrastructure.Data;
using VideoGamesBacklogBackend.Interfaces.Profiles;

namespace VideoGamesBacklogBackend.Services.Profiles;

[UsedImplicitly]
public class ProfileService(AppDbContext dbContext, UserManager<User> userManager, IMapper mapper)
    : IProfileService
{
    public async Task<UserProfileDto> GetProfileAsync(int userId)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
        return user == null ? throw new KeyNotFoundException("Utente non trovato.") : mapper.Map<UserProfileDto>(user);
    }        
        
    public async Task<UserProfileDto> UpdateProfileAsync(int userId, UpdateProfileDto updated)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) throw new KeyNotFoundException("Utente non trovato.");

        mapper.Map(updated, user);

        await dbContext.SaveChangesAsync();
        return mapper.Map<UserProfileDto>(user);
    }        
        
    public async Task<string?> GetUserAvatarAsync(string username)
    {
        var user = await dbContext.Users
            .Where(u => u.UserName == username)
            .Select(u => new { u.Avatar })
            .FirstOrDefaultAsync();

        return user?.Avatar;
    }        
        
    public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) throw new KeyNotFoundException("Utente non trovato.");
            
        var result = await userManager.ChangePasswordAsync(user, currentPassword, newPassword);

        if (result.Succeeded) return true;
        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
        throw new ArgumentException($"Errore cambio password: {errors}");

    }
}