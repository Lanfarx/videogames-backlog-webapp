using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Entities;

namespace VideoGamesBacklogBackend.Common.Extensions;

public static class DbContextExtensions
{
    /// <summary>
    /// Recupera un'entità per Id e verifica che appartenga all'utente specificato.
    /// Lancia KeyNotFoundException se non trovata o se non appartenente all'utente.
    /// </summary>
    public static async Task<T> GetByIdAndUserOrThrowAsync<T>(
        this DbSet<T> dbSet, 
        int id, 
        int userId, 
        Func<IQueryable<T>, IQueryable<T>>? include = null) 
        where T : class, IUserOwnedEntity
    {
        var query = dbSet.AsQueryable();
        
        if (include != null)
        {
            query = include(query);
        }

        var entity = await query.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
        
        return entity ?? throw new KeyNotFoundException("Entità non trovata.");
    }
}
