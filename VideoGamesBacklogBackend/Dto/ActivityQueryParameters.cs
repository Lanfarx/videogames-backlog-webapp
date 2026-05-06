using VideoGamesBacklogBackend.Entities;

namespace VideoGamesBacklogBackend.Dto
{
    public class ActivityQueryParameters : PaginationQueryParameters
    {
        public ActivityType[]? Types { get; set; }
        public int? Year { get; set; }
        public int? Month { get; set; }
        public int? GameId { get; set; }

        public ActivityQueryParameters()
        {
            PageSize = 20;
        }
    }
}
