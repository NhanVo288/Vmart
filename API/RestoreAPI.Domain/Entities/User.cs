using Microsoft.AspNetCore.Identity;
using RestoreAPI.Domain.Entities.Common;

namespace RestoreAPI.Domain.Entities
{
    public class User : IdentityUser
    {
        public Address? Address { get; set; }
    }
}

