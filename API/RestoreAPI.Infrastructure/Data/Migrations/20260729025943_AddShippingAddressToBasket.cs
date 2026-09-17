using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestoreAPI.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddShippingAddressToBasket : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ShipCity",
                table: "Baskets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShipCountry",
                table: "Baskets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShipLine1",
                table: "Baskets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShipLine2",
                table: "Baskets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShipName",
                table: "Baskets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShipPostalCode",
                table: "Baskets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShipState",
                table: "Baskets",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShipCity",
                table: "Baskets");

            migrationBuilder.DropColumn(
                name: "ShipCountry",
                table: "Baskets");

            migrationBuilder.DropColumn(
                name: "ShipLine1",
                table: "Baskets");

            migrationBuilder.DropColumn(
                name: "ShipLine2",
                table: "Baskets");

            migrationBuilder.DropColumn(
                name: "ShipName",
                table: "Baskets");

            migrationBuilder.DropColumn(
                name: "ShipPostalCode",
                table: "Baskets");

            migrationBuilder.DropColumn(
                name: "ShipState",
                table: "Baskets");
        }
    }
}
