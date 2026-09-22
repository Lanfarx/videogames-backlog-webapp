using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VideoGamesBacklogBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveHowLongToBeatFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HltbCompletionist",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "HltbMainExtra",
                table: "Games");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "HltbCompletionist",
                table: "Games",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "HltbMainExtra",
                table: "Games",
                type: "double precision",
                nullable: true);
        }
    }
}
