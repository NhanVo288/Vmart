using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestoreAPI.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddressEntityCleanedUp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address_Id",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "Address_Address_State",
                table: "AspNetUsers",
                newName: "Address_State");

            migrationBuilder.RenameColumn(
                name: "Address_Address_PostalCode",
                table: "AspNetUsers",
                newName: "Address_PostalCode");

            migrationBuilder.RenameColumn(
                name: "Address_Address_Name",
                table: "AspNetUsers",
                newName: "Address_Name");

            migrationBuilder.RenameColumn(
                name: "Address_Address_Line2",
                table: "AspNetUsers",
                newName: "Address_Line2");

            migrationBuilder.RenameColumn(
                name: "Address_Address_Line1",
                table: "AspNetUsers",
                newName: "Address_Line1");

            migrationBuilder.RenameColumn(
                name: "Address_Address_Country",
                table: "AspNetUsers",
                newName: "Address_Country");

            migrationBuilder.RenameColumn(
                name: "Address_Address_City",
                table: "AspNetUsers",
                newName: "Address_City");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Address_State",
                table: "AspNetUsers",
                newName: "Address_Address_State");

            migrationBuilder.RenameColumn(
                name: "Address_PostalCode",
                table: "AspNetUsers",
                newName: "Address_Address_PostalCode");

            migrationBuilder.RenameColumn(
                name: "Address_Name",
                table: "AspNetUsers",
                newName: "Address_Address_Name");

            migrationBuilder.RenameColumn(
                name: "Address_Line2",
                table: "AspNetUsers",
                newName: "Address_Address_Line2");

            migrationBuilder.RenameColumn(
                name: "Address_Line1",
                table: "AspNetUsers",
                newName: "Address_Address_Line1");

            migrationBuilder.RenameColumn(
                name: "Address_Country",
                table: "AspNetUsers",
                newName: "Address_Address_Country");

            migrationBuilder.RenameColumn(
                name: "Address_City",
                table: "AspNetUsers",
                newName: "Address_Address_City");

            migrationBuilder.AddColumn<int>(
                name: "Address_Id",
                table: "AspNetUsers",
                type: "int",
                nullable: true);
        }
    }
}
