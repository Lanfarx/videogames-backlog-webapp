using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Interfaces;

namespace VideoGamesBacklogBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;

        public WishlistController(IWishlistService wishlistService)
        {
            _wishlistService = wishlistService;
        }

        [HttpGet]
        public async Task<ActionResult<List<WishlistDto>>> GetWishlist()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid user ID");
            }

            var wishlist = await _wishlistService.GetUserWishlistAsync(userId);
            return Ok(wishlist);
        }

        [HttpPost]
        public async Task<ActionResult<WishlistDto>> AddToWishlist([FromBody] AddToWishlistDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid user ID");
            }

            var result = await _wishlistService.AddToWishlistAsync(userId, dto);
            if (result == null)
            {
                return BadRequest("Il gioco è già nella tua wishlist o libreria");
            }

            return CreatedAtAction(nameof(GetWishlist), new { id = result.Id }, result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> RemoveFromWishlist(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid user ID");
            }

            var result = await _wishlistService.RemoveFromWishlistAsync(userId, id);
            if (!result)
            {
                return NotFound("Elemento non trovato nella wishlist");
            }

            return NoContent();
        }

        [HttpPut("{id}/notes")]
        public async Task<ActionResult<WishlistDto>> UpdateNotes(int id, [FromBody] UpdateWishlistNotesDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid user ID");
            }

            var result = await _wishlistService.UpdateWishlistNotesAsync(userId, id, dto);
            if (result == null)
            {
                return NotFound("Elemento non trovato nella wishlist");
            }

            return Ok(result);
        }

        [HttpGet("check/{title}")]
        public async Task<ActionResult<bool>> CheckGameInWishlist(string title)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid user ID");
            }

            var result = await _wishlistService.IsGameInWishlistAsync(userId, title);
            return Ok(result);
        }        [HttpPost("{id}/move-to-library")]
        public async Task<ActionResult<WishlistDto>> MoveToLibrary(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid user ID");
            }

            var result = await _wishlistService.RemoveFromWishlistForPurchaseAsync(userId, id);
            if (result == null)
            {
                return NotFound("Elemento non trovato nella wishlist");
            }

            return Ok(result);
        }
    }
}
