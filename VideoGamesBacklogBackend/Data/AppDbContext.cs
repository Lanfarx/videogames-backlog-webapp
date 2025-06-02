using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Models;

namespace VideoGamesBacklogBackend.Data
{
    public class AppDbContext : IdentityDbContext<User, IdentityRole<int>, int>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Game> Games { get; set; }
        public DbSet<GameComment> GameComments { get; set; }
        public DbSet<Activity> Activities { get; set; }
        // DbSet<User> non serve, gestito da IdentityDbContext<User,...>
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Per supportare array di stringhe (Genres) con Npgsql
            builder.Entity<Game>()
                .Property(g => g.Genres)
                .HasColumnType("text[]");

            builder.Entity<User>(user =>
            {
                user.OwnsOne(u => u.PrivacySettings);
                user.OwnsOne(u => u.AppPreferences);            });
            // GameReview come owned type
            builder.Entity<Game>().OwnsOne(g => g.Review);            // Configurazione relazione Activity -> Game
            builder.Entity<Activity>()
                .HasOne(a => a.Game)
                .WithMany(g => g.Activities)
                .HasForeignKey(a => a.GameId)
                .OnDelete(DeleteBehavior.Cascade);

        }
    }
}
