using System.Security.Claims;

namespace VideoGamesBacklogBackend.Common.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        /// <summary>
        /// Estrae l'ID Utente dal token JWT. Lancia un'eccezione se non presente o invalido.
        /// </summary>
        public static int GetUserId(this ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : throw new UnauthorizedAccessException("User ID non valido o mancante nel token.");
        }

        /// <summary>
        /// Estrae opzionalmente l'ID Utente dal token JWT. Ritorna null se non autenticato.
        /// </summary>
        public static int? GetOptionalUserId(this ClaimsPrincipal user)
        {
            if (user?.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userIdClaim, out var userId))
                {
                    return userId;
                }
            }
            return null;
        }
    }
}
