using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace VideoGamesBacklogBackend.Controllers.Common;

[ApiController]
[Route("api/[controller]")]
public class HowLongToBeatController : ControllerBase
{
    private static readonly HttpClient HttpClient = new();

    static HowLongToBeatController()
    {
        HttpClient.BaseAddress = new Uri("https://howlongtobeat.com/");
        HttpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        HttpClient.DefaultRequestHeaders.Add("origin", "https://howlongtobeat.com");
        HttpClient.DefaultRequestHeaders.Add("referer", "https://howlongtobeat.com/");
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return BadRequest("Query parameter is required.");
        }

        try
        {
            var payload = new
            {
                searchType = "games",
                searchTerms = query.Split([' '], StringSplitOptions.RemoveEmptyEntries),
                searchPage = 1,
                size = 5,
                searchOptions = new
                {
                    games = new
                    {
                        userId = 0,
                        platform = "",
                        sortCategory = "popular",
                        rangeCategory = "main",
                        rangeTime = new { min = (int?)null, max = (int?)null },
                        gameplay = new { perspective = "", flow = "", genre = "" },
                        modifier = ""
                    },
                    users = new { sortCategory = "postcount" }
                }
            };

            var response = await HttpClient.PostAsJsonAsync("api/search", payload);
                
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, "Failed to connect to HowLongToBeat");
            }

            var content = await response.Content.ReadAsStringAsync();
            using var jsonDoc = JsonDocument.Parse(content);
            var dataElement = jsonDoc.RootElement.GetProperty("data");
                
            var results = new List<object>();

            foreach (var item in dataElement.EnumerateArray())
            {
                _ = item.TryGetProperty("comp_main", out var m) ? m.GetInt32() : 0;
                var compPlus = item.TryGetProperty("comp_plus", out var p) ? p.GetInt32() : 0;
                var comp100 = item.TryGetProperty("comp_100", out var c) ? c.GetInt32() : 0;
                var gameName = item.TryGetProperty("game_name", out var gn) ? gn.GetString() : "";
                    
                results.Add(new {
                    name = gameName,
                    mainExtra = Math.Round(compPlus / 3600.0, 1),
                    completionist = Math.Round(comp100 / 3600.0, 1)
                });
            }

            return Ok(results);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}