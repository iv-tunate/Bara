using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bara.API.DataContext.Migrations
{
    /// <inheritdoc />
    public partial class updatescriptmodel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Image",
                table: "Scripts",
                newName: "ImageUrl");

            migrationBuilder.AddColumn<string>(
                name: "ImagePublicId",
                table: "Scripts",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImagePublicId",
                table: "Scripts");

            migrationBuilder.RenameColumn(
                name: "ImageUrl",
                table: "Scripts",
                newName: "Image");
        }
    }
}
