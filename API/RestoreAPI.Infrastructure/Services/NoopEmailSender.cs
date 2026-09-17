using Microsoft.AspNetCore.Identity;
using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Infrastructure.Services
{
    public class NoopEmailSender : IEmailSender<User>
    {
        public Task SendConfirmationLinkAsync(User user, string email, string confirmationLink)
            => Task.CompletedTask;

        public Task SendPasswordResetCodeAsync(User user, string email, string resetCode)
            => Task.CompletedTask;

        public Task SendPasswordResetLinkAsync(User user, string email, string resetLink)
            => Task.CompletedTask;
    }
}
