using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using System.Web;
using VideoGamesBacklogBackend.Helpers;
using VideoGamesBacklogBackend.Interfaces;
using VideoGamesBacklogBackend.Models;

namespace VideoGamesBacklogBackend.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> emailSettings, ILogger<EmailService> logger)
        {
            _emailSettings = emailSettings.Value;
            _logger = logger;
        }        public async Task<bool> SendPasswordResetEmailAsync(User user, string resetToken)
        {
            try
            {
                var encodedToken = HttpUtility.UrlEncode(resetToken);
                var encodedEmail = HttpUtility.UrlEncode(user.Email);
                var resetLink = $"{_emailSettings.FrontendUrl}/reset-password?email={encodedEmail}&token={encodedToken}";

                var subject = "🔐 Reimposta la tua password - GameBacklog";
                var htmlBody = GeneratePasswordResetEmailHtml(user.UserName!, resetLink);
                var textBody = GeneratePasswordResetEmailText(user.UserName!, resetLink);

                return await SendEmailInternalAsync(user.Email!, subject, htmlBody, textBody);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nell'invio dell'email di reset password per {Email}", user.Email);
                return false;
            }
        }        private async Task<bool> SendEmailInternalAsync(string toEmail, string subject, string htmlBody, string textBody)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_emailSettings.FromName, _emailSettings.FromEmail));
                message.To.Add(new MailboxAddress("", toEmail));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = htmlBody,
                    TextBody = textBody
                };

                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                
                // Configurazione specifica per Gmail - accetta i certificati SSL
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                
                _logger.LogInformation("Tentativo di connessione a {Host}:{Port}", _emailSettings.SmtpHost, _emailSettings.SmtpPort);
                
                // Connessione a Gmail con StartTLS
                await client.ConnectAsync(_emailSettings.SmtpHost, _emailSettings.SmtpPort, SecureSocketOptions.StartTls);

                if (!string.IsNullOrEmpty(_emailSettings.SmtpUsername))
                {
                    _logger.LogInformation("Tentativo di autenticazione per {Username}", _emailSettings.SmtpUsername);
                    await client.AuthenticateAsync(_emailSettings.SmtpUsername, _emailSettings.SmtpPassword);
                    _logger.LogInformation("Autenticazione completata con successo");
                }

                _logger.LogInformation("Invio email in corso...");
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email inviata con successo a {Email}", toEmail);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nell'invio dell'email a {Email}. Dettagli: {Message}", toEmail, ex.Message);
                return false;
            }
        }

        private string GeneratePasswordResetEmailHtml(string userName, string resetLink)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Reimposta Password</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
        .button {{ display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }}
        .footer {{ text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding: 20px; border-top: 1px solid #ddd; }}
        .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }}
    </style>
</head>
<body>
    <div class='header'>
        <h1>🎮 GameBacklog</h1>
        <h2>Reimposta la tua password</h2>
    </div>
    <div class='content'>
        <p>Ciao <strong>{userName}</strong>,</p>
        
        <p>Hai richiesto di reimpostare la password del tuo account GameBacklog. Clicca sul pulsante qui sotto per creare una nuova password:</p>
        
        <div style='text-align: center;'>
            <a href='{resetLink}' class='button'>🔐 Reimposta Password</a>
        </div>
        
        <div class='warning'>
            <strong>⚠️ Importante:</strong>
            <ul>
                <li>Questo link è valido per <strong>1 ora</strong></li>
                <li>Se non hai richiesto tu questa operazione, ignora questa email</li>
                <li>Non condividere mai questo link con nessuno</li>
            </ul>
        </div>
        
        <p>Se il pulsante non funziona, copia e incolla questo link nel tuo browser:</p>
        <p style='word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-size: 12px;'>{resetLink}</p>
        
        <p>Se hai problemi o domande, non esitare a contattarci.</p>
        
        <p>Buon gaming! 🎮<br>
        Il team di GameBacklog</p>
    </div>
    <div class='footer'>
        <p>Questa è una email automatica, non rispondere a questo messaggio.</p>
        <p>© 2025 GameBacklog. Tutti i diritti riservati.</p>
    </div>
</body>
</html>";
        }        private string GeneratePasswordResetEmailText(string userName, string resetLink)
        {
            return $@"
🎮 GameBacklog - Reimposta la tua password

Ciao {userName},

Hai richiesto di reimpostare la password del tuo account GameBacklog.

Per creare una nuova password, visita questo link:
{resetLink}

⚠️ IMPORTANTE:
- Questo link è valido per 1 ora
- Se non hai richiesto tu questa operazione, ignora questa email
- Non condividere mai questo link con nessuno

Se hai problemi o domande, non esitare a contattarci.

Buon gaming! 🎮
Il team di GameBacklog

---
Questa è una email automatica, non rispondere a questo messaggio.
© 2025 GameBacklog. Tutti i diritti riservati.
";
        }
    }
}
