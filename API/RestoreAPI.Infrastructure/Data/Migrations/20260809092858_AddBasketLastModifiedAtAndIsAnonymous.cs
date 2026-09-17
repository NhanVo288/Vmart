using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestoreAPI.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBasketLastModifiedAtAndIsAnonymous : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAnonymous",
                table: "Baskets",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModifiedAt",
                table: "Baskets",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc));

            // Backfill IsAnonymous for existing rows
            migrationBuilder.Sql("""
                UPDATE Baskets
                SET IsAnonymous =
                    CASE
                        WHEN BuyerId LIKE 'anon_%' THEN 1
                        ELSE 0
                    END
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAnonymous",
                table: "Baskets");

            migrationBuilder.DropColumn(
                name: "LastModifiedAt",
                table: "Baskets");
        }
    }
}
