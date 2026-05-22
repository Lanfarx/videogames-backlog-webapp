using AutoMapper;
using JetBrains.Annotations;
using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Common.Helpers;
using VideoGamesBacklogBackend.DTOs.Wishlist;
using VideoGamesBacklogBackend.Infrastructure.Data;
using VideoGamesBacklogBackend.Interfaces.Wishlist;

namespace VideoGamesBacklogBackend.Services.Wishlist;

[UsedImplicitly]
public class WishlistService(AppDbContext context, IMapper mapper) : IWishlistService
{
    public async Task<List<WishlistDto>> GetUserWishlistAsync(int userId)
    {
        var wishlistItems = await context.Wishlists
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.AddedDate)
            .ToListAsync();

        return mapper.Map<List<WishlistDto>>(wishlistItems);
    }

    public async Task<WishlistDto> AddToWishlistAsync(int userId, AddToWishlistDto dto)
    {
        // Verifica se il gioco è già nella wishlist usando GameTitleMatcher
        var existingWishlistItems = await context.Wishlists
            .Where(w => w.UserId == userId)
            .ToListAsync();

        var existingItem = GameTitleMatcher.FindMatchingGame(existingWishlistItems, w => w.Title, dto.Title);

        if (existingItem != null)
            throw new ArgumentException("Il gioco è già nella tua wishlist.");

        // Verifica se il gioco è già nella libreria usando GameTitleMatcher
        var existingLibraryGames = await context.Games
            .Where(g => g.UserId == userId)
            .ToListAsync();

        var existingInLibrary = GameTitleMatcher.FindMatchingGame(existingLibraryGames, g => g.Title, dto.Title);

        if (existingInLibrary != null)
            throw new ArgumentException("Il gioco è già nella tua libreria.");

        var wishlistItem = mapper.Map<Entities.Wishlist>(dto);
        wishlistItem.UserId = userId;

        context.Wishlists.Add(wishlistItem);
        await context.SaveChangesAsync();

        return mapper.Map<WishlistDto>(wishlistItem);
    }

    public async Task<bool> RemoveFromWishlistAsync(int userId, int wishlistId)
    {
        var wishlistItem = await context.Wishlists
            .FirstOrDefaultAsync(w => w.Id == wishlistId && w.UserId == userId);

        if (wishlistItem == null)
            throw new KeyNotFoundException("Elemento non trovato nella wishlist.");

        context.Wishlists.Remove(wishlistItem);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<WishlistDto> UpdateWishlistNotesAsync(int userId, int wishlistId, UpdateWishlistNotesDto dto)
    {
        var wishlistItem = await context.Wishlists
            .FirstOrDefaultAsync(w => w.Id == wishlistId && w.UserId == userId);

        if (wishlistItem == null)
            throw new KeyNotFoundException("Elemento non trovato nella wishlist.");

        wishlistItem.Notes = dto.Notes;
        await context.SaveChangesAsync();

        return mapper.Map<WishlistDto>(wishlistItem);
    }

    public async Task<bool> IsGameInWishlistAsync(int userId, string gameTitle)
    {
        var wishlistItems = await context.Wishlists
            .Where(w => w.UserId == userId)
            .ToListAsync();

        var matchingItem = GameTitleMatcher.FindMatchingGame(wishlistItems, w => w.Title, gameTitle);
        return matchingItem != null;
    }

    public async Task<WishlistDto> RemoveFromWishlistForPurchaseAsync(int userId, int wishlistId)
    {
        var wishlistItem = await context.Wishlists
            .FirstOrDefaultAsync(w => w.Id == wishlistId && w.UserId == userId);

        if (wishlistItem == null)
            throw new KeyNotFoundException("Elemento non trovato nella wishlist.");

        // Crea il DTO con le informazioni del gioco da restituire al frontend
        var wishlistDto = mapper.Map<WishlistDto>(wishlistItem);

        // Rimuovi dalla wishlist
        context.Wishlists.Remove(wishlistItem);
        await context.SaveChangesAsync();

        return wishlistDto;
    }
}