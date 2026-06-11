using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.Common.Helpers;

namespace VideoGamesBacklogBackend.Infrastructure.Data.Configurations;

public class GameConfiguration : IEntityTypeConfiguration<Game>
{
    public void Configure(EntityTypeBuilder<Game> builder)
    {
        builder.OwnsOne(g => g.Review);
        builder.HasIndex(g => g.NormalizedTitle);
        builder.Property(g => g.CoverImage)
            .HasConversion(
                v => ImageUrlHelper.EncodeImageUrl(v),
                v => ImageUrlHelper.DecodeImageUrl(v)
            );
    }
}