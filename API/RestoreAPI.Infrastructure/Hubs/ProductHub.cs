using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace RestoreAPI.Infrastructure.Hubs
{
    [Authorize]
    public class ProductHub : Hub
    {
        public async Task JoinVendorGroup(string sellerId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"vendor-{sellerId}");
        }

        public async Task LeaveVendorGroup(string sellerId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"vendor-{sellerId}");
        }

        public override async Task OnConnectedAsync()
        {
            var sellerId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(sellerId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"vendor-{sellerId}");
            }

            if (Context.User?.IsInRole("Admin") == true)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "admins");
            }

            await base.OnConnectedAsync();
        }
    }
}
