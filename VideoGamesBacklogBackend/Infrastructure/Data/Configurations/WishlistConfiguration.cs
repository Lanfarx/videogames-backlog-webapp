using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.Common.Helpers;

namespace VideoGamesBacklogBackend.Infrastructure.Data.Configurations;

public class WishlistConfiguration : IEntityTypeConfiguration<Wishlist>
{
    public void Configure(EntityTypeBuilder<Wishlist> builder)
    {
        builder.HasIndex(w => w.NormalizedTitle);
        builder.Property(w => w.CoverImage)
            .HasConversion(
                v => ImageUrlHelper.EncodeImageUrl(v),
                v => ImageUrlHelper.DecodeImageUrl(v)
            );
    }
}
