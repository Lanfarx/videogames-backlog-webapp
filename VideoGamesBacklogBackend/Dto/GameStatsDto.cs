namespace VideoGamesBacklogBackend.Dto
{
    public class GameStatsDto
    {
        public int Total { get; set; }
        public int InProgress { get; set; }
        public int Completed { get; set; }
        public int NotStarted { get; set; }
        public int Abandoned { get; set; }
        public int Platinum { get; set; }
        public decimal TotalHours { get; set; }
        
        // Statistiche sui prezzi
        public decimal TotalSpent { get; set; }
        public decimal AveragePrice { get; set; }
        public int FreeGames { get; set; }
        public decimal HighestPrice { get; set; }
        public string? HighestPriceGameTitle { get; set; }
        public decimal CostPerHour { get; set; }
    }
}
