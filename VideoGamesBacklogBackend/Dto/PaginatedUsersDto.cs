namespace VideoGamesBacklogBackend.Dto
{
    public class PaginatedUsersDto
    {
        public List<PublicProfileDto> Users { get; set; } = [];
        public int TotalCount { get; set; }
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public int PageSize { get; set; }
    }
}
