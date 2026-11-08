using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VideoGamesBacklogBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ActivitiesOutliveGames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Activities_Games_GameId",
                table: "Activities");

            migrationBuilder.AlterColumn<int>(
                name: "GameId",
                table: "Activities",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "Source",
                table: "Activities",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Activities",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Finora il proprietario si ricavava dal gioco: le attività esistenti lo prendono da lì prima di diventare indipendenti
            migrationBuilder.Sql(@"
                UPDATE ""Activities"" a
                SET ""UserId"" = g.""UserId""
                FROM ""Games"" g
                WHERE a.""GameId"" = g.""Id"";");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_UserId",
                table: "Activities",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Activities_AspNetUsers_UserId",
                table: "Activities",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Activities_Games_GameId",
                table: "Activities",
                column: "GameId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Activities_AspNetUsers_UserId",
                table: "Activities");

            migrationBuilder.DropForeignKey(
                name: "FK_Activities_Games_GameId",
                table: "Activities");

            migrationBuilder.DropIndex(
                name: "IX_Activities_UserId",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "Source",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Activities");

            migrationBuilder.AlterColumn<int>(
                name: "GameId",
                table: "Activities",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Activities_Games_GameId",
                table: "Activities",
                column: "GameId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
