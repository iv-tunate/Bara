using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bara.API.DataContext.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanypropertytouser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CompanyOrStudio",
                table: "Users",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompanyOrStudio",
                table: "Users");
        }
    }
}
