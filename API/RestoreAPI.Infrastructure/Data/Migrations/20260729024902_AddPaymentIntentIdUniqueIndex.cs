using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestoreAPI.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentIntentIdUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "PaymentIntentId",
                table: "Orders",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_PaymentIntentId",
                table: "Orders",
                column: "PaymentIntentId",
                unique: true,
                filter: "[PaymentIntentId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Orders_PaymentIntentId",
                table: "Orders");

            migrationBuilder.AlterColumn<string>(
                name: "PaymentIntentId",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);
        }
    }
}
