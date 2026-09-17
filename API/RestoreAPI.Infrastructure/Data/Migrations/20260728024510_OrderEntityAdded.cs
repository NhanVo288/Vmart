using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestoreAPI.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class OrderEntityAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_UserAddress_AddressId",
                table: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "UserAddress");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_AddressId",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "AddressId",
                table: "AspNetUsers",
                newName: "Address_Id");

            migrationBuilder.AddColumn<string>(
                name: "Address_Address_City",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address_Address_Country",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address_Address_Line1",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address_Address_Line2",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address_Address_Name",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address_Address_PostalCode",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address_Address_State",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address_Address_City",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Address_Address_Country",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Address_Address_Line1",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Address_Address_Line2",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Address_Address_Name",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Address_Address_PostalCode",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Address_Address_State",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "Address_Id",
                table: "AspNetUsers",
                newName: "AddressId");

            migrationBuilder.CreateTable(
                name: "UserAddress",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Address_City = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address_Country = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address_Line1 = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address_Line2 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address_Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address_PostalCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address_State = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAddress", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_AddressId",
                table: "AspNetUsers",
                column: "AddressId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_UserAddress_AddressId",
                table: "AspNetUsers",
                column: "AddressId",
                principalTable: "UserAddress",
                principalColumn: "Id");
        }
    }
}
