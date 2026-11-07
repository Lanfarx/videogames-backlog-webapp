using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VideoGamesBacklogBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSteamAppId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SteamAppId",
                table: "Games",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SteamAppId",
                table: "Games");
        }
    }
}
