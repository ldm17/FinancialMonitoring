using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinancialMonitoringMVC.Migrations
{
    /// <inheritdoc />
    public partial class AddIsTransactionTimeZoneVisibleFieldToUserSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsTransactionTimeZoneVisible",
                table: "UserSettings",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsTransactionTimeZoneVisible",
                table: "UserSettings");
        }
    }
}
