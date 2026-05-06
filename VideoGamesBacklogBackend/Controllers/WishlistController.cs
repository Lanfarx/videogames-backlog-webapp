using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Helpers;

namespace VideoGamesBacklogBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WishlistController(IWishlistService wishlistService) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<WishlistDto>>> GetWishlist()
        {
            var wishlist = await wishlistService.GetUserWishlistAsync(User.GetUserId());
            return Ok(wishlist);
        }

        [HttpPost]
        public async Task<ActionResult<WishlistDto>> AddToWishlist([FromBody] AddToWishlistDto dto)
        {
            var result = await wishlistService.AddToWishlistAsync(User.GetUserId(), dto);
            return CreatedAtAction(nameof(GetWishlist), new { id = result.Id }, result);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> RemoveFromWishlist(int id)
        {
            await wishlistService.RemoveFromWishlistAsync(User.GetUserId(), id);
            return NoContent();
        }

        [HttpPut("{id:int}/notes")]
        public async Task<ActionResult<WishlistDto>> UpdateNotes(int id, [FromBody] UpdateWishlistNotesDto dto)
        {
            var result = await wishlistService.UpdateWishlistNotesAsync(User.GetUserId(), id, dto);
            return Ok(result);
        }

        [HttpGet("check/{title}")]
        public async Task<ActionResult<bool>> CheckGameInWishlist(string title)
        {
            var result = await wishlistService.IsGameInWishlistAsync(User.GetUserId(), title);
            return Ok(result);
        }

        [HttpPost("{id:int}/move-to-library")]
        public async Task<ActionResult<WishlistDto>> MoveToLibrary(int id)
        {
            var result = await wishlistService.RemoveFromWishlistForPurchaseAsync(User.GetUserId(), id);
            return Ok(result);
        }
    }
}
