using AutoMapper;
using JetBrains.Annotations;
using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Common.Helpers;
using VideoGamesBacklogBackend.DTOs.Wishlist;
using VideoGamesBacklogBackend.Infrastructure.Data;
using VideoGamesBacklogBackend.Interfaces.Wishlist;
using VideoGamesBacklogBackend.Common.Extensions;

namespace VideoGamesBacklogBackend.Services.Wishlist;

[UsedImplicitly]
public class WishlistService(AppDbContext context, IMapper mapper) : IWishlistService
{
    public async Task<List<WishlistDto>> GetUserWishlistAsync(int userId)
    {
        var wishlistItems = await context.Wishlists
            .AsNoTracking()
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.AddedDate)
            .ToListAsync();

        return mapper.Map<List<WishlistDto>>(wishlistItems);
    }

    public async Task<WishlistDto> AddToWishlistAsync(int userId, AddToWishlistDto dto)
    {
        var normalizedTitle = GameTitleMatcher.GetFullyNormalizedTitle(dto.Title);

        var existingInWishlist = await context.Wishlists
            .AnyAsync(w => w.UserId == userId && w.NormalizedTitle == normalizedTitle);

        if (existingInWishlist)
            throw new ArgumentException("Il gioco è già nella tua wishlist.");

        var existingInLibrary = await context.Games
            .AnyAsync(g => g.UserId == userId && g.NormalizedTitle == normalizedTitle);

        if (existingInLibrary)
            throw new ArgumentException("Il gioco è già nella tua libreria.");

        var wishlistItem = mapper.Map<Entities.Wishlist>(dto);
        wishlistItem.UserId = userId;
        wishlistItem.CoverImage = ImageUrlHelper.EncodeImageUrl(wishlistItem.CoverImage);
        wishlistItem.NormalizedTitle = normalizedTitle;

        context.Wishlists.Add(wishlistItem);
        await context.SaveChangesAsync();

        return mapper.Map<WishlistDto>(wishlistItem);
    }

    public async Task<bool> RemoveFromWishlistAsync(int userId, int wishlistId)
    {
        var wishlistItem = await context.Wishlists.GetByIdAndUserOrThrowAsync(wishlistId, userId);

        context.Wishlists.Remove(wishlistItem);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<WishlistDto> UpdateWishlistNotesAsync(int userId, int wishlistId, UpdateWishlistNotesDto dto)
    {
        var wishlistItem = await context.Wishlists.GetByIdAndUserOrThrowAsync(wishlistId, userId);

        wishlistItem.Notes = dto.Notes;
        await context.SaveChangesAsync();

        return mapper.Map<WishlistDto>(wishlistItem);
    }

    public async Task<bool> IsGameInWishlistAsync(int userId, string gameTitle)
    {
        var normalizedTitle = GameTitleMatcher.GetFullyNormalizedTitle(gameTitle);
        return await context.Wishlists
            .AnyAsync(w => w.UserId == userId && w.NormalizedTitle == normalizedTitle);
    }

    public async Task<WishlistDto> RemoveFromWishlistForPurchaseAsync(int userId, int wishlistId)
    {
        var wishlistItem = await context.Wishlists.GetByIdAndUserOrThrowAsync(wishlistId, userId);

        // Crea il DTO con le informazioni del gioco da restituire al frontend
        var wishlistDto = mapper.Map<WishlistDto>(wishlistItem);

        // Rimuovi dalla wishlist
        context.Wishlists.Remove(wishlistItem);
        await context.SaveChangesAsync();

        return wishlistDto;
    }
}