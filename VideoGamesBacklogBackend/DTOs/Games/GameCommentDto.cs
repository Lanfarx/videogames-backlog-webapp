using JetBrains.Annotations;
namespace VideoGamesBacklogBackend.DTOs.Games;

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class GameCommentDto
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public string Text { get; set; } = string.Empty;
    public int GameId { get; set; }
}

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class CreateGameCommentDto
{
    public DateTime Date { get; set; }
    public string Text { get; set; } = string.Empty;
}