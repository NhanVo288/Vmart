using System.Net;
using System.Net.Mail;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Application.Settings;
using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Infrastructure.Services
{
    public class SmtpEmailService : IEmailService, IEmailSender<User>
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<SmtpEmailService> _logger;

        public SmtpEmailService(IOptions<EmailSettings> options, ILogger<SmtpEmailService> logger)
        {
            _settings = options.Value;
            _logger = logger;
        }

        #region IEmailSender<User> Implementation
        public Task SendConfirmationLinkAsync(User user, string email, string confirmationLink)
        {
            var body = $@"
                <div style=""background: linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;"">
                    <div style=""font-size: 40px; margin-bottom: 8px;"">📧</div>
                    <div style=""font-size: 20px; font-weight: 700; color: #1e3a5f; margin-bottom: 4px;"">Verify Your Email</div>
                    <div style=""font-size: 14px; color: #3b82f6;"">One last step to get started</div>
                </div>

                <p style=""color: #475569; font-size: 15px; line-height: 1.7; margin-bottom: 20px;"">
                    Thanks for signing up for <strong>VMart</strong>! Please confirm your email address to activate your account and start shopping.
                </p>

                {GetActionButton("Confirm Email Address", confirmationLink)}

                <div style=""background-color: #f8fafc; border-radius: 8px; padding: 16px; margin-top: 8px;"">
                    <p style=""margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.5;"">
                        If you didn't create an account, you can safely ignore this email.
                    </p>
                </div>
            ";

            var html = GetBaseEmailTemplate("Verify Your Email ✉️", $"Hello {user.UserName ?? "there"},", body);
            return SendEmailAsync(email, "Verify your VMart account ✉️", html);
        }

        public Task SendPasswordResetCodeAsync(User user, string email, string resetCode)
        {
            var body = $@"
                <div style=""background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;"">
                    <div style=""font-size: 40px; margin-bottom: 8px;"">🔑</div>
                    <div style=""font-size: 20px; font-weight: 700; color: #92400e; margin-bottom: 4px;"">Password Reset Code</div>
                    <div style=""font-size: 14px; color: #b45309;"">Use this code to reset your password</div>
                </div>

                <p style=""color: #475569; font-size: 15px; line-height: 1.7; margin-bottom: 20px;"">
                    We received a request to reset your password. Use the code below within <strong>15 minutes</strong>:
                </p>

                <div style=""background-color: #f8fafc; border: 2px dashed #cbd5e1; padding: 20px; text-align: center; border-radius: 12px; margin: 24px 0;"">
                    <p style=""margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;"">Your Reset Code</p>
                    <div style=""font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4f46e5;"">{resetCode}</div>
                </div>

                <div style=""background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px; padding: 14px 18px; margin-top: 8px;"">
                    <p style=""margin: 0; color: #991b1b; font-size: 13px; line-height: 1.5;"">
                        <strong>Didn't request this?</strong> Someone else may be trying to access your account. Please ignore this email or contact our support team immediately.
                    </p>
                </div>
            ";

            var html = GetBaseEmailTemplate("Password Reset 🔑", $"Hello {user.UserName ?? "there"},", body);
            return SendEmailAsync(email, "Your password reset code - VMart 🔑", html);
        }

        public Task SendPasswordResetLinkAsync(User user, string email, string resetLink)
        {
            return SendPasswordResetLinkAsync(email, user.UserName ?? "there", resetLink);
        }

        public Task SendPasswordResetLinkAsync(string userEmail, string userName, string resetLink)
        {
            var body = $@"
                <div style=""background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;"">
                    <div style=""font-size: 40px; margin-bottom: 8px;"">🔑</div>
                    <div style=""font-size: 20px; font-weight: 700; color: #92400e; margin-bottom: 4px;"">Reset Your Password</div>
                    <div style=""font-size: 14px; color: #b45309;"">Click below to create a new password</div>
                </div>

                <p style=""color: #475569; font-size: 15px; line-height: 1.7; margin-bottom: 20px;"">
                    We received a request to reset the password for your <strong>VMart</strong> account. Click the button below to choose a new password:
                </p>

                {GetActionButton("Reset Password", resetLink)}

                <div style=""background-color: #f8fafc; border-radius: 8px; padding: 16px; margin-top: 8px;"">
                    <p style=""margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.5;"">
                        This link will expire in <strong>15 minutes</strong>. If you didn't request a password reset, you can safely ignore this email.
                    </p>
                </div>
            ";

            var html = GetBaseEmailTemplate("Reset Your Password 🔑", $"Hello {userName},", body);
            return SendEmailAsync(userEmail, "Reset your VMart password 🔑", html);
        }
        #endregion

        #region IEmailService Implementation

        public Task SendWelcomeEmailAsync(string userEmail, string userName)
        {
            var body = $@"
                <div style=""background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;"">
                    <div style=""font-size: 40px; margin-bottom: 8px;"">🎉</div>
                    <div style=""font-size: 20px; font-weight: 700; color: #065f46; margin-bottom: 4px;"">Welcome to VMart!</div>
                    <div style=""font-size: 14px; color: #059669;"">Your account has been created successfully</div>
                </div>

                <p style=""color: #475569; font-size: 15px; line-height: 1.7; margin-bottom: 20px;"">
                    We're excited to have you on board! You now have access to our full catalog of products, exclusive deals, and a seamless shopping experience.
                </p>

                <div style=""background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%); border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;"">
                    <p style=""margin: 0 0 8px 0; color: #4338ca; font-weight: 700; font-size: 15px;"">Here's what you can do:</p>
                    <table role=""presentation"" style=""width: 100%;"">
                        <tr>
                            <td style=""padding: 4px 0; color: #6366f1; font-size: 14px;"">✓ Browse our curated collection</td>
                        </tr>
                        <tr>
                            <td style=""padding: 4px 0; color: #6366f1; font-size: 14px;"">✓ Save favorites and get price drop alerts</td>
                        </tr>
                        <tr>
                            <td style=""padding: 4px 0; color: #6366f1; font-size: 14px;"">✓ Get notified when out-of-stock items return</td>
                        </tr>
                    </table>
                </div>

                {GetActionButton("Start Shopping Now", ResolveAppUrl("/products"))}
            ";

            var html = GetBaseEmailTemplate("Welcome to VMart 🎉", $"Hello {userName},", body);
            return SendEmailAsync(userEmail, "Welcome to VMart! 🎉", html);
        }

        public async Task<string?> SendOrderConfirmationEmailAsync(string userEmail, OrderDto order)
        {
            var itemsHtml = "";
            foreach (var item in order.OrderItems)
            {
                itemsHtml += $@"
                    <tr style=""border-bottom: 1px solid #e2e8f0;"">
                        <td style=""padding: 14px 8px;"">
                            <div style=""display: flex; align-items: center;"">
                                <img src=""{ResolveImageUrl(item.PictureUrl)}"" alt=""{WebUtility.HtmlEncode(item.ProductName)}"" style=""width: 54px; height: 54px; object-fit: cover; border-radius: 10px; margin-right: 14px; border: 1px solid #e2e8f0;"" />
                                <div>
                                    <div style=""font-weight: 600; color: #1e293b; font-size: 14px; margin-bottom: 2px;"">{WebUtility.HtmlEncode(item.ProductName)}</div>
                                    <div style=""color: #64748b; font-size: 12px;"">Qty: {item.Quantity} × VND{item.Price:N2}</div>
                                </div>
                            </div>
                        </td>
                        <td style=""padding: 14px 8px; text-align: right; font-weight: 700; color: #0f172a; font-size: 14px;"">
                            VND{(item.Price * item.Quantity):N2}
                        </td>
                    </tr>
                ";
            }

            var shippingAddressHtml = order.ShippingAddress != null ? $@"
                <div style=""background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-top: 24px;"">
                    <h4 style=""margin: 0 0 10px 0; color: #1e293b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;"">📍 Shipping Address</h4>
                    <p style=""margin: 0; color: #475569; font-size: 14px; line-height: 1.6;"">
                        <strong>{WebUtility.HtmlEncode(order.ShippingAddress.Name)}</strong><br />
                        {WebUtility.HtmlEncode(order.ShippingAddress.Line1)}
                        {(string.IsNullOrEmpty(order.ShippingAddress.Line2) ? "" : "<br />" + WebUtility.HtmlEncode(order.ShippingAddress.Line2))}<br />
                        {WebUtility.HtmlEncode(order.ShippingAddress.City)}, {WebUtility.HtmlEncode(order.ShippingAddress.State)} {WebUtility.HtmlEncode(order.ShippingAddress.PostalCode)}<br />
                        {WebUtility.HtmlEncode(order.ShippingAddress.Country)}
                    </p>
                </div>
            " : "";

            var body = $@"
                <div style=""background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;"">
                    <div style=""font-size: 40px; margin-bottom: 8px;"">📦</div>
                    <div style=""font-size: 22px; font-weight: 700; color: #065f46; margin-bottom: 4px;"">Order #{order.Id} Confirmed!</div>
                    <div style=""font-size: 14px; color: #059669;"">Placed on {order.OrderDate:MMMM dd, yyyy}</div>
                </div>

                <p style=""color: #475569; font-size: 15px; line-height: 1.7; margin-bottom: 20px;"">
                    Thank you for your order! We're preparing your items for delivery. Here's a summary of your order:
                </p>

                <table style=""width: 100%; border-collapse: collapse; margin-top: 16px;"">
                    <thead>
                        <tr style=""border-bottom: 2px solid #cbd5e1; text-align: left;"">
                            <th style=""padding: 8px; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;"">Item</th>
                            <th style=""padding: 8px; text-align: right; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;"">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsHtml}
                    </tbody>
                </table>

                <div style=""margin-top: 16px; border-top: 2px solid #e2e8f0; padding-top: 14px;"">
                    <table style=""width: 100%; font-size: 14px;"">
                        <tr>
                            <td style=""color: #64748b; padding: 5px 0;"">Subtotal</td>
                            <td style=""text-align: right; color: #1e293b; padding: 5px 0; font-weight: 500;"">VND{order.Subtotal:N2}</td>
                        </tr>
                        <tr>
                            <td style=""color: #64748b; padding: 5px 0;"">Delivery Fee</td>
                            <td style=""text-align: right; color: #1e293b; padding: 5px 0; font-weight: 500;"">{(order.DeliveryFee == 0 ? "FREE" : $"VND{order.DeliveryFee:N2}")}</td>
                        </tr>
                        <tr style=""font-size: 18px; font-weight: 700; border-top: 2px solid #e2e8f0;"">
                            <td style=""color: #0f172a; padding: 10px 0 4px 0;"">Total</td>
                            <td style=""text-align: right; color: #4f46e5; padding: 10px 0 4px 0;"">VND{order.Total:N2}</td>
                        </tr>
                    </table>
                </div>

                {shippingAddressHtml}

                <div style=""margin-top: 28px;"">
                    {GetActionButton("View Your Orders", ResolveAppUrl("/orders"))}
                </div>
            ";

            var html = GetBaseEmailTemplate($"Order #{order.Id} Confirmed 📦", "Thank you for your order!", body);
            return await TrySendEmailAsync(userEmail, $"Order #{order.Id} confirmed - VMart 📦", html);
        }

        public Task SendContactAutoReplyAsync(string contactEmail, string name, string subject, string message)
        {
            var body = $@"
                <div style=""background: linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;"">
                    <div style=""font-size: 40px; margin-bottom: 8px;"">📩</div>
                    <div style=""font-size: 20px; font-weight: 700; color: #1e3a5f; margin-bottom: 4px;"">Message Received</div>
                    <div style=""font-size: 14px; color: #3b82f6;"">Our team will get back to you soon</div>
                </div>

                <p style=""color: #475569; font-size: 15px; line-height: 1.7; margin-bottom: 20px;"">
                    Thank you for reaching out to <strong>VMart</strong>! We've received your message and our support team is reviewing it.
                </p>

                <div style=""background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 24px;"">
                    <p style=""margin: 0 0 8px 0; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;"">Regarding: {WebUtility.HtmlEncode(subject)}</p>
                    <p style=""margin: 0; color: #1e293b; font-size: 14px; font-style: italic; white-space: pre-wrap; line-height: 1.6;"">""{WebUtility.HtmlEncode(message)}""</p>
                </div>

                <p style=""color: #475569; font-size: 14px; line-height: 1.6;"">
                    We typically respond within <strong>24 business hours</strong>. If your request is urgent, feel free to reply directly to this email.
                </p>
            ";

            var html = GetBaseEmailTemplate("We Received Your Message 📩", $"Hello {WebUtility.HtmlEncode(name)},", body);
            return SendEmailAsync(contactEmail, $"We received your message: {subject} - VMart", html);
        }

        public Task<string?> SendStockAvailableEmailAsync(string userEmail, string productName, string pictureUrl, decimal price, int productId)
        {
            var imageUrl = ResolveImageUrl(pictureUrl);
            var productUrl = ResolveAppUrl($"/items/{productId}");
            var body = $@"
                <div style=""background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;"">
                    <div style=""font-size: 40px; margin-bottom: 8px;"">✅</div>
                    <div style=""font-size: 20px; font-weight: 700; color: #065f46; margin-bottom: 4px;"">Back In Stock!</div>
                    <div style=""font-size: 14px; color: #059669;"">The product you subscribed for is now available</div>
                </div>

                <p style=""color: #475569; font-size: 15px; line-height: 1.7; margin-bottom: 24px;"">
                    Great news! The product you were waiting for is officially back in stock and ready to ship. Don't miss your chance to grab it before it sells out again!
                </p>

                <div style=""background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;"">
                    <table role=""presentation"" style=""width: 100%; border-collapse: collapse;"">
                        <tr>
                            <td style=""padding: 20px; width: 120px; vertical-align: top;"">
                                <img src=""{imageUrl}"" alt=""{WebUtility.HtmlEncode(productName)}"" style=""width: 110px; height: 110px; object-fit: cover; border-radius: 10px; display: block; border: 1px solid #e2e8f0;"" />
                            </td>
                            <td style=""padding: 20px; vertical-align: middle;"">
                                <div style=""font-size: 11px; color: #6366f1; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;"">Available Now</div>
                                <div style=""font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px; line-height: 1.3;"">{WebUtility.HtmlEncode(productName)}</div>
                                <div style=""font-size: 22px; font-weight: 800; color: #4f46e5;"">VND{price:N2}</div>
                            </td>
                        </tr>
                    </table>
                </div>

                <div style=""text-align: center; margin: 28px 0;"">
                    <a href=""{productUrl}"" target=""_blank"" style=""background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 10px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35); letter-spacing: 0.5px;"">
                        Shop Now →
                    </a>
                </div>

                <div style=""background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 14px 18px; text-align: center; margin-top: 8px;"">
                    <p style=""margin: 0; color: #92400e; font-size: 13px; font-weight: 600;"">
                        ⚡ Hurry! Stock is limited and selling fast
                    </p>
                </div>
            ";

            var html = GetBaseEmailTemplate("Back In Stock! 🎉", "Great news!", body);
            return TrySendEmailAsync(userEmail, $"✅ {productName} is back in stock! - VMart", html);
        }

        #endregion

        #region Private SMTP Sender & Helpers

        private string ResolveImageUrl(string? url)
        {
            if (string.IsNullOrWhiteSpace(url)) return string.Empty;

            if (url.StartsWith("http", StringComparison.OrdinalIgnoreCase)) return url;

            var baseUrl = _settings.SiteUrl?.TrimEnd('/');
            return string.IsNullOrEmpty(baseUrl) ? url : $"{baseUrl}/{url.TrimStart('/')}";
        }

        private string ResolveAppUrl(string path)
        {
            var baseUrl = _settings.SiteUrl?.TrimEnd('/');
            return string.IsNullOrEmpty(baseUrl) ? path : $"{baseUrl}/{path.TrimStart('/')}";
        }

        private async Task SendEmailAsync(string toEmail, string subject, string htmlContent)
        {
            await TrySendEmailAsync(toEmail, subject, htmlContent);
        }

        private async Task<string?> TrySendEmailAsync(string toEmail, string subject, string htmlContent)
        {
            var senderEmail = string.IsNullOrWhiteSpace(_settings.SenderEmail) ? _settings.Username : _settings.SenderEmail;

            if (string.IsNullOrWhiteSpace(_settings.Username) || string.IsNullOrWhiteSpace(_settings.Password) || _settings.Username == "YOUR_GMAIL_ADDRESS@gmail.com")
            {
                _logger.LogWarning("[Gmail SMTP Simulator] Gmail credentials not configured in appsettings. Simulating email send to {ToEmail}. Subject: {Subject}", toEmail, subject);
                return "SMTP credentials are not configured on the server.";
            }

            try
            {
                using var message = new MailMessage();
                message.From = new MailAddress(senderEmail, _settings.SenderName);
                message.To.Add(toEmail);
                message.Subject = subject;
                message.Body = htmlContent;
                message.IsBodyHtml = true;

                using var client = new SmtpClient(_settings.SmtpServer, _settings.Port);
                client.Credentials = new NetworkCredential(_settings.Username, _settings.Password);
                client.EnableSsl = _settings.EnableSsl;

                await client.SendMailAsync(message);
                _logger.LogInformation("Successfully sent Gmail email to {ToEmail}. Subject: {Subject}", toEmail, subject);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception encountered while sending Gmail email to {ToEmail}", toEmail);
                return ex.GetBaseException().Message;
            }
        }

        private static string GetActionButton(string label, string url)
        {
            return $@"
                <div style=""text-align: center; margin: 28px 0;"">
                    <a href=""{url}"" target=""_blank"" style=""background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 10px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35); letter-spacing: 0.5px;"">
                        {label}
                    </a>
                </div>
            ";
        }

        private static string GetBaseEmailTemplate(string headerTitle, string greeting, string bodyContent)
        {
            return $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
    <title>{headerTitle}</title>
</head>
<body style=""margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;"">
    <table role=""presentation"" style=""width: 100%; border-collapse: collapse; padding: 30px 10px;"">
        <tr>
            <td align=""center"">
                <table role=""presentation"" style=""width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);"">
                    <!-- HEADER -->
                    <tr>
                        <td style=""background: linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #8b5cf6 100%); padding: 36px 32px; text-align: center; color: #ffffff;"">
                            <div style=""font-size: 28px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 6px;"">
                                RESTORE
                            </div>
                            <div style=""font-size: 14px; font-weight: 400; opacity: 0.85; letter-spacing: 0.5px;"">
                                Premium Computer Hardware Store
                            </div>
                            <div style=""width: 50px; height: 3px; background: rgba(255,255,255,0.5); margin: 12px auto 0; border-radius: 2px;""></div>
                            <div style=""font-size: 17px; font-weight: 500; opacity: 0.95; margin-top: 14px;"">
                                {headerTitle}
                            </div>
                        </td>
                    </tr>
                    <!-- CONTENT -->
                    <tr>
                        <td style=""padding: 36px 32px; color: #1e293b;"">
                            <h2 style=""margin-top: 0; margin-bottom: 20px; font-size: 20px; font-weight: 700; color: #0f172a;"">
                                {greeting}
                            </h2>
                            {bodyContent}
                        </td>
                    </tr>
                    <!-- FOOTER -->
                    <tr>
                        <td style=""background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 13px; line-height: 1.6;"">
                            <p style=""margin: 0 0 4px 0; color: #64748b; font-weight: 600; font-size: 14px;"">
                                VMart
                            </p>
                            <p style=""margin: 0 0 8px 0; color: #94a3b8; font-size: 12px;"">
                                Premium Computer Hardware Store &bull; Cairo, Vietnam 
                            </p>
                            <p style=""margin: 0 0 8px 0;"">
                                Questions? Contact us at <a href=""mailto:support@restore.com"" style=""color: #6366f1; text-decoration: none; font-weight: 500;"">support@restore.com</a>
                            </p>
                            <p style=""margin: 0; font-size: 11px; color: #cbd5e1;"">
                                &copy; {DateTime.UtcNow.Year} VMart. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
";
        }
        #endregion
    }
}
