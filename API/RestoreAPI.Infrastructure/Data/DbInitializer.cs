using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Infrastructure.Data
{
    public class DbInitializer
    {
        private readonly AppDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public DbInitializer(AppDbContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task InitializeAsync()
        {
            await _context.Database.MigrateAsync();
            await SeedRolesAsync();
            await SeedUsersAsync();
            await SeedProductsAsync();
        }

        private async Task SeedRolesAsync()
        {
            string[] roles = ["Admin", "User", "Vendor"];
            foreach (var role in roles)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                {
                    await _roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }

        private async Task SeedUsersAsync()
        {
            var admin = await _userManager.FindByEmailAsync("admin@test.com");
            if (admin == null)
            {
                admin = new User
                {
                    UserName = "admin@test.com",
                    Email = "admin@test.com"
                };

                var result = await _userManager.CreateAsync(admin, "Admin123!");
                if (result.Succeeded)
                {
                    await _userManager.AddToRolesAsync(admin, ["Admin", "User"]);
                }
            }
            else if (admin.UserName != admin.Email)
            {
                admin.UserName = admin.Email;
                await _userManager.UpdateAsync(admin);
            }

            var member = await _userManager.FindByEmailAsync("vendor@test.com");
            if (member == null)
            {
                member = new User
                {
                    UserName = "vendor@test.com",
                    Email = "vendor@test.com"
                };

                var result = await _userManager.CreateAsync(member, "Vendor123!");
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(member, "Vendor");
                }
            }
            else if (member.UserName != member.Email)
            {
                member.UserName = member.Email;
                await _userManager.UpdateAsync(member);
            }
        }

        private async Task SeedProductsAsync()
        {
            // 1. Clear existing data to ensure a fresh start as requested
            if (await _context.Products.AnyAsync())
            {
                return;
            }

            var products = new List<Product>();

            // ─── LAPTOPS (10 Items) ───
            products.AddRange(new List<Product> {
        new() { Name = "MacBook Pro 16 M3 Max", Description = "Apple M3 Max 16-core CPU, 40-core GPU, 48GB RAM, 1TB SSD, Space Black.", Price = 349900, PictureUrl = "/images/products/laptop-macbook-pro.jpg", Brand = "Apple", Type = "Laptops", QuantityInStock = 10 },
        new() { Name = "MacBook Air 13 M3", Description = "Apple M3 chip, 8-core CPU, 10-core GPU, 16GB RAM, 512GB SSD, Midnight.", Price = 129900, PictureUrl = "/images/products/laptop-macbook-air.jpg", Brand = "Apple", Type = "Laptops", QuantityInStock = 25 },
        new() { Name = "Dell XPS 15 9530", Description = "Intel Core i9-13900H, 15.6\" 3.5K OLED Touch, 32GB DDR5, 1TB SSD, RTX 4070.", Price = 249900, PictureUrl = "/images/products/laptop-dell-xps.jpg", Brand = "Dell", Type = "Laptops", QuantityInStock = 15 },
        new() { Name = "Razer Blade 16 (2024)", Description = "Intel Core i9-14900HX, RTX 4090, 16\" Dual Mode Mini-LED, 32GB RAM, 2TB SSD.", Price = 419900, PictureUrl = "/images/products/laptop-alienware.jpg", Brand = "Razer", Type = "Laptops", QuantityInStock = 5 },
        new() { Name = "ASUS ROG Zephyrus G14", Description = "AMD Ryzen 9 8945HS, RTX 4070, 14\" OLED 120Hz, 32GB LPDDR5X, 1TB SSD.", Price = 199900, PictureUrl = "/images/products/laptop-asus-rog.jpg", Brand = "ASUS", Type = "Laptops", QuantityInStock = 12 },
        new() { Name = "Lenovo ThinkPad X1 Carbon Gen 12", Description = "Intel Core Ultra 7 155H, 14\" 2.8K OLED, 32GB RAM, 1TB SSD, Carbon Fiber.", Price = 189900, PictureUrl = "/images/products/laptop-thinkpad.jpg", Brand = "Lenovo", Type = "Laptops", QuantityInStock = 20 },
        new() { Name = "HP Spectre x360 14", Description = "Intel Core Ultra 7, 14\" 2.8K OLED Touch, 16GB RAM, 1TB SSD, Nightfall Black.", Price = 149900, PictureUrl = "/images/products/laptop-hp.jpg", Brand = "HP", Type = "Laptops", QuantityInStock = 18 },
        new() { Name = "Microsoft Surface Laptop 5", Description = "13.5\" Touchscreen, Intel Core i7, 16GB RAM, 512GB SSD, Sage finish.", Price = 129900, PictureUrl = "/images/products/laptop-surface.jpg", Brand = "Microsoft", Type = "Laptops", QuantityInStock = 15 },
        new() { Name = "Acer Swift Go 14", Description = "14\" 2.8K OLED, Intel Core i7-13700H, 16GB RAM, 512GB SSD, Thin & Light.", Price = 79900, PictureUrl = "/images/products/laptop-acer.jpg", Brand = "Acer", Type = "Laptops", QuantityInStock = 30 },
        new() { Name = "Alienware m18 R2", Description = "18\" QHD+ 165Hz, i9-14900HX, RTX 4080, 32GB DDR5, 2TB SSD.", Price = 329900, PictureUrl = "/images/products/laptop-alienware.jpg", Brand = "Alienware", Type = "Laptops", QuantityInStock = 8 }
    });

            // ─── DESKTOPS (6 Items) ───
            products.AddRange(new List<Product> {
        new() { Name = "Mac Studio M2 Ultra", Description = "24-core CPU, 60-core GPU, 64GB RAM, 1TB SSD. Professional desktop powerhouse.", Price = 399900, PictureUrl = "/images/products/desktop-mac-studio.jpg", Brand = "Apple", Type = "Desktops", QuantityInStock = 5 },
        new() { Name = "Alienware Aurora R16", Description = "Intel i9-14900KF, RTX 4080 Super, 32GB RAM, 2TB SSD, Liquid Cooled.", Price = 289900, PictureUrl = "/images/products/desktop-alienware.jpg", Brand = "Alienware", Type = "Desktops", QuantityInStock = 10 },
        new() { Name = "HP OMEN 45L", Description = "Intel i7-14700K, RTX 4070 Ti Super, 32GB DDR5, 1TB SSD, RGB Lighting.", Price = 239900, PictureUrl = "/images/products/desktop-hp-omen.jpg", Brand = "HP", Type = "Desktops", QuantityInStock = 12 },
        new() { Name = "Dell Inspiron Desktop", Description = "Intel Core i5-14400, 16GB DDR5, 512GB SSD. Reliable home & office PC.", Price = 64900, PictureUrl = "/images/products/desktop-alienware.jpg", Brand = "Dell", Type = "Desktops", QuantityInStock = 20 },
        new() { Name = "Custom Gaming Build White", Description = "Ryzen 7 7800X3D, RTX 4070 Super White, 32GB RGB RAM, NZXT H6 Flow Case.", Price = 189900, PictureUrl = "/images/products/gpu.jpg", Brand = "Custom", Type = "Desktops", QuantityInStock = 5 },
        new() { Name = "MSI Aegis RS", Description = "Intel i9-13900KF, RTX 4090, 64GB RAM, 2TB SSD. High-end gaming desktop.", Price = 369900, PictureUrl = "/images/products/desktop-hp-omen.jpg", Brand = "MSI", Type = "Desktops", QuantityInStock = 4 }
    });

            // ─── GRAPHICS CARDS - GPUs (8 Items) ───
            products.AddRange(new List<Product> {
        new() { Name = "NVIDIA RTX 4090 Founders Edition", Description = "24GB GDDR6X, Ada Lovelace architecture, Ray Tracing, DLSS 3.", Price = 159900, PictureUrl = "/images/products/gpu.jpg", Brand = "NVIDIA", Type = "GPUs", QuantityInStock = 5 },
        new() { Name = "ASUS ROG Strix RTX 4080 Super", Description = "16GB GDDR6X, Axial-tech fans, RGB Aura Sync, High-performance cooling.", Price = 114900, PictureUrl = "/images/products/gpu.jpg", Brand = "ASUS", Type = "GPUs", QuantityInStock = 12 },
        new() { Name = "MSI Gaming X Slim RTX 4070 Ti", Description = "12GB GDDR6X, Slim design, TORX Fan 5.0, Excellent 1440p performance.", Price = 79900, PictureUrl = "/images/products/gpu.jpg", Brand = "MSI", Type = "GPUs", QuantityInStock = 15 },
        new() { Name = "Gigabyte AORUS Master RTX 4070", Description = "12GB GDDR6X, Windforce cooling, LCD Edge View, RGB Fusion.", Price = 64900, PictureUrl = "/images/products/gpu.jpg", Brand = "Gigabyte", Type = "GPUs", QuantityInStock = 20 },
        new() { Name = "AMD Radeon RX 7900 XTX", Description = "24GB GDDR6, RDNA 3, FSR 3.0, Competitive 4K gaming performance.", Price = 94900, PictureUrl = "/images/products/gpu.jpg", Brand = "AMD", Type = "GPUs", QuantityInStock = 10 },
        new() { Name = "ZOTAC Gaming RTX 4060 Ti", Description = "8GB GDDR6, Compact design, IceStorm 2.0 cooling. Perfect for mid-range builds.", Price = 39900, PictureUrl = "/images/products/gpu.jpg", Brand = "ZOTAC", Type = "GPUs", QuantityInStock = 30 },
        new() { Name = "EVGA GeForce RTX 3060 XC", Description = "12GB GDDR6, Dual fan, reliable performance for 1080p gaming.", Price = 28900, PictureUrl = "/images/products/gpu.jpg", Brand = "EVGA", Type = "GPUs", QuantityInStock = 25 },
        new() { Name = "Sapphire Pulse RX 7800 XT", Description = "16GB GDDR6, efficient cooling, excellent value for high-refresh 1440p.", Price = 49900, PictureUrl = "/images/products/gpu.jpg", Brand = "Sapphire", Type = "GPUs", QuantityInStock = 18 }
    });

            // ─── PROCESSORS - CPUs (6 Items) ───
            products.AddRange(new List<Product> {
        new() { Name = "Intel Core i9-14900K", Description = "24 Cores (8P+16E), up to 6.0 GHz, LGA 1700. The ultimate desktop CPU.", Price = 58900, PictureUrl = "/images/products/cpu-intel.jpg", Brand = "Intel", Type = "CPUs", QuantityInStock = 20 },
        new() { Name = "AMD Ryzen 9 7950X3D", Description = "16 Cores, 3D V-Cache, Socket AM5. The best gaming processor on the market.", Price = 69900, PictureUrl = "/images/products/cpu-amd.jpg", Brand = "AMD", Type = "CPUs", QuantityInStock = 15 },
        new() { Name = "Intel Core i7-14700K", Description = "20 Cores, up to 5.6 GHz. Excellent balance of gaming and productivity.", Price = 40900, PictureUrl = "/images/products/cpu-intel.jpg", Brand = "Intel", Type = "CPUs", QuantityInStock = 35 },
        new() { Name = "AMD Ryzen 7 7800X3D", Description = "8 Cores, 3D V-Cache. High-efficiency gaming powerhouse.", Price = 38900, PictureUrl = "/images/products/cpu-amd.jpg", Brand = "AMD", Type = "CPUs", QuantityInStock = 40 },
        new() { Name = "Intel Core i5-13600K", Description = "14 Cores, up to 5.1 GHz. The sweet spot for mid-range builds.", Price = 31900, PictureUrl = "/images/products/cpu-intel.jpg", Brand = "Intel", Type = "CPUs", QuantityInStock = 50 },
        new() { Name = "AMD Ryzen 5 7600X", Description = "6 Cores, up to 5.3 GHz. Great entry into the AM5 platform.", Price = 22900, PictureUrl = "/images/products/cpu-amd.jpg", Brand = "AMD", Type = "CPUs", QuantityInStock = 60 }
    });

            // ─── MEMORY & STORAGE (10 Items) ───
            products.AddRange(new List<Product> {
        new() { Name = "Corsair Vengeance RGB 32GB DDR5", Description = "32GB (2x16GB) 6000MHz CL36, Black, iCUE compatible.", Price = 12900, PictureUrl = "/images/products/ram.jpg", Brand = "Corsair", Type = "RAM", QuantityInStock = 50 },
        new() { Name = "G.Skill Trident Z5 RGB 64GB", Description = "64GB (2x32GB) 6400MHz CL32, Silver, High-performance DDR5.", Price = 24900, PictureUrl = "/images/products/ram.jpg", Brand = "G.Skill", Type = "RAM", QuantityInStock = 20 },
        new() { Name = "Kingston FURY Beast 16GB", Description = "16GB (2x8GB) 5200MHz DDR5, Low-profile heat spreader.", Price = 6900, PictureUrl = "/images/products/ram.jpg", Brand = "Kingston", Type = "RAM", QuantityInStock = 80 },
        new() { Name = "Crucial Pro 32GB DDR4", Description = "32GB (2x16GB) 3200MHz DDR4, reliable memory for older systems.", Price = 7900, PictureUrl = "/images/products/ram.jpg", Brand = "Crucial", Type = "RAM", QuantityInStock = 40 },
        new() { Name = "Samsung 990 Pro 2TB NVMe", Description = "PCIe 4.0, up to 7450MB/s read. The fastest consumer Gen4 SSD.", Price = 16900, PictureUrl = "/images/products/ssd.jpg", Brand = "Samsung", Type = "Storage", QuantityInStock = 35 },
        new() { Name = "WD Black SN850X 1TB", Description = "PCIe 4.0, up to 7300MB/s read, optimized for gaming.", Price = 9900, PictureUrl = "/images/products/ssd.jpg", Brand = "Western Digital", Type = "Storage", QuantityInStock = 50 },
        new() { Name = "Crucial T700 2TB Gen5", Description = "PCIe 5.0, up to 12,400MB/s read. Cutting-edge storage speed.", Price = 28900, PictureUrl = "/images/products/ssd.jpg", Brand = "Crucial", Type = "Storage", QuantityInStock = 15 },
        new() { Name = "Seagate IronWolf 8TB HDD", Description = "7200 RPM, SATA 6Gb/s, 256MB Cache. Reliable NAS storage.", Price = 19900, PictureUrl = "/images/products/ssd.jpg", Brand = "Seagate", Type = "Storage", QuantityInStock = 20 },
        new() { Name = "Samsung 870 EVO 1TB SATA", Description = "Reliable SATA SSD for upgrading older laptops and PCs.", Price = 8900, PictureUrl = "/images/products/ssd.jpg", Brand = "Samsung", Type = "Storage", QuantityInStock = 45 },
        new() { Name = "SanDisk Extreme Portable 2TB", Description = "USB 3.2 Gen 2, rugged external SSD for travel and backup.", Price = 15900, PictureUrl = "/images/products/ssd.jpg", Brand = "SanDisk", Type = "Storage", QuantityInStock = 30 }
    });

            // ─── MONITORS (6 Items) ───
            products.AddRange(new List<Product> {
        new() { Name = "Samsung Odyssey Neo G9", Description = "49\" Curved DQHD, Mini-LED, 240Hz, 1ms. Ultimate ultrawide.", Price = 179900, PictureUrl = "/images/products/monitor.jpg", Brand = "Samsung", Type = "Monitors", QuantityInStock = 8 },
        new() { Name = "LG UltraGear 27GR95QE", Description = "27\" QHD OLED, 240Hz, 0.03ms GtG. Stunning colors and speed.", Price = 89900, PictureUrl = "/images/products/monitor.jpg", Brand = "LG", Type = "Monitors", QuantityInStock = 15 },
        new() { Name = "ASUS ProArt PA32UCG", Description = "32\" 4K HDR, 1600 nits, 120Hz. Professional color accuracy.", Price = 299900, PictureUrl = "/images/products/monitor.jpg", Brand = "ASUS", Type = "Monitors", QuantityInStock = 5 },
        new() { Name = "Dell UltraSharp U2723QE", Description = "27\" 4K USB-C Hub Monitor, IPS Black technology, 100% sRGB.", Price = 59900, PictureUrl = "/images/products/monitor.jpg", Brand = "Dell", Type = "Monitors", QuantityInStock = 25 },
        new() { Name = "Gigabyte M27Q", Description = "27\" 170Hz 1440p KVM Gaming Monitor. Excellent value and features.", Price = 29900, PictureUrl = "/images/products/monitor.jpg", Brand = "Gigabyte", Type = "Monitors", QuantityInStock = 40 },
        new() { Name = "BenQ Mobiuz EX3415R", Description = "34\" Ultrawide Curved, 144Hz, IPS, built-in TreVolo speakers.", Price = 69900, PictureUrl = "/images/products/monitor.jpg", Brand = "BenQ", Type = "Monitors", QuantityInStock = 12 }
    });

            // ─── KEYBOARDS & MICE (10 Items) ───
            products.AddRange(new List<Product> {
        new() { Name = "Logitech G Pro X Superlight 2", Description = "Wireless Gaming Mouse, HERO 2 sensor, 60g ultra-lightweight.", Price = 15900, PictureUrl = "/images/products/mouse.jpg", Brand = "Logitech", Type = "Mice", QuantityInStock = 50 },
        new() { Name = "Razer DeathAdder V3 Pro", Description = "Ergonomic Wireless Gaming Mouse, 30K DPI Optical Sensor.", Price = 14900, PictureUrl = "/images/products/mouse-razer.jpg", Brand = "Razer", Type = "Mice", QuantityInStock = 45 },
        new() { Name = "SteelSeries Rival 3", Description = "Wired Gaming Mouse, Prism RGB, TrueMove Core Sensor.", Price = 2900, PictureUrl = "/images/products/mouse.jpg", Brand = "SteelSeries", Type = "Mice", QuantityInStock = 100 },
        new() { Name = "Logitech MX Master 3S", Description = "Performance Wireless Mouse, 8K DPI, Quiet Clicks, Ergonomic.", Price = 9900, PictureUrl = "/images/products/mouse.jpg", Brand = "Logitech", Type = "Mice", QuantityInStock = 60 },
        new() { Name = "Keychron Q1 Pro", Description = "75% Wireless Custom Mechanical Keyboard, Aluminum Body, RGB.", Price = 19900, PictureUrl = "/images/products/keyboard.jpg", Brand = "Keychron", Type = "Keyboards", QuantityInStock = 20 },
        new() { Name = "Razer Huntsman V3 Pro TKL", Description = "Analog Optical Switches, Rapid Trigger, PBT Keycaps.", Price = 21900, PictureUrl = "/images/products/keyboard.jpg", Brand = "Razer", Type = "Keyboards", QuantityInStock = 25 },
        new() { Name = "SteelSeries Apex Pro", Description = "OmniPoint Adjustable Mechanical Switches, OLED Smart Display.", Price = 18900, PictureUrl = "/images/products/keyboard.jpg", Brand = "SteelSeries", Type = "Keyboards", QuantityInStock = 30 },
        new() { Name = "Logitech G915 TKL", Description = "Low Profile Wireless Mechanical Keyboard, LIGHTSPEED, RGB.", Price = 22900, PictureUrl = "/images/products/keyboard.jpg", Brand = "Logitech", Type = "Keyboards", QuantityInStock = 15 },
        new() { Name = "Corsair K70 RGB TKL", Description = "Mechanical Gaming Keyboard, Cherry MX Speed, 8000Hz Polling.", Price = 13900, PictureUrl = "/images/products/keyboard.jpg", Brand = "Corsair", Type = "Keyboards", QuantityInStock = 40 },
        new() { Name = "Ducky One 3 Mini", Description = "60% Hot-swappable Mechanical Keyboard, Daybreak theme.", Price = 11900, PictureUrl = "/images/products/keyboard.jpg", Brand = "Ducky", Type = "Keyboards", QuantityInStock = 20 }
    });

            // ─── AUDIO & PERIPHERALS (10 Items) ───
            products.AddRange(new List<Product> {
        new() { Name = "Sony WH-1000XM5", Description = "Industry-leading Noise Canceling Headphones, 30hr Battery.", Price = 39900, PictureUrl = "/images/products/headphones-sony.jpg", Brand = "Sony", Type = "Audio", QuantityInStock = 40 },
        new() { Name = "SteelSeries Arctis Nova Pro", Description = "Wireless Gaming Headset, Hi-Res Audio, Multi-System Connect.", Price = 34900, PictureUrl = "/images/products/headphones.jpg", Brand = "SteelSeries", Type = "Audio", QuantityInStock = 25 },
        new() { Name = "Logitech G733 K/DA", Description = "Wireless RGB Gaming Headset, Lightweight, Blue VO!CE.", Price = 12900, PictureUrl = "/images/products/headphones.jpg", Brand = "Logitech", Type = "Audio", QuantityInStock = 50 },
        new() { Name = "Blue Yeti USB Microphone", Description = "Professional Multi-Pattern USB Mic for Streaming & Podcasts.", Price = 12900, PictureUrl = "/images/products/microphone.jpg", Brand = "Logitech", Type = "Audio", QuantityInStock = 30 },
        new() { Name = "Elgato Stream Deck MK.2", Description = "15 customizable LCD keys for apps, tools, and platforms.", Price = 14900, PictureUrl = "/images/products/stream-deck.jpg", Brand = "Elgato", Type = "Peripherals", QuantityInStock = 45 },
        new() { Name = "Elgato Facecam Pro", Description = "World's first 4K60 Webcam, professional grade lens.", Price = 29900, PictureUrl = "/images/products/webcam.jpg", Brand = "Elgato", Type = "Peripherals", QuantityInStock = 20 },
        new() { Name = "Razer Kiyo Pro Ultra", Description = "Ultra-large sensor 4K Webcam for DSLR-like quality.", Price = 29900, PictureUrl = "/images/products/webcam.jpg", Brand = "Razer", Type = "Peripherals", QuantityInStock = 15 },
        new() { Name = "TP-Link Archer BE800", Description = "WiFi 7 Router, BE19000, 10G Ports, LED Screen.", Price = 59900, PictureUrl = "/images/products/laptop-alienware.jpg", Brand = "TP-Link", Type = "Networking", QuantityInStock = 10 },
        new() { Name = "ASUS ROG Rapture GT6", Description = "Gaming Mesh WiFi System, covers up to 5800 sq ft.", Price = 44900, PictureUrl = "/images/products/laptop-alienware.jpg", Brand = "ASUS", Type = "Networking", QuantityInStock = 12 },
        new() { Name = "Nanoleaf Lines Starter Kit", Description = "Smart RGB light bars for gaming room setup.", Price = 19900, PictureUrl = "/images/products/nanoleaf.jpg", Brand = "Nanoleaf", Type = "Accessories", QuantityInStock = 25 }
    });

            // ─── ACCESSORIES & CABLES (10 Items) ───
            for (int i = 1; i <= 10; i++)
            {
                products.Add(new Product
                {
                    Name = i % 2 == 0 ? $"Braided HDMI 2.1 Cable {i}m" : $"USB-C to DisplayPort {i}m",
                    Description = $"High-speed {i} meter cable supporting 8K@60Hz and 4K@144Hz. Gold-plated connectors.",
                    Price = 1500 + (i * 300),
                    PictureUrl = "/images/products/webcam.jpg",
                    Brand = "Ugreen",
                    Type = "Accessories",
                    QuantityInStock = 100
                });
            }

            // Total Items: 10 (Laptops) + 6 (Desktops) + 8 (GPUs) + 6 (CPUs) + 10 (Mem/Storage) + 6 (Monitors) + 10 (KBM) + 10 (Audio) + 10 (Acc) = 76 Items

            _context.Products.AddRange(products);
            await _context.SaveChangesAsync();
        }
    }

    }
