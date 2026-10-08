using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinancialMonitoring.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAccessTokenJtiFieldToRefreshToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AccessTokenJti",
                table: "RefreshTokens",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccessTokenJti",
                table: "RefreshTokens");
        }
    }
}
