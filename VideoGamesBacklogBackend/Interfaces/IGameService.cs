using System.Security.Claims;
using VideoGamesBacklogBackend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VideoGamesBacklogBackend.Interfaces
{
    public interface IGameService
    {
        Task<List<Game>> GetAllGamesAsync(ClaimsPrincipal userClaims);
        Task<Game?> GetGameByIdAsync(ClaimsPrincipal userClaims, int gameId);
        Task<Game> AddGameAsync(ClaimsPrincipal userClaims, Game game);
        Task<Game?> UpdateGameAsync(ClaimsPrincipal userClaims, int gameId, Game updatedGame);
        Task<bool> DeleteGameAsync(ClaimsPrincipal userClaims, int gameId);
        // Commenti
        Task<GameComment?> AddCommentAsync(ClaimsPrincipal userClaims, int gameId, GameComment comment);
        Task<bool> DeleteCommentAsync(ClaimsPrincipal userClaims, int gameId, int commentId);
    }
}
