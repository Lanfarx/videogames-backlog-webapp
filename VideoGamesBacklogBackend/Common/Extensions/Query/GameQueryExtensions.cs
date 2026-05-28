using VideoGamesBacklogBackend.DTOs.Games;
using VideoGamesBacklogBackend.Entities;

namespace VideoGamesBacklogBackend.Common.Extensions.Query;

public static class GameQueryExtensions
{
    public static IQueryable<Game> ApplySearch(this IQueryable<Game> query, string? search)
    {
        if (string.IsNullOrEmpty(search)) return query;
        
        var searchLower = search.ToLower();
        return query.Where(g =>
            g.Title.ToLower().Contains(searchLower) ||
            (g.Developer != null && g.Developer.ToLower().Contains(searchLower)) ||
            (g.Publisher != null && g.Publisher.ToLower().Contains(searchLower)) ||
            g.Genres.Any(genre => genre.ToLower().Contains(searchLower))
        );
    }

    public static IQueryable<Game> ApplyFilters(this IQueryable<Game> query, GameFiltersDto? filters)
    {
        if (filters == null) return query;

        if (filters.Status?.Count > 0)
            query = query.Where(g => filters.Status.Contains(g.Status));

        if (filters.Platform?.Count > 0)
            query = query.Where(g => g.Platform != null && filters.Platform.Contains(g.Platform));

        if (filters.Genre?.Count > 0)
            query = query.Where(g => g.Genres.Any(genre => filters.Genre.Contains(genre)));

        if (filters.PriceRange?.Length == 2)
        {
            var minPrice = filters.PriceRange[0];
            var maxPrice = filters.PriceRange[1];
            query = query.Where(g => g.Price == null || g.Price == -1 || (g.Price >= minPrice && g.Price <= maxPrice));
        }

        if (filters.HoursRange?.Length == 2)
        {
            var minHours = filters.HoursRange[0];
            var maxHours = filters.HoursRange[1];
            query = query.Where(g => g.HoursPlayed >= minHours && g.HoursPlayed <= maxHours);
        }

        if (filters.MetacriticRange?.Length == 2)
        {
            var minMetacritic = filters.MetacriticRange[0];
            var maxMetacritic = filters.MetacriticRange[1];
            query = query.Where(g => g.Metacritic == null || (g.Metacritic >= minMetacritic && g.Metacritic <= maxMetacritic));
        }

        if (string.IsNullOrEmpty(filters.PurchaseDate)) return query;
        {
            if (DateOnly.TryParse(filters.PurchaseDate, out var parsedDate))
            {
                query = query.Where(g => g.PurchaseDate == parsedDate);
            }
        }

        return query;
    }

    public static IQueryable<Game> ApplySorting(this IQueryable<Game> query, string? sortBy, string? sortOrder)
    {
        if (string.IsNullOrEmpty(sortBy))
        {
            return query.OrderBy(g => g.Title).ThenBy(g => g.Id);
        }

        var isAscending = sortOrder?.ToLower() != "desc";

        return sortBy.ToLower() switch
        {
            "title" => isAscending ? query.OrderBy(g => g.Title).ThenBy(g => g.Id) : query.OrderByDescending(g => g.Title).ThenBy(g => g.Id),
            "releasedate" => isAscending ? query.OrderBy(g => g.ReleaseYear).ThenBy(g => g.Id) : query.OrderByDescending(g => g.ReleaseYear).ThenBy(g => g.Id),
            "hoursplayed" => isAscending ? query.OrderBy(g => g.HoursPlayed).ThenBy(g => g.Id) : query.OrderByDescending(g => g.HoursPlayed).ThenBy(g => g.Id),
            "rating" => isAscending ? query.OrderBy(g => g.Rating).ThenBy(g => g.Id) : query.OrderByDescending(g => g.Rating).ThenBy(g => g.Id),
            "metacritic" => isAscending ? query.OrderBy(g => g.Metacritic).ThenBy(g => g.Id) : query.OrderByDescending(g => g.Metacritic).ThenBy(g => g.Id),
            "price" => isAscending ? query.OrderBy(g => g.Price).ThenBy(g => g.Id) : query.OrderByDescending(g => g.Price).ThenBy(g => g.Id),
            "purchasedate" => isAscending ? query.OrderBy(g => g.PurchaseDate).ThenBy(g => g.Id) : query.OrderByDescending(g => g.PurchaseDate).ThenBy(g => g.Id),
            _ => query.OrderBy(g => g.Title).ThenBy(g => g.Id)
        };
    }
}
