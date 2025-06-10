using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VideoGamesBacklogBackend.Models
{
    public class Friendship
    {
        public int Id { get; set; }
        
        [Required]
        public int SenderId { get; set; }
        
        [Required]
        public int ReceiverId { get; set; }
        
        [Required]
        public FriendshipStatus Status { get; set; } = FriendshipStatus.Pending;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? AcceptedAt { get; set; }
        
        // Navigation properties
        [ForeignKey("SenderId")]
        public User Sender { get; set; } = null!;
        
        [ForeignKey("ReceiverId")]
        public User Receiver { get; set; } = null!;
    }
    
    public enum FriendshipStatus
    {
        Pending = 0,    // Richiesta in attesa
        Accepted = 1,   // Amicizia accettata
        Rejected = 2,   // Richiesta rifiutata
        Blocked = 3     // Utente bloccato
    }
}
