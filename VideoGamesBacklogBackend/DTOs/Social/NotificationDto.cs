using JetBrains.Annotations;
namespace VideoGamesBacklogBackend.DTOs.Social;

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class NotificationDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
    public object? Data { get; set; }
}

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class CreateNotificationDto
{
    public int UserId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public object? Data { get; set; }
}

[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public class NotificationCountDto
{
    public int Count { get; set; }
}