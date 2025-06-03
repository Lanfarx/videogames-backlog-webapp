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
        }        public DbSet<Game> Games { get; set; }
        public DbSet<GameComment> GameComments { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<Notification> Notifications { get; set; }
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

            // Configurazione delle relazioni per Friendship
            builder.Entity<Friendship>()
                .HasOne(f => f.Sender)
                .WithMany()
                .HasForeignKey(f => f.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Friendship>()
                .HasOne(f => f.Receiver)
                .WithMany()
                .HasForeignKey(f => f.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);            // Indice unico per evitare richieste di amicizia duplicate
            builder.Entity<Friendship>()
                .HasIndex(f => new { f.SenderId, f.ReceiverId })
                .IsUnique();

            // Configurazione delle relazioni per Notification
            builder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configurazione per il campo Data come JSON
            builder.Entity<Notification>()
                .Property(n => n.Data)
                .HasColumnType("jsonb");

        }
    }
}
