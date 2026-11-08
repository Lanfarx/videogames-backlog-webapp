using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VideoGamesBacklogBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DashboardHoursAndYearlyGoal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AppPreferences_YearlyGoal",
                table: "AspNetUsers",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HoursDelta",
                table: "Activities",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Storico: le ore di ogni attività "Played" erano solo nel testo ("3 ore giocate", "iniziato - 1 ora giocata")
            migrationBuilder.Sql(@"
                UPDATE ""Activities""
                SET ""HoursDelta"" = COALESCE(substring(""AdditionalInfo"" from '(-?[0-9]+)[[:space:]]*or[ae]')::int, 0)
                WHERE ""Type"" = 0 AND ""AdditionalInfo"" IS NOT NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AppPreferences_YearlyGoal",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "HoursDelta",
                table: "Activities");
        }
    }
}
