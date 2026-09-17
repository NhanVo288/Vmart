using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestoreAPI.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddressEntityUpdated_v2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF OBJECT_ID('FK_AspNetUsers_Address_AddressId', 'F') IS NOT NULL
                    ALTER TABLE [AspNetUsers] DROP CONSTRAINT [FK_AspNetUsers_Address_AddressId];

                IF OBJECT_ID('Address', 'U') IS NOT NULL
                    DROP TABLE [Address];

                IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Baskets') AND name = 'DeliveryFee')
                    ALTER TABLE [Baskets] ADD [DeliveryFee] bigint NOT NULL DEFAULT 0;

                IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Baskets') AND name = 'Discount')
                    ALTER TABLE [Baskets] ADD [Discount] bigint NOT NULL DEFAULT 0;

                IF OBJECT_ID('UserAddress', 'U') IS NULL
                BEGIN
                    CREATE TABLE [UserAddress] (
                        [Id] int NOT NULL IDENTITY,
                        [Address_Name] nvarchar(max) NOT NULL,
                        [Address_Line1] nvarchar(max) NOT NULL,
                        [Address_Line2] nvarchar(max) NULL,
                        [Address_City] nvarchar(max) NOT NULL,
                        [Address_State] nvarchar(max) NOT NULL,
                        [Address_PostalCode] nvarchar(max) NOT NULL,
                        [Address_Country] nvarchar(max) NOT NULL,
                        CONSTRAINT [PK_UserAddress] PRIMARY KEY ([Id])
                    );
                END;

                UPDATE [AspNetUsers] SET [AddressId] = NULL WHERE [AddressId] IS NOT NULL;

                IF OBJECT_ID('FK_AspNetUsers_UserAddress_AddressId', 'F') IS NULL
                    ALTER TABLE [AspNetUsers] ADD CONSTRAINT [FK_AspNetUsers_UserAddress_AddressId]
                    FOREIGN KEY ([AddressId]) REFERENCES [UserAddress] ([Id]);
            ");

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BuyerId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrderDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DeliveryFee = table.Column<long>(type: "bigint", nullable: false),
                    Discount = table.Column<long>(type: "bigint", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ShippingAddress_Address_Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ShippingAddress_Address_Line1 = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ShippingAddress_Address_Line2 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ShippingAddress_Address_City = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ShippingAddress_Address_State = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ShippingAddress_Address_PostalCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ShippingAddress_Address_Country = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PaymentSummary_Last4 = table.Column<int>(type: "int", nullable: true),
                    PaymentSummary_ExpMonth = table.Column<int>(type: "int", nullable: true),
                    PaymentSummary_ExpYear = table.Column<int>(type: "int", nullable: true),
                    PaymentSummary_Brand = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaymentIntentId = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OrderItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ItemOrdered_ProductId = table.Column<int>(type: "int", nullable: false),
                    ItemOrdered_ProductName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ItemOrdered_PictureUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    OrderId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderItems_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_OrderId",
                table: "OrderItems",
                column: "OrderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrderItems");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.Sql(@"
                IF OBJECT_ID('FK_AspNetUsers_UserAddress_AddressId', 'F') IS NOT NULL
                    ALTER TABLE [AspNetUsers] DROP CONSTRAINT [FK_AspNetUsers_UserAddress_AddressId];

                IF OBJECT_ID('UserAddress', 'U') IS NOT NULL
                    DROP TABLE [UserAddress];

                IF EXISTS(SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Baskets') AND name = 'DeliveryFee')
                    ALTER TABLE [Baskets] DROP COLUMN [DeliveryFee];

                IF EXISTS(SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Baskets') AND name = 'Discount')
                    ALTER TABLE [Baskets] DROP COLUMN [Discount];

                IF OBJECT_ID('Address', 'U') IS NULL
                BEGIN
                    CREATE TABLE [Address] (
                        [Id] int NOT NULL IDENTITY,
                        [City] nvarchar(max) NOT NULL,
                        [Country] nvarchar(max) NOT NULL,
                        [Line1] nvarchar(max) NOT NULL,
                        [Line2] nvarchar(max) NULL,
                        [Name] nvarchar(max) NOT NULL,
                        [PostalCode] nvarchar(max) NOT NULL,
                        [State] nvarchar(max) NOT NULL,
                        CONSTRAINT [PK_Address] PRIMARY KEY ([Id])
                    );
                END;

                IF OBJECT_ID('FK_AspNetUsers_Address_AddressId', 'F') IS NULL
                    ALTER TABLE [AspNetUsers] ADD CONSTRAINT [FK_AspNetUsers_Address_AddressId]
                    FOREIGN KEY ([AddressId]) REFERENCES [Address] ([Id]);
            ");
        }
    }
}
