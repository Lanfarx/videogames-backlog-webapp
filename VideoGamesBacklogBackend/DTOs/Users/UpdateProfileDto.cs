using JetBrains.Annotations;
using VideoGamesBacklogBackend.Entities;

namespace VideoGamesBacklogBackend.DTOs.Users;

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class UpdateProfileDto
{
    public string? FullName { get; set; }
    public string? Bio { get; set; }
    public string? Avatar { get; set; }
    public string? Tags { get; set; }
    public string? SteamId { get; set; }
    public PrivacySettings? PrivacySettings { get; set; }
    public AppPreferences? AppPreferences { get; set; }
}