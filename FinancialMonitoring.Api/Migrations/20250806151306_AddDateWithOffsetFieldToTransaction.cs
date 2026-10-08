using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinancialMonitoring.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDateWithOffsetFieldToTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DateWithOffset",
                table: "Transactions",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateWithOffset",
                table: "Transactions");
        }
    }
}
