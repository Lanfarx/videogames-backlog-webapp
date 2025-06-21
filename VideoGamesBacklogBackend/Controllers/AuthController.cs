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
        Console.WriteLine($"🔄 [Register] Starting registration for: {model.Email}");
        
        try
        {
            Console.WriteLine($"🔄 [Register] Calling AuthService.RegisterAsync...");
            var result = await _authService.RegisterAsync(model);
            
            Console.WriteLine($"🔄 [Register] AuthService returned. Succeeded: {result.Succeeded}");
            
            if (result.Succeeded) 
            {
                Console.WriteLine($"✅ [Register] Registration successful for: {model.Email}");
                return Ok();
            }
            
            Console.WriteLine($"❌ [Register] Registration failed for: {model.Email}. Errors: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            return BadRequest(result.Errors);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ [Register] Exception occurred: {ex.Message}");
            Console.WriteLine($"❌ [Register] Stack trace: {ex.StackTrace}");
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
