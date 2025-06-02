namespace VideoGamesBacklogBackend.Dto
{
    public class PaginatedGamesDto
    {
        public List<object> Games { get; set; } = new List<object>();
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public int TotalItems { get; set; }
        public int PageSize { get; set; }
        public bool HasNextPage { get; set; }
        public bool HasPreviousPage { get; set; }
    }
}
