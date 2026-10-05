using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VideoGamesBacklogBackend.DTOs.Catalog;
using VideoGamesBacklogBackend.Interfaces.Catalog;

namespace VideoGamesBacklogBackend.Controllers.Catalog;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CatalogController(ICatalogService catalogService) : ControllerBase
{
    [HttpGet("search")]
    public async Task<ActionResult<CatalogSearchResultDto>> Search(
        [FromQuery] string query,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Ok(new CatalogSearchResultDto());
        }

        var results = await catalogService.SearchGamesAsync(query, cancellationToken);
        return Ok(results);
    }

    [HttpGet("games")]
    public async Task<ActionResult<CatalogSearchResultDto>> GetPaginatedGames(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? ordering = null,
        [FromQuery] string? platforms = null,
        CancellationToken cancellationToken = default)
    {
        var results = await catalogService.GetPaginatedGamesAsync(
            page,
            pageSize,
            search,
            ordering,
            platforms,
            cancellationToken);

        return Ok(results);
    }

    [HttpGet("games/{id}")]
    public async Task<ActionResult<CatalogGameDto>> GetGameDetails(
        string id,
        CancellationToken cancellationToken)
    {
        var game = await catalogService.GetGameDetailsAsync(id, cancellationToken);
        if (game == null)
        {
            return NotFound(new { message = $"Gioco con ID '{id}' non trovato nel catalogo." });
        }

        return Ok(game);
    }

    [HttpGet("similar")]
    public async Task<ActionResult<List<CatalogGameDto>>> GetSimilarGames(
        [FromQuery] string? genres,
        [FromQuery] int excludeId,
        [FromQuery] int count = 4,
        [FromQuery] int? metacritic = null,
        CancellationToken cancellationToken = default)
    {
        var genreIds = new List<int>();
        if (!string.IsNullOrWhiteSpace(genres))
        {
            foreach (var part in genres.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            {
                if (int.TryParse(part, out var gId))
                {
                    genreIds.Add(gId);
                }
            }
        }

        var results = await catalogService.GetSimilarGamesAsync(
            genreIds,
            excludeId,
            count,
            metacritic,
            cancellationToken);

        return Ok(results);
    }
}
