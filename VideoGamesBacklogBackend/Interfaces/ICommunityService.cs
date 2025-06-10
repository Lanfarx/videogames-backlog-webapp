using VideoGamesBacklogBackend.Dto;

namespace VideoGamesBacklogBackend.Interfaces
{
    public interface ICommunityService
    {
        /// <summary>
        /// Ottiene le statistiche aggregate della community per un gioco specifico
        /// </summary>
        /// <param name="gameTitle">Titolo del gioco</param>
        /// <returns>Statistiche aggregate della community</returns>
        Task<CommunityStatsDto> GetCommunityStatsAsync(string gameTitle);        /// <summary>
        /// Ottiene il rating medio della community per un gioco specifico
        /// </summary>
        /// <param name="gameTitle">Titolo del gioco</param>
        /// <returns>Rating medio della community</returns>
        Task<decimal> GetCommunityRatingAsync(string gameTitle);

        /// <summary>
        /// Ottiene il rating medio della community con numero di recensioni per un gioco specifico
        /// </summary>
        /// <param name="gameTitle">Titolo del gioco</param>
        /// <returns>Rating medio e numero di recensioni della community</returns>
        Task<CommunityRatingDto> GetCommunityRatingWithCountAsync(string gameTitle);

        /// <summary>
        /// Ottiene i rating della community per una lista di giochi
        /// </summary>
        /// <param name="gameTitles">Lista dei titoli dei giochi</param>
        /// <returns>Dizionario con i rating per ogni gioco</returns>
        Task<Dictionary<string, decimal>> GetCommunityRatingsAsync(List<string> gameTitles);

        /// <summary>
        /// Ottiene i rating della community con numero di recensioni per una lista di giochi
        /// </summary>
        /// <param name="gameTitles">Lista dei titoli dei giochi</param>
        /// <returns>Dizionario con i rating e numero di recensioni per ogni gioco</returns>
        Task<Dictionary<string, CommunityRatingDto>> GetCommunityRatingsWithCountAsync(List<string> gameTitles);        /// <summary>
        /// Ottiene tutte le recensioni per un gioco specifico con paginazione (autenticato)
        /// Esclude le recensioni dell'utente corrente
        /// </summary>
        /// <param name="gameTitle">Titolo del gioco</param>
        /// <param name="page">Numero di pagina</param>
        /// <param name="pageSize">Dimensione della pagina</param>
        /// <param name="currentUserId">ID dell'utente corrente da escludere dai risultati</param>
        /// <returns>Lista paginata delle recensioni</returns>
        Task<PaginatedReviewsDto> GetReviewsAsync(string gameTitle, int page, int pageSize, int? currentUserId = null);

        /// <summary>
        /// Ottiene tutte le recensioni pubbliche per un gioco specifico con paginazione
        /// </summary>
        /// <param name="gameTitle">Titolo del gioco</param>
        /// <param name="page">Numero di pagina</param>
        /// <param name="pageSize">Dimensione della pagina</param>
        /// <returns>Lista paginata delle recensioni pubbliche</returns>
        Task<PaginatedReviewsDto> GetPublicReviewsAsync(string gameTitle, int page, int pageSize);

        /// <summary>
        /// Ottiene le statistiche dettagliate delle recensioni per un gioco
        /// </summary>
        /// <param name="gameTitle">Titolo del gioco</param>
        /// <returns>Statistiche dettagliate delle recensioni</returns>
        Task<ReviewStatsDto> GetReviewStatsAsync(string gameTitle);        /// <summary>
        /// Ottiene le top recensioni della community per un gioco
        /// Esclude le recensioni dell'utente corrente
        /// </summary>
        /// <param name="gameTitle">Titolo del gioco</param>
        /// <param name="limit">Numero massimo di recensioni da restituire</param>
        /// <param name="currentUserId">ID dell'utente corrente da escludere dai risultati</param>
        /// <returns>Lista delle top recensioni</returns>
        Task<List<CommunityReviewDto>> GetTopReviewsAsync(string gameTitle, int limit, int? currentUserId = null);

        /// <summary>
        /// Ottiene i commenti per una specifica recensione
        /// </summary>
        /// <param name="reviewGameId">ID del gioco della recensione</param>
        /// <returns>Lista dei commenti alla recensione</returns>
        Task<List<ReviewCommentDto>> GetReviewCommentsAsync(int reviewGameId);

        /// <summary>
        /// Aggiunge un commento a una recensione
        /// </summary>
        /// <param name="createCommentDto">Dati del commento da creare</param>
        /// <param name="authorId">ID dell'autore del commento</param>
        /// <returns>Il commento creato</returns>
        Task<ReviewCommentDto?> AddReviewCommentAsync(CreateReviewCommentDto createCommentDto, int authorId);

        /// <summary>
        /// Elimina un commento a una recensione
        /// </summary>        /// <param name="commentId">ID del commento da eliminare</param>
        /// <param name="userId">ID dell'utente che richiede l'eliminazione</param>
        /// <returns>True se il commento è stato eliminato con successo</returns>
        Task<bool> DeleteReviewCommentAsync(int commentId, int userId);

        /// <summary>
        /// Ottiene i commenti per una specifica attività
        /// </summary>
        /// <param name="activityId">ID dell'attività</param>
        /// <returns>Lista dei commenti all'attività</returns>
        Task<List<ActivityCommentDto>> GetActivityCommentsAsync(int activityId);

        /// <summary>
        /// Aggiunge un commento a una attività
        /// </summary>
        /// <param name="createCommentDto">Dati del commento da creare</param>
        /// <param name="authorId">ID dell'autore del commento</param>
        /// <returns>Il commento creato</returns>
        Task<ActivityCommentDto?> AddActivityCommentAsync(CreateActivityCommentDto createCommentDto, int authorId);

        /// <summary>
        /// Elimina un commento a una attività
        /// </summary>
        /// <param name="commentId">ID del commento da eliminare</param>
        /// <param name="userId">ID dell'utente che richiede l'eliminazione</param>
        /// <returns>True se il commento è stato eliminato con successo</returns>
        Task<bool> DeleteActivityCommentAsync(int commentId, int userId);
    }
}
