using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddChatToScriptTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ScriptCommentsId",
                table: "ScriptTransactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ScriptTransactions_ScriptCommentsId",
                table: "ScriptTransactions",
                column: "ScriptCommentsId");

            migrationBuilder.AddForeignKey(
                name: "FK_ScriptTransactions_Chats_ScriptCommentsId",
                table: "ScriptTransactions",
                column: "ScriptCommentsId",
                principalTable: "Chats",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ScriptTransactions_Chats_ScriptCommentsId",
                table: "ScriptTransactions");

            migrationBuilder.DropIndex(
                name: "IX_ScriptTransactions_ScriptCommentsId",
                table: "ScriptTransactions");

            migrationBuilder.DropColumn(
                name: "ScriptCommentsId",
                table: "ScriptTransactions");
        }
    }
}
