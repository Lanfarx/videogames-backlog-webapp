using JetBrains.Annotations;
namespace VideoGamesBacklogBackend.DTOs.Games;

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class BulkGamesDto
{
    public List<int> GameIds { get; set; } = [];
}

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class BulkGamesStatusDto : BulkGamesDto
{
    public string Status { get; set; } = string.Empty;
}
