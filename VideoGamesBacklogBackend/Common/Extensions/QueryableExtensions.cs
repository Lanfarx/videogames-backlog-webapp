using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Common.DTOs.Pagination;

namespace VideoGamesBacklogBackend.Common.Extensions;

public static class QueryableExtensions
{
    public static Task<PaginatedResult<T>> PaginateAsync<T>(
        this IQueryable<T> query, PaginationQueryParameters parameters)
    {
        return query.PaginateAsync(parameters.Page, parameters.PageSize);
    }

    public static async Task<PaginatedResult<T>> PaginateAsync<T>(
        this IQueryable<T> query, int page, int pageSize)
    {
        var totalItems = await query.CountAsync();
        var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);
            
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedResult<T>
        {
            Items = items,
            TotalItems = totalItems,
            TotalPages = totalPages,
            CurrentPage = page,
            PageSize = pageSize
        };
    }
}