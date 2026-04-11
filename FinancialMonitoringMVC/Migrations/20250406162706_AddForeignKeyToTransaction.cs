using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinancialMonitoringMVC.Migrations
{
    /// <inheritdoc />
    public partial class AddForeignKeyToTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Expenses_WalletId",
                table: "Expenses",
                column: "WalletId");

            migrationBuilder.AddForeignKey(
                name: "FK_Expenses_Wallets_WalletId",
                table: "Expenses",
                column: "WalletId",
                principalTable: "Wallets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_Wallets_WalletId",
                table: "Expenses");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_WalletId",
                table: "Expenses");
        }
    }
}
