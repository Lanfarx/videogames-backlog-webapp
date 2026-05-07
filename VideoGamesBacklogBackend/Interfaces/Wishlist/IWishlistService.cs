using VideoGamesBacklogBackend.DTOs.Wishlist;

namespace VideoGamesBacklogBackend.Interfaces.Wishlist
{
    public interface IWishlistService
    {
        Task<List<WishlistDto>> GetUserWishlistAsync(int userId);
        Task<WishlistDto> AddToWishlistAsync(int userId, AddToWishlistDto dto);
        Task<bool> RemoveFromWishlistAsync(int userId, int wishlistId);
        Task<WishlistDto> UpdateWishlistNotesAsync(int userId, int wishlistId, UpdateWishlistNotesDto dto);
        Task<bool> IsGameInWishlistAsync(int userId, string gameTitle);
        Task<WishlistDto> RemoveFromWishlistForPurchaseAsync(int userId, int wishlistId);
    }
}
