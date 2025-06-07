using VideoGamesBacklogBackend.Models;
using System.Text.Json.Serialization;

namespace VideoGamesBacklogBackend.Dto
{
    public class GameFiltersDto
    {
        [JsonPropertyName("Status")]
        public List<GameStatus>? Status { get; set; }
        
        [JsonPropertyName("Platform")]
        public List<string>? Platform { get; set; }
        
        [JsonPropertyName("genre")]
        public List<string>? Genre { get; set; }
        
        [JsonPropertyName("PriceRange")]
        public decimal[]? PriceRange { get; set; }
        
        [JsonPropertyName("hoursRange")]
        public int[]? HoursRange { get; set; }
        
        [JsonPropertyName("MetacriticRange")]
        public int[]? MetacriticRange { get; set; }
        
        [JsonPropertyName("PurchaseDate")]
        public string? PurchaseDate { get; set; }
    }
}
