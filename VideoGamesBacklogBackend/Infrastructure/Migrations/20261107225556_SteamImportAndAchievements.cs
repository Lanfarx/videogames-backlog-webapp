using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VideoGamesBacklogBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SteamImportAndAchievements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AchievementsTotal",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AchievementsUnlocked",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AddedAt",
                table: "Games",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "now()");

            // Giochi esistenti: prima attività "Aggiunto" (Type 2), altrimenti la data d'acquisto, che per gli import Steam era il giorno dell'import
            migrationBuilder.Sql(@"
                UPDATE ""Games"" g SET ""AddedAt"" = COALESCE(
                    (SELECT MIN(a.""Timestamp"") FROM ""Activities"" a WHERE a.""GameId"" = g.""Id"" AND a.""Type"" = 2),
                    g.""PurchaseDate""::timestamp AT TIME ZONE 'UTC',
                    now());");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastPlayedAt",
                table: "Games",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSteamSyncAt",
                table: "AspNetUsers",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AchievementsTotal",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "AchievementsUnlocked",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "AddedAt",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "LastPlayedAt",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "LastSteamSyncAt",
                table: "AspNetUsers");
        }
    }
}
