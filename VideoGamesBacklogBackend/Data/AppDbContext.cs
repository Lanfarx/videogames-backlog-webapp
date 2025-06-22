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
        public DbSet<ReviewComment> ReviewComments { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<ActivityComment> ActivityComments { get; set; }
        public DbSet<ActivityReaction> ActivityReactions { get; set; }
        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Game>()
                .Property(g => g.Genres)
                .HasColumnType("text[]");            builder.Entity<User>(user =>
            {
                user.OwnsOne(u => u.PrivacySettings);
                user.OwnsOne(u => u.AppPreferences);
                // Tags rimane come stringa normale, non array
            });

            builder.Entity<Game>().OwnsOne(g => g.Review);
            builder.Entity<Activity>()
                .HasOne(a => a.Game)
                .WithMany(g => g.Activities)
                .HasForeignKey(a => a.GameId)
                .OnDelete(DeleteBehavior.Cascade);

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

            builder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);            // Configurazione per il campo Data come JSON
            builder.Entity<Notification>()
                .Property(n => n.Data)
                .HasColumnType("jsonb");            // Configurazione delle relazioni per ReviewComment
            builder.Entity<ReviewComment>()
                .HasOne(rc => rc.ReviewGame)
                .WithMany(g => g.ReviewComments)
                .HasForeignKey(rc => rc.ReviewGameId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<ReviewComment>()
                .HasOne(rc => rc.Author)
                .WithMany()
                .HasForeignKey(rc => rc.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);            // Configurazione delle relazioni per ActivityReaction
            builder.Entity<ActivityReaction>()
                .HasOne(ar => ar.Activity)
                .WithMany(a => a.Reactions)
                .HasForeignKey(ar => ar.ActivityId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<ActivityReaction>()
                .HasOne(ar => ar.User)
                .WithMany()
                .HasForeignKey(ar => ar.UserId)
                .OnDelete(DeleteBehavior.Cascade);            // Indice unico per evitare che lo stesso utente metta più volte la stessa reazione alla stessa attività
            builder.Entity<ActivityReaction>()
                .HasIndex(ar => new { ar.ActivityId, ar.UserId, ar.Emoji })
                .IsUnique();

            builder.Entity<ActivityComment>()
                .HasOne(ac => ac.Activity)
                .WithMany(a => a.ActivityComments)
                .HasForeignKey(ac => ac.ActivityId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<ActivityComment>()
                .HasOne(ac => ac.Author)
                .WithMany()
                .HasForeignKey(ac => ac.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);

        }
    }
}
