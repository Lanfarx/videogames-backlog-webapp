using JetBrains.Annotations;
using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.DTOs.Games;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.Infrastructure.Data;
using VideoGamesBacklogBackend.Interfaces.Games;

namespace VideoGamesBacklogBackend.Services.Games;

// Serie storiche della dashboard che non si possono ricavare dai soli giochi in memoria nel client
[UsedImplicitly]
public class DashboardService(AppDbContext dbContext) : IDashboardService
{
    private const int MonthsShown = 12;
    private const int DaysShown = 365;

    public async Task<DashboardDto> GetDashboardAsync(int userId)
    {
        var now = DateTime.UtcNow;
        var thisMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var months = Enumerable.Range(0, MonthsShown).Select(i => thisMonth.AddMonths(i - MonthsShown + 1)).ToList();

        return new DashboardDto
        {
            HoursPerMonth = await GetHoursPerMonthAsync(userId, months),
            BacklogTrend = await GetBacklogTrendAsync(userId, months),
            HoursPerDay = await GetHoursPerDayAsync(userId, now.Date.AddDays(1 - DaysShown))
        };
    }

    private async Task<List<MonthValueDto>> GetHoursPerMonthAsync(int userId, List<DateTime> months)
    {
        var from = months[0];
        var deltas = await dbContext.Activities
            .Where(a => a.Type == ActivityType.Played && a.UserId == userId && a.Timestamp >= from)
            .Select(a => new { a.Timestamp, a.HoursDelta })
            .ToListAsync();

        // Le correzioni al ribasso possono rendere negativo un mese: non è un dato da mostrare
        return months
            .Select(m => new MonthValueDto(FormatMonth(m),
                Math.Max(0, deltas.Where(d => d.Timestamp.Year == m.Year && d.Timestamp.Month == m.Month).Sum(d => d.HoursDelta))))
            .ToList();
    }

    // Ore per giorno dalle sessioni registrate: i giorni senza ore non compaiono.
    // Le ore Steam sono attribuite al giorno della sincronizzazione, non a quello in cui si è giocato davvero.
    private async Task<List<DayValueDto>> GetHoursPerDayAsync(int userId, DateTime from)
    {
        var deltas = await dbContext.Activities
            .Where(a => a.Type == ActivityType.Played && a.UserId == userId && a.Timestamp >= from && a.HoursDelta > 0)
            .Select(a => new { a.Timestamp, a.HoursDelta })
            .ToListAsync();

        return deltas
            .GroupBy(d => d.Timestamp.Date)
            .OrderBy(g => g.Key)
            .Select(g => new DayValueDto(g.Key.ToString("yyyy-MM-dd"), g.Sum(d => d.HoursDelta)))
            .ToList();
    }

    // Giochi da iniziare a fine mese: entrati in libreria entro quella data e non ancora iniziati.
    // L'inizio è la prima attività non "Added"; chi non è più da iniziare e non ha attività conta come iniziato al suo ingresso.
    // Approssimato: i giochi eliminati non compaiono nella storia.
    private async Task<List<MonthValueDto>> GetBacklogTrendAsync(int userId, List<DateTime> months)
    {
        var games = await dbContext.Games
            .Where(g => g.UserId == userId)
            .Select(g => new { g.Id, g.Status, g.PurchaseDate, g.AddedAt })
            .ToListAsync();
        var firstStarts = await dbContext.Activities
            .Where(a => a.Type != ActivityType.Added && a.UserId == userId && a.GameId != null) // null = gioco eliminato
            .GroupBy(a => a.GameId!.Value)
            .Select(g => new { GameId = g.Key, Start = g.Min(a => a.Timestamp) })
            .ToDictionaryAsync(x => x.GameId, x => x.Start);

        var timeline = games.Select(g =>
        {
            var entry = g.PurchaseDate?.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc) ?? g.AddedAt;
            DateTime? start = g.Status == GameStatus.NotStarted ? null : firstStarts.GetValueOrDefault(g.Id, entry);
            return (Entry: entry, Start: start);
        }).ToList();

        return months
            .Select(m =>
            {
                var monthEnd = m.AddMonths(1);
                return new MonthValueDto(FormatMonth(m), timeline.Count(t => t.Entry < monthEnd && (t.Start == null || t.Start >= monthEnd)));
            })
            .ToList();
    }

    private static string FormatMonth(DateTime month) => month.ToString("yyyy-MM");
}
