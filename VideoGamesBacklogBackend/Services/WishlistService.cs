using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Data;
using VideoGamesBacklogBackend.Dto;
using VideoGamesBacklogBackend.Helpers;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Models;

namespace VideoGamesBacklogBackend.Services
{
    public class WishlistService : IWishlistService
    {
        private readonly AppDbContext _context;

        public WishlistService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<WishlistDto>> GetUserWishlistAsync(int userId)
        {
            var wishlistItems = await _context.Wishlists
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.AddedDate)
                .ToListAsync();            return wishlistItems.Select(w => new WishlistDto
            {
                Id = w.Id,
                Title = w.Title,
                CoverImage = w.CoverImage,
                ReleaseYear = w.ReleaseYear,
                Genres = w.Genres,
                Metacritic = w.Metacritic,
                AddedDate = w.AddedDate,
                RawgId = w.RawgId,
                Notes = w.Notes,
                UserId = w.UserId
            }).ToList();
        }        public async Task<WishlistDto?> AddToWishlistAsync(int userId, AddToWishlistDto dto)
        {
            // Verifica se il gioco è già nella wishlist usando GameTitleMatcher
            var existingWishlistItems = await _context.Wishlists
                .Where(w => w.UserId == userId)
                .ToListAsync();

            var existingItem = GameTitleMatcher.FindMatchingGame(existingWishlistItems, w => w.Title, dto.Title);

            if (existingItem != null)
            {
                return null; // Gioco già in wishlist
            }

            // Verifica se il gioco è già nella libreria usando GameTitleMatcher
            var existingLibraryGames = await _context.Games
                .Where(g => g.UserId == userId)
                .ToListAsync();

            var existingInLibrary = GameTitleMatcher.FindMatchingGame(existingLibraryGames, g => g.Title, dto.Title);

            if (existingInLibrary != null)
            {
                return null; // Gioco già nella libreria
            }var wishlistItem = new Wishlist
            {
                Title = dto.Title,
                CoverImage = dto.CoverImage,
                ReleaseYear = dto.ReleaseYear,
                Genres = dto.Genres,
                Metacritic = dto.Metacritic,
                RawgId = dto.RawgId,
                Notes = dto.Notes,
                UserId = userId,
                AddedDate = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };            _context.Wishlists.Add(wishlistItem);
            await _context.SaveChangesAsync();

            return new WishlistDto
            {
                Id = wishlistItem.Id,
                Title = wishlistItem.Title,
                CoverImage = wishlistItem.CoverImage,
                ReleaseYear = wishlistItem.ReleaseYear,
                Genres = wishlistItem.Genres,
                Metacritic = wishlistItem.Metacritic,
                AddedDate = wishlistItem.AddedDate,
                RawgId = wishlistItem.RawgId,
                Notes = wishlistItem.Notes,
                UserId = wishlistItem.UserId
            };
        }

        public async Task<bool> RemoveFromWishlistAsync(int userId, int wishlistId)
        {
            var wishlistItem = await _context.Wishlists
                .FirstOrDefaultAsync(w => w.Id == wishlistId && w.UserId == userId);

            if (wishlistItem == null)
            {
                return false;
            }

            _context.Wishlists.Remove(wishlistItem);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<WishlistDto?> UpdateWishlistNotesAsync(int userId, int wishlistId, UpdateWishlistNotesDto dto)
        {
            var wishlistItem = await _context.Wishlists
                .FirstOrDefaultAsync(w => w.Id == wishlistId && w.UserId == userId);

            if (wishlistItem == null)
            {
                return null;
            }            wishlistItem.Notes = dto.Notes;
            await _context.SaveChangesAsync();

            return new WishlistDto
            {
                Id = wishlistItem.Id,
                Title = wishlistItem.Title,
                CoverImage = wishlistItem.CoverImage,
                ReleaseYear = wishlistItem.ReleaseYear,
                Genres = wishlistItem.Genres,
                Metacritic = wishlistItem.Metacritic,
                AddedDate = wishlistItem.AddedDate,
                RawgId = wishlistItem.RawgId,
                Notes = wishlistItem.Notes,
                UserId = wishlistItem.UserId
            };
        }        public async Task<bool> IsGameInWishlistAsync(int userId, string gameTitle)
        {
            var wishlistItems = await _context.Wishlists
                .Where(w => w.UserId == userId)
                .ToListAsync();

            var matchingItem = GameTitleMatcher.FindMatchingGame(wishlistItems, w => w.Title, gameTitle);
            return matchingItem != null;
        }        public async Task<WishlistDto?> RemoveFromWishlistForPurchaseAsync(int userId, int wishlistId)
        {
            var wishlistItem = await _context.Wishlists
                .FirstOrDefaultAsync(w => w.Id == wishlistId && w.UserId == userId);

            if (wishlistItem == null)
            {
                return null;
            }

            // Crea il DTO con le informazioni del gioco da restituire al frontend
            var wishlistDto = new WishlistDto
            {
                Id = wishlistItem.Id,
                Title = wishlistItem.Title,
                CoverImage = wishlistItem.CoverImage,
                ReleaseYear = wishlistItem.ReleaseYear,
                Genres = wishlistItem.Genres,
                Metacritic = wishlistItem.Metacritic,
                AddedDate = wishlistItem.AddedDate,
                RawgId = wishlistItem.RawgId,
                Notes = wishlistItem.Notes,
                UserId = wishlistItem.UserId
            };

            // Rimuovi dalla wishlist
            _context.Wishlists.Remove(wishlistItem);
            await _context.SaveChangesAsync();

            return wishlistDto;
        }
    }
}
