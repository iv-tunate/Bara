using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bara.API.DataContext.Migrations
{
    /// <inheritdoc />
    public partial class IncludePremiumPropertyToScript : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPremiumScript",
                table: "Scripts",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPremiumScript",
                table: "Scripts");
        }
    }
}
