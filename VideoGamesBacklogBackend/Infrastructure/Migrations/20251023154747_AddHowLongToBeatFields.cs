using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VideoGamesBacklogBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddHowLongToBeatFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HltbCompletionist",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "HltbMainExtra",
                table: "Games");
        }
    }
}
