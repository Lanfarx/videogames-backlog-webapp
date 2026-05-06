using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VideoGamesBacklogBackend.Entities;

namespace VideoGamesBacklogBackend.Data.Configurations
{
    public class ActivityReactionConfiguration : IEntityTypeConfiguration<ActivityReaction>
    {
        public void Configure(EntityTypeBuilder<ActivityReaction> builder)
        {
            builder.HasOne(ar => ar.Activity)
                .WithMany(a => a.Reactions)
                .HasForeignKey(ar => ar.ActivityId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ar => ar.User)
                .WithMany()
                .HasForeignKey(ar => ar.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(ar => new { ar.ActivityId, ar.UserId, ar.Emoji })
                .IsUnique();
        }
    }
}
