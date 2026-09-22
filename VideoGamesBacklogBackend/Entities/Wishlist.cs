using JetBrains.Annotations;
// ReSharper disable EntityFramework.ModelValidation.UnlimitedStringLength
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace VideoGamesBacklogBackend.Entities;

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class Wishlist : IUserOwnedEntity
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    public string NormalizedTitle { get; set; } = string.Empty;

    public string? CoverImage { get; set; }

    public int ReleaseYear { get; set; }

    public string[] Genres { get; set; } = [];

    public int? Metacritic { get; set; }

    // Data di aggiunta alla wishlist
    public DateOnly AddedDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);

    // ID del gioco su RAWG per poter recuperare i dettagli
    public int RawgId { get; set; }

    // Note personali dell'utente per questo gioco
    public string? Notes { get; set; }

    // Foreign key per l'utente proprietario (IUserOwnedEntity)
    [ForeignKey("User")]
    public int UserId { get; set; }
    [JsonIgnore]
    public User? User { get; set; }
}