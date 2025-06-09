using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Services;
using System.Security.Claims;
using VideoGamesBacklogBackend.Data;
using VideoGamesBacklogBackend.Models;
using VideoGamesBacklogBackend.Interfaces;

namespace VideoGamesBacklogBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;
        private readonly AppDbContext _context;

        public ProfileController(IProfileService profileService, AppDbContext context)
        {
            _profileService = profileService;
            _context = context;
        }[HttpGet]
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
        }        [HttpGet("avatar/{username}")]
        public async Task<IActionResult> GetUserAvatar(string username)
        {
            var user = await _context.Users
                .Where(u => u.UserName == username)
                .Select(u => new { u.Avatar })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound("Utente non trovato");
            }

            return Ok(new { avatar = user.Avatar });
        }

        public class ChangePasswordRequest
        {
            public string CurrentPassword { get; set; } = string.Empty;
            public string NewPassword { get; set; } = string.Empty;
        }
    }
}
