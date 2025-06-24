using VideoGamesBacklogBackend.Models;

namespace VideoGamesBacklogBackend.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendPasswordResetEmailAsync(User user, string resetToken);
    }
}
