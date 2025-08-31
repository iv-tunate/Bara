using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddScriptTransactionEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TransferCode",
                table: "Transactions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Amount",
                table: "ScriptTransactions",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "Currency",
                table: "ScriptTransactions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ExpiresAt",
                table: "ScriptTransactions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Fee",
                table: "ScriptTransactions",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "IdempotencyKey",
                table: "ScriptTransactions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TransactionStatus",
                table: "ScriptTransactions",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "WriterShare",
                table: "ScriptTransactions",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_ScriptTransactions_IdempotencyKey",
                table: "ScriptTransactions",
                column: "IdempotencyKey");

            migrationBuilder.CreateIndex(
                name: "IX_ScriptTransactions_ProducerId_ScriptId",
                table: "ScriptTransactions",
                columns: new[] { "ProducerId", "ScriptId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ScriptTransactions_IdempotencyKey",
                table: "ScriptTransactions");

            migrationBuilder.DropIndex(
                name: "IX_ScriptTransactions_ProducerId_ScriptId",
                table: "ScriptTransactions");

            migrationBuilder.DropColumn(
                name: "TransferCode",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "Amount",
                table: "ScriptTransactions");

            migrationBuilder.DropColumn(
                name: "Currency",
                table: "ScriptTransactions");

            migrationBuilder.DropColumn(
                name: "ExpiresAt",
                table: "ScriptTransactions");

            migrationBuilder.DropColumn(
                name: "Fee",
                table: "ScriptTransactions");

            migrationBuilder.DropColumn(
                name: "IdempotencyKey",
                table: "ScriptTransactions");

            migrationBuilder.DropColumn(
                name: "TransactionStatus",
                table: "ScriptTransactions");

            migrationBuilder.DropColumn(
                name: "WriterShare",
                table: "ScriptTransactions");
        }
    }
}
