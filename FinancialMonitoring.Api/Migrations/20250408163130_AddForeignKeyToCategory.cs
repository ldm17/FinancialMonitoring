using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinancialMonitoring.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddForeignKeyToCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_Categories_CategoryId",
                table: "Expenses");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_CategoryId",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Expenses");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Categories_Id_OperationType",
                table: "Categories",
                columns: new[] { "Id", "OperationType" });

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_IdCategory_OperationType",
                table: "Expenses",
                columns: new[] { "IdCategory", "OperationType" });

            migrationBuilder.AddForeignKey(
                name: "FK_Expenses_Categories_IdCategory_OperationType",
                table: "Expenses",
                columns: new[] { "IdCategory", "OperationType" },
                principalTable: "Categories",
                principalColumns: new[] { "Id", "OperationType" },
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_Categories_IdCategory_OperationType",
                table: "Expenses");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_IdCategory_OperationType",
                table: "Expenses");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Categories_Id_OperationType",
                table: "Categories");

            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "Expenses",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CategoryId",
                table: "Expenses",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Expenses_Categories_CategoryId",
                table: "Expenses",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id");
        }
    }
}
