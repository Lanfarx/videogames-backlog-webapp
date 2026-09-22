using JetBrains.Annotations;
using VideoGamesBacklogBackend.Entities;

namespace VideoGamesBacklogBackend.DTOs.Users;

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class UserProfileDto
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? Bio { get; set; }
    public string? Avatar { get; set; }
    public DateTime MemberSince { get; set; }
    public string? Tags { get; set; }
    public string? SteamId { get; set; }
    public PrivacySettings PrivacySettings { get; set; } = new();
    public AppPreferences AppPreferences { get; set; } = new();
}