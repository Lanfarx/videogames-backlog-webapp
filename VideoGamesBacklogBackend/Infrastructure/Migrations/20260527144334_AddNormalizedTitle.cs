using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VideoGamesBacklogBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddNormalizedTitle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NormalizedTitle",
                table: "Wishlists",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NormalizedTitle",
                table: "Games",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Wishlists_NormalizedTitle",
                table: "Wishlists",
                column: "NormalizedTitle");

            migrationBuilder.CreateIndex(
                name: "IX_Games_NormalizedTitle",
                table: "Games",
                column: "NormalizedTitle");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Wishlists_NormalizedTitle",
                table: "Wishlists");

            migrationBuilder.DropIndex(
                name: "IX_Games_NormalizedTitle",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "NormalizedTitle",
                table: "Wishlists");

            migrationBuilder.DropColumn(
                name: "NormalizedTitle",
                table: "Games");
        }
    }
}
