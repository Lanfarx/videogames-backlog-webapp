using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VideoGamesBacklogBackend.Models
{
    public class User : IdentityUser<int> // Usa int come PK
    {
        // Proprietà IdentityUser: Id, UserName, Email, PasswordHash, ecc.
        public string? FullName { get; set; } // Nome completo
        public string? Bio { get; set; } // Biografia
        public string? Avatar { get; set; } // URL avatar
        public DateTime MemberSince { get; set; } = DateTime.UtcNow;
        public string? Tags { get; set; } // Tag preferenze (serializzate come stringa separata da virgole)
        public PrivacySettings PrivacySettings { get; set; } = new PrivacySettings();
        public string? steamId { get; set; } // ID Steam per integrazione
        public AppPreferences AppPreferences { get; set; } = new AppPreferences();

        // Relazione uno-a-molti: un utente ha molti giochi nella sua libreria
        public List<Game> Library { get; set; } = new List<Game>();
    }

    [Owned]
    public class PrivacySettings
    {
        public bool IsPrivate { get; set; } = false; // Privacy profilo
        public bool ShowStats { get; set; } = true; // Mostra statistiche
        public bool ShowDiary { get; set; } = true; // Mostra diario
        public bool FriendRequests { get; set; } = true; // Richieste di amicizia
    }

    [Owned]
    public class AppPreferences
    {
        public string Language { get; set; } = "it"; // Lingua
        public string Theme { get; set; } = "light"; // Tema
        public string AccentColor { get; set; } = "arancione"; // Colore accento
        public string DateFormat { get; set; } = "dd/MM/yyyy"; // Formato data
        public bool Notifications { get; set; } = false; // Notifiche
    }
}
