namespace VideoGamesBacklogBackend.Dto
{
    public class GameQueryParameters : PaginationQueryParameters
    {
        public string? Filters { get; set; }
        public string? Search { get; set; }

        public GameQueryParameters()
        {
            PageSize = 12; // Override default page size for games
        }
    }
}
