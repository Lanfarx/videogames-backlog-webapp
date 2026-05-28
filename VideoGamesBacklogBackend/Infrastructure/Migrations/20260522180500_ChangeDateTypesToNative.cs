using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VideoGamesBacklogBackend.Migrations
{
    /// <inheritdoc />
    public partial class ChangeDateTypesToNative : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""Wishlists"" ALTER COLUMN ""AddedDate"" TYPE date USING NULLIF(""AddedDate"", '')::date;
                ALTER TABLE ""ReviewComments"" ALTER COLUMN ""Date"" TYPE timestamp with time zone USING NULLIF(""Date"", '')::timestamp with time zone;
                ALTER TABLE ""Games"" ALTER COLUMN ""Review_Date"" TYPE timestamp with time zone USING NULLIF(""Review_Date"", '')::timestamp with time zone;
                ALTER TABLE ""Games"" ALTER COLUMN ""PurchaseDate"" TYPE date USING NULLIF(""PurchaseDate"", '')::date;
                ALTER TABLE ""Games"" ALTER COLUMN ""PlatinumDate"" TYPE date USING NULLIF(""PlatinumDate"", '')::date;
                ALTER TABLE ""Games"" ALTER COLUMN ""CompletionDate"" TYPE date USING NULLIF(""CompletionDate"", '')::date;
                ALTER TABLE ""GameComments"" ALTER COLUMN ""Date"" TYPE timestamp with time zone USING NULLIF(""Date"", '')::timestamp with time zone;
                ALTER TABLE ""ActivityComments"" ALTER COLUMN ""Date"" TYPE timestamp with time zone USING NULLIF(""Date"", '')::timestamp with time zone;
            ");

            migrationBuilder.AlterColumn<DateOnly>(
                name: "AddedDate",
                table: "Wishlists",
                type: "date",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                table: "ReviewComments",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Review_Date",
                table: "Games",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "PurchaseDate",
                table: "Games",
                type: "date",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "PlatinumDate",
                table: "Games",
                type: "date",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "CompletionDate",
                table: "Games",
                type: "date",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                table: "GameComments",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                table: "ActivityComments",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""Wishlists"" ALTER COLUMN ""AddedDate"" TYPE text USING ""AddedDate""::text;
                ALTER TABLE ""ReviewComments"" ALTER COLUMN ""Date"" TYPE text USING ""Date""::text;
                ALTER TABLE ""Games"" ALTER COLUMN ""Review_Date"" TYPE text USING ""Review_Date""::text;
                ALTER TABLE ""Games"" ALTER COLUMN ""PurchaseDate"" TYPE text USING ""PurchaseDate""::text;
                ALTER TABLE ""Games"" ALTER COLUMN ""PlatinumDate"" TYPE text USING ""PlatinumDate""::text;
                ALTER TABLE ""Games"" ALTER COLUMN ""CompletionDate"" TYPE text USING ""CompletionDate""::text;
                ALTER TABLE ""GameComments"" ALTER COLUMN ""Date"" TYPE text USING ""Date""::text;
                ALTER TABLE ""ActivityComments"" ALTER COLUMN ""Date"" TYPE text USING ""Date""::text;
            ");

            migrationBuilder.AlterColumn<string>(
                name: "AddedDate",
                table: "Wishlists",
                type: "text",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.AlterColumn<string>(
                name: "Date",
                table: "ReviewComments",
                type: "text",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<string>(
                name: "Review_Date",
                table: "Games",
                type: "text",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PurchaseDate",
                table: "Games",
                type: "text",
                nullable: true,
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PlatinumDate",
                table: "Games",
                type: "text",
                nullable: true,
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CompletionDate",
                table: "Games",
                type: "text",
                nullable: true,
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Date",
                table: "GameComments",
                type: "text",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<string>(
                name: "Date",
                table: "ActivityComments",
                type: "text",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");
        }
    }
}
