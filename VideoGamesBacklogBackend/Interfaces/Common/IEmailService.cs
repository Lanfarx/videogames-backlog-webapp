using VideoGamesBacklogBackend.Entities;

namespace VideoGamesBacklogBackend.Interfaces.Common
{
    public interface IEmailService
    {
        Task<bool> SendPasswordResetEmailAsync(User user, string resetToken);
    }
}
