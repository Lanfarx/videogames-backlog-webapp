using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoGamesBacklogBackend.Services;
using System.Security.Claims;
using VideoGamesBacklogBackend.Data;
using VideoGamesBacklogBackend.Models;
using VideoGamesBacklogBackend.Interfaces;

namespace VideoGamesBacklogBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;

        public ProfileController(IProfileService profileService)
        {
            _profileService = profileService;
        }        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var user = await _profileService.GetProfileAsync(User);
            if (user == null) return NotFound();  
            return Ok(user);
        }        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] User updated)
        {
            var user = await _profileService.UpdateProfileAsync(User, updated);
            if (user == null) return NotFound();
            return Ok(user);
        }        [HttpPost("ChangePassword")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
        {
            var result = await _profileService.ChangePasswordAsync(User, req.CurrentPassword, req.NewPassword);
            if (!result) return BadRequest("Password attuale errata o nuova password non valida.");
            return Ok();
        }

        public class ChangePasswordRequest
        {
            public string CurrentPassword { get; set; } = string.Empty;
            public string NewPassword { get; set; } = string.Empty;
        }
    }
}
