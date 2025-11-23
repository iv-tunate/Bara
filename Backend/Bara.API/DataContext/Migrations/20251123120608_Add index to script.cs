using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bara.API.DataContext.Migrations
{
    /// <inheritdoc />
    public partial class Addindextoscript : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Scripts_IsPremiumScript",
                table: "Scripts",
                column: "IsPremiumScript");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Scripts_IsPremiumScript",
                table: "Scripts");
        }
    }
}
