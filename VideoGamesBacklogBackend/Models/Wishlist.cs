using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace VideoGamesBacklogBackend.Models
{
    public class Wishlist
    {
        [Key]
        public int Id { get; set; }        [Required]
        public string Title { get; set; } = string.Empty;
        
        public string? CoverImage { get; set; }
        
        public int ReleaseYear { get; set; }
        
        public string[] Genres { get; set; } = Array.Empty<string>();
        
        public int Metacritic { get; set; }
        
        // Data di aggiunta alla wishlist
        public string AddedDate { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd");
        
        // ID del gioco su RAWG per poter recuperare i dettagli
        public int RawgId { get; set; }
        
        // Note personali dell'utente per questo gioco
        public string? Notes { get; set; }

        // Foreign key per l'utente proprietario
        [ForeignKey("User")]
        public int UserId { get; set; }
        [JsonIgnore] // Evita il loop di serializzazione
        public User? User { get; set; }
    }
}
