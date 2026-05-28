namespace VideoGamesBacklogBackend.Entities;

/// <summary>
/// Interfaccia per entità possedute da un utente (Game, Wishlist, Notification).
/// Permette di scrivere metodi generici di validazione ownership.
/// </summary>
public interface IUserOwnedEntity
{
    int Id { get; set; }
    int UserId { get; set; }
    User? User { get; set; }
}