using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace VideoGamesBacklogBackend.Models
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // friend_request, friend_accepted, friend_rejected
        
        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsRead { get; set; } = false;
        
        // JSON data per informazioni aggiuntive (userId, requestId, etc.)
        public string? Data { get; set; }
        
        // Relazioni
        [ForeignKey("UserId")]
        [JsonIgnore]
        public User? User { get; set; }
    }
}
