using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoGamesBacklogBackend.Common.DTOs.Auth;
using VideoGamesBacklogBackend.Common.Extensions;
using VideoGamesBacklogBackend.Interfaces.Auth;

namespace VideoGamesBacklogBackend.Controllers.Auth;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterModel model)
    {
        var result = await authService.RegisterAsync(model);
            
        if (result.Succeeded) 
        {
            return Ok();
        }
            
        return BadRequest(result.Errors);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        var token = await authService.LoginAsync(model);
        if (token == null) return Unauthorized();
        return Ok(new { token });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordModel model)
    {
        var result = await authService.ForgotPasswordAsync(model);
        if (result)
        {
            return Ok(new { message = "Se l'email è registrata, riceverai un link per il reset della password." });
        }
        return BadRequest(new { message = "Errore durante la richiesta di reset password." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
    {
        var result = await authService.ResetPasswordAsync(model);
        if (result)
        {
            return Ok(new { message = "Password resettata con successo." });
        }
        return BadRequest(new { message = "Token non valido o scaduto." });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var user = await authService.GetCurrentUserAsync(User.GetUserId());
        if (user == null) return NotFound();
        return Ok(new { userId = user.Id, email = user.Email, username = user.UserName });
    }
}