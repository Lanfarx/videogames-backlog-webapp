using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Models.auth;
using VideoGamesBacklogBackend.Helpers;
using VideoGamesBacklogBackend.Models;
using VideoGamesBacklogBackend.Data;
using Microsoft.EntityFrameworkCore;

namespace VideoGamesBacklogBackend.Services
{    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _dbContext;
        private readonly IEmailService _emailService;       
        public AuthService(UserManager<User> userManager, SignInManager<User> signInManager, IConfiguration configuration, AppDbContext dbContext, IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _dbContext = dbContext;
            _emailService = emailService;
        }
        public async Task<IdentityResult> RegisterAsync(RegisterModel model)
        {
            try
            {
                var user = new User
                {
                    UserName = model.UserName,
                    Email = model.Email,
                    Tags = model.Tags,
                    MemberSince = DateTime.UtcNow
                };

                var result = await _userManager.CreateAsync(user, model.Password);
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
            User? user = null;

            // Prova a trovare per email
            user = await _userManager.FindByEmailAsync(model.Identifier);

            // Se non trovato, prova per UserName
            if (user == null)
                user = await _userManager.FindByNameAsync(model.Identifier);

            if (user == null) return null;

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!result.Succeeded) return null;

            return GenerateJwtToken(user);
        }

        public async Task<User?> GetCurrentUserAsync(ClaimsPrincipal user)
        {
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return null;
            return await _userManager.FindByIdAsync(userId);
        }        public async Task<bool> ForgotPasswordAsync(ForgotPasswordModel model)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                {
                    // Non rivelare se l'email esiste o meno per motivi di sicurezza
                    // Restituiamo sempre true per non far capire se l'email esiste
                    return true;
                }

                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                
                // Invia l'email di reset password
                var emailSent = await _emailService.SendPasswordResetEmailAsync(user, token);
                
                if (!emailSent)
                {
                    Console.WriteLine($"Errore nell'invio dell'email per {user.Email}. Token di fallback: {token}");
                }
                
                return true; // Restituiamo sempre true per sicurezza
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ForgotPasswordAsync: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordModel model)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null) return false;

                var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);
                return result.Succeeded;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ResetPasswordAsync: {ex.Message}");
                return false;
            }
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings").Get<JwtSettings>();            var claims = new[]
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
}
