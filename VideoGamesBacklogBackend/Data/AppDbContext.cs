using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Entities;

namespace VideoGamesBacklogBackend.Data
{
    /// <summary>
    /// Context principale del database.
    /// Utilizza il pattern partial class per separare le proprietà DbSet dalla configurazione del modello.
    /// </summary>
    public partial class AppDbContext(DbContextOptions<AppDbContext> options)
        : IdentityDbContext<User, IdentityRole<int>, int>(options)
    {
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

            foreach (var entityType in builder.Model.GetEntityTypes())
            {
                var clrType = entityType.ClrType;

                if (typeof(IUserOwnedEntity).IsAssignableFrom(clrType))
                {
                    builder.Entity(clrType)
                        .HasOne(nameof(IUserOwnedEntity.User))
                        .WithMany()
                        .HasForeignKey(nameof(IUserOwnedEntity.UserId))
                        .OnDelete(DeleteBehavior.Cascade);
                }

                var genresProp = clrType.GetProperty("Genres");
                if (genresProp != null && genresProp.PropertyType == typeof(string[]))
                {
                    builder.Entity(clrType)
                        .Property("Genres")
                        .HasColumnType("text[]");
                }
            }
        }
    }
}
