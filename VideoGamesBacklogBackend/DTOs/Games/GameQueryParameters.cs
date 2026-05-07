using VideoGamesBacklogBackend.Common.DTOs.Pagination;

namespace VideoGamesBacklogBackend.DTOs.Games
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
