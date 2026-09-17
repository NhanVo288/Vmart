using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Controllers
{
    [AllowAnonymous]
    public class ContactController : BaseApiController
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<ContactController> _logger;

        public ContactController(IEmailService emailService, ILogger<ContactController> logger)
        {
            _emailService = emailService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> SendContactMessage([FromBody] ContactDto contactDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _emailService.SendContactAutoReplyAsync(
                contactDto.Email,
                contactDto.Name,
                contactDto.Subject,
                contactDto.Message
            );

            _logger.LogInformation("Contact message received from {Email}", contactDto.Email);
            return Ok(new { message = "Thank you! Your message has been sent successfully." });
        }
    }
}
