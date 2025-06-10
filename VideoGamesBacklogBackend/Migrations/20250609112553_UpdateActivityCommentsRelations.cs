using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VideoGamesBacklogBackend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateActivityCommentsRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActivityComment_Activities_ActivityId",
                table: "ActivityComment");

            migrationBuilder.DropForeignKey(
                name: "FK_ActivityComment_AspNetUsers_AuthorId",
                table: "ActivityComment");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ActivityComment",
                table: "ActivityComment");

            migrationBuilder.RenameTable(
                name: "ActivityComment",
                newName: "ActivityComments");

            migrationBuilder.RenameIndex(
                name: "IX_ActivityComment_AuthorId",
                table: "ActivityComments",
                newName: "IX_ActivityComments_AuthorId");

            migrationBuilder.RenameIndex(
                name: "IX_ActivityComment_ActivityId",
                table: "ActivityComments",
                newName: "IX_ActivityComments_ActivityId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ActivityComments",
                table: "ActivityComments",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ActivityComments_Activities_ActivityId",
                table: "ActivityComments",
                column: "ActivityId",
                principalTable: "Activities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ActivityComments_AspNetUsers_AuthorId",
                table: "ActivityComments",
                column: "AuthorId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActivityComments_Activities_ActivityId",
                table: "ActivityComments");

            migrationBuilder.DropForeignKey(
                name: "FK_ActivityComments_AspNetUsers_AuthorId",
                table: "ActivityComments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ActivityComments",
                table: "ActivityComments");

            migrationBuilder.RenameTable(
                name: "ActivityComments",
                newName: "ActivityComment");

            migrationBuilder.RenameIndex(
                name: "IX_ActivityComments_AuthorId",
                table: "ActivityComment",
                newName: "IX_ActivityComment_AuthorId");

            migrationBuilder.RenameIndex(
                name: "IX_ActivityComments_ActivityId",
                table: "ActivityComment",
                newName: "IX_ActivityComment_ActivityId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ActivityComment",
                table: "ActivityComment",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ActivityComment_Activities_ActivityId",
                table: "ActivityComment",
                column: "ActivityId",
                principalTable: "Activities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ActivityComment_AspNetUsers_AuthorId",
                table: "ActivityComment",
                column: "AuthorId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
