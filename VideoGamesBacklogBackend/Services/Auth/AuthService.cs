using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using VideoGamesBacklogBackend.Common.Configuration;
using VideoGamesBacklogBackend.Common.DTOs.Auth;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.Interfaces.Auth;
using VideoGamesBacklogBackend.Interfaces.Common;

namespace VideoGamesBacklogBackend.Services.Auth;

public class AuthService(
    UserManager<User> userManager,
    SignInManager<User> signInManager,
    IConfiguration configuration,
    IEmailService emailService,
    IMapper mapper,
    ILogger<AuthService> logger)
    : IAuthService
{

    public async Task<IdentityResult> RegisterAsync(RegisterModel model)
    {
        try
        {
            var user = mapper.Map<User>(model);

            var result = await userManager.CreateAsync(user, model.Password);
            return result;
        }
        catch (Exception ex)
        {
            return IdentityResult.Failed(new IdentityError 
            { 
                Description = $"Registration failed: {ex.Message}" 
            });
        }
    }

    public async Task<string?> LoginAsync(LoginModel model)
    {
        var user =
            // Prova a trovare per email
            // Se non trovato, prova per UserName
            await userManager.FindByEmailAsync(model.Identifier) ?? await userManager.FindByNameAsync(model.Identifier);

        if (user == null) return null;

        var result = await signInManager.CheckPasswordSignInAsync(user, model.Password, false);
        return !result.Succeeded ? null : GenerateJwtToken(user);
    }

    public async Task<User?> GetCurrentUserAsync(int userId)
    {
        return await userManager.FindByIdAsync(userId.ToString());
    }        public async Task<bool> ForgotPasswordAsync(ForgotPasswordModel model)
    {
        var user = await userManager.FindByEmailAsync(model.Email);
        if (user == null)
        {
            // Non rivelare se l'email esiste o meno per motivi di sicurezza
            return true;
        }

        var token = await userManager.GeneratePasswordResetTokenAsync(user);
            
        var emailSent = await emailService.SendPasswordResetEmailAsync(user, token);
            
        if (!emailSent)
        {
            logger.LogWarning("Errore nell'invio dell'email di reset per {Email}", user.Email);
        }
            
        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordModel model)
    {
        var user = await userManager.FindByEmailAsync(model.Email);
        if (user == null) return false;

        var result = await userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);
        return result.Succeeded;
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = configuration.GetSection("JwtSettings").Get<JwtSettings>();            var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()), 
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings?.SecretKey ?? throw new InvalidOperationException("JWT SecretKey not configured")));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtSettings.Issuer,
            audience: jwtSettings.Audience,
            claims: claims,
            expires: DateTime.Now.AddMinutes(jwtSettings.ExpiryMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}