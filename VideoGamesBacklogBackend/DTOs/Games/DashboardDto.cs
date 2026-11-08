namespace VideoGamesBacklogBackend.DTOs.Games;

// Month = "yyyy-MM"
public record MonthValueDto(string Month, int Value);

public class DashboardDto
{
    public List<MonthValueDto> HoursPerMonth { get; set; } = [];
    public List<MonthValueDto> BacklogTrend { get; set; } = [];
}
