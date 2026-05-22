using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoGamesBacklogBackend.Common.Extensions;
using VideoGamesBacklogBackend.DTOs.Users;
using VideoGamesBacklogBackend.Interfaces.Profiles;

namespace VideoGamesBacklogBackend.Controllers.Profiles;

[ApiController]
[Route("api/[controller]")]
[Authorize]    
public class ProfileController(IProfileService profileService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        var user = await profileService.GetProfileAsync(User.GetUserId());
        return Ok(user);
    }        
        
    [HttpPut]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile([FromBody] UpdateProfileDto updated)
    {
        var user = await profileService.UpdateProfileAsync(User.GetUserId(), updated);
        return Ok(user);
    }        
        
    [HttpPost("ChangePassword")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        await profileService.ChangePasswordAsync(User.GetUserId(), req.CurrentPassword, req.NewPassword);
        return Ok();
    }        
        
    [HttpGet("avatar/{username}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetUserAvatar(string username)
    {
        var avatar = await profileService.GetUserAvatarAsync(username);

        if (avatar == null)
        {
            return NotFound(new { message = "Utente non trovato o avatar non impostato." });
        }

        return Ok(new { avatar });
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}