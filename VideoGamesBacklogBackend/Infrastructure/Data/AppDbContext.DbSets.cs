using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Entities;

namespace VideoGamesBacklogBackend.Infrastructure.Data;

public partial class AppDbContext
{
    public DbSet<Game> Games { get; set; }
    public DbSet<GameComment> GameComments { get; set; }
    public DbSet<ReviewComment> ReviewComments { get; set; }
    public DbSet<Activity> Activities { get; set; }
    public DbSet<ActivityComment> ActivityComments { get; set; }
    public DbSet<ActivityReaction> ActivityReactions { get; set; }
    public DbSet<Friendship> Friendships { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Wishlist> Wishlists { get; set; }
}