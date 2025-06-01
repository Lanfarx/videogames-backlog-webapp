using System.Security.Claims;
using VideoGamesBacklogBackend.Models;
using VideoGamesBacklogBackend.Dto;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VideoGamesBacklogBackend.Interfaces
{    public interface IGameService
    {
        Task<List<Game>> GetAllGamesAsync(ClaimsPrincipal userClaims);
        Task<Game?> GetGameByIdAsync(ClaimsPrincipal userClaims, int gameId);
        Task<Game?> GetGameByTitleAsync(ClaimsPrincipal userClaims, string title);
        Task<Game> AddGameAsync(ClaimsPrincipal userClaims, Game game);
        Task<Game?> UpdateGameAsync(ClaimsPrincipal userClaims, int gameId, UpdateGameDto updateDto);
        Task<Game?> UpdateGameStatusAsync(ClaimsPrincipal userClaims, int gameId, string status);
        Task<Game?> UpdateGamePlaytimeAsync(ClaimsPrincipal userClaims, int gameId, int hoursPlayed);
        Task<bool> DeleteGameAsync(ClaimsPrincipal userClaims, int gameId);
        Task<GameStatsDto> GetGameStatsAsync(ClaimsPrincipal userClaims);
        Task<List<GameComment>> GetCommentsAsync(ClaimsPrincipal userClaims, int gameId);
        Task<GameComment?> AddCommentAsync(ClaimsPrincipal userClaims, int gameId, GameComment comment);
        Task<bool> DeleteCommentAsync(ClaimsPrincipal userClaims, int gameId, int commentId);
        Task<GameComment?> UpdateCommentAsync(ClaimsPrincipal userClaims, int gameId, int commentId, GameComment updatedComment);
    }
}
