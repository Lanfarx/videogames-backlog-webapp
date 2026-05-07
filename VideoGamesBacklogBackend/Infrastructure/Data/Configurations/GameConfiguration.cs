using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VideoGamesBacklogBackend.Entities;

namespace VideoGamesBacklogBackend.Infrastructure.Data.Configurations
{
    public class GameConfiguration : IEntityTypeConfiguration<Game>
    {
        public void Configure(EntityTypeBuilder<Game> builder)
        {
            builder.OwnsOne(g => g.Review);
        }
    }
}
