using JetBrains.Annotations;
// ReSharper disable EntityFramework.ModelValidation.UnlimitedStringLength
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace VideoGamesBacklogBackend.Entities;

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class User : IdentityUser<int>
{
    // Proprietà IdentityUser: ID, UserName, Email, PasswordHash, ecc.
    public string? FullName { get; set; }
    public string? Bio { get; set; }
    public string? Avatar { get; set; }
    public DateTime MemberSince { get; set; } = DateTime.UtcNow;
    public string? Tags { get; set; }
    public PrivacySettings PrivacySettings { get; set; } = new();
    [Column("steamId")]
    public string? SteamId { get; set; }
    public AppPreferences AppPreferences { get; set; } = new();

    // Relazione uno-a-molti: un utente ha molti giochi nella sua libreria
    public List<Game> Library { get; set; } = [];

    // Relazione uno-a-molti: un utente ha molti giochi nella sua wishlist
    public List<Wishlist> Wishlist { get; set; } = [];
}

[Owned]
[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class PrivacySettings
{
    public bool IsPrivate { get; set; }
    public bool ShowStats { get; set; } = true;
    public bool ShowDiary { get; set; } = true;
    public bool FriendRequests { get; set; } = true;
}

[Owned]
[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class AppPreferences
{
    public string Language { get; set; } = "it";
    public string Theme { get; set; } = "light";
    public string AccentColor { get; set; } = "arancione";
    public string DateFormat { get; set; } = "dd/MM/yyyy";
    public bool Notifications { get; set; }
}