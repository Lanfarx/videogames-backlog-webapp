using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Models;
using VideoGamesBacklogBackend.Models.auth;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterModel model)
    {
        try
        {
            var result = await _authService.RegisterAsync(model);
            
            if (result.Succeeded) 
            {
                return Ok();
            }
            
            return BadRequest(result.Errors);
        }
        catch (Exception ex)
        {
            throw;
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        var token = await _authService.LoginAsync(model);
        if (token == null) return Unauthorized();
        return Ok(new { token });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var user = await _authService.GetCurrentUserAsync(User);
        if (user == null) return NotFound();
        return Ok(new { userId = user.Id, email = user.Email, username = user.UserName });
    }
}
