using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VideoGamesBacklogBackend.Entities;

namespace VideoGamesBacklogBackend.Data.Configurations
{
    public class ActivityCommentConfiguration : IEntityTypeConfiguration<ActivityComment>
    {
        public void Configure(EntityTypeBuilder<ActivityComment> builder)
        {
            builder.HasOne(ac => ac.Activity)
                .WithMany(a => a.ActivityComments)
                .HasForeignKey(ac => ac.ActivityId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ac => ac.Author)
                .WithMany()
                .HasForeignKey(ac => ac.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class ReviewCommentConfiguration : IEntityTypeConfiguration<ReviewComment>
    {
        public void Configure(EntityTypeBuilder<ReviewComment> builder)
        {
            builder.HasOne(rc => rc.ReviewGame)
                .WithMany(g => g.ReviewComments)
                .HasForeignKey(rc => rc.ReviewGameId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(rc => rc.Author)
                .WithMany()
                .HasForeignKey(rc => rc.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
