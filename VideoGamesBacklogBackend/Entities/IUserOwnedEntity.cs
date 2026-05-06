namespace VideoGamesBacklogBackend.Entities
{
    /// <summary>
    /// Interfaccia per entità possedute da un utente (Game, Wishlist, Notification).
    /// Permette di scrivere metodi generici di validazione ownership.
    /// </summary>
    public interface IUserOwnedEntity
    {
        int UserId { get; set; }
        User? User { get; set; }
    }
}
