using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VideoGamesBacklogBackend.Migrations
{
    /// <inheritdoc />
    public partial class OptimizeImageUrls : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE ""Games"" SET ""CoverImage"" = REPLACE(""CoverImage"", 'https://media.rawg.io/', 'rawg:');
                UPDATE ""Games"" SET ""CoverImage"" = REPLACE(""CoverImage"", 'https://shared.akamai.steamstatic.com/', 'steam:');

                UPDATE ""Wishlists"" SET ""CoverImage"" = REPLACE(""CoverImage"", 'https://media.rawg.io/', 'rawg:');
                UPDATE ""Wishlists"" SET ""CoverImage"" = REPLACE(""CoverImage"", 'https://shared.akamai.steamstatic.com/', 'steam:');
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE ""Games"" SET ""CoverImage"" = REPLACE(""CoverImage"", 'rawg:', 'https://media.rawg.io/');
                UPDATE ""Games"" SET ""CoverImage"" = REPLACE(""CoverImage"", 'steam:', 'https://shared.akamai.steamstatic.com/');

                UPDATE ""Wishlists"" SET ""CoverImage"" = REPLACE(""CoverImage"", 'rawg:', 'https://media.rawg.io/');
                UPDATE ""Wishlists"" SET ""CoverImage"" = REPLACE(""CoverImage"", 'steam:', 'https://shared.akamai.steamstatic.com/');
            ");
        }
    }
}
