using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using VideoGamesBacklogBackend.Interfaces;

namespace VideoGamesBacklogBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RawgController : ControllerBase
    {
        private readonly IRawgService _rawgService;

        public RawgController(IRawgService rawgService)
        {
            _rawgService = rawgService;
        }

        /// <summary>
        /// Endpoint equivalente a getGames() del frontend
        /// </summary>
        [HttpGet("games")]
        public async Task<ActionResult<JsonElement>> GetGames()
        {
            try
            {
                // Converte tutti i query parameters in un dizionario
                var parameters = new Dictionary<string, object>();
                
                foreach (var param in Request.Query)
                {
                    parameters[param.Key] = param.Value.ToString();
                }

                var result = await _rawgService.GetGamesAsync(parameters);
                return Ok(result);
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(500, new { error = "Errore nella chiamata all'API RAWG", details = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Errore interno del server", details = ex.Message });
            }
        }

        /// <summary>
        /// Endpoint equivalente a getGameDetails() del frontend
        /// </summary>
        [HttpGet("games/{gameId}")]
        public async Task<ActionResult<JsonElement>> GetGameDetails(string gameId)
        {
            try
            {
                var result = await _rawgService.GetGameDetailsAsync(gameId);
                return Ok(result);
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(500, new { error = "Errore nella chiamata all'API RAWG", details = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Errore interno del server", details = ex.Message });
            }
        }

        /// <summary>
        /// Endpoint equivalente a searchGames() del frontend
        /// </summary>
        [HttpGet("search")]
        public async Task<ActionResult<JsonElement>> SearchGames(
            [FromQuery] string query,
            [FromQuery] string? platforms = null)
        {
            if (string.IsNullOrEmpty(query))
            {
                return BadRequest(new { error = "Query di ricerca richiesta" });
            }

            try
            {
                var result = await _rawgService.SearchGamesAsync(query, platforms);
                return Ok(result);
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(500, new { error = "Errore nella chiamata all'API RAWG", details = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Errore interno del server", details = ex.Message });
            }
        }

        /// <summary>
        /// Endpoint equivalente a getPaginatedGames() del frontend
        /// </summary>
        [HttpGet("paginated")]
        public async Task<ActionResult<JsonElement>> GetPaginatedGames(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                // Converte i parametri extra dai query parameters
                var extraParams = new Dictionary<string, object>();
                
                foreach (var param in Request.Query)
                {
                    if (param.Key != "page" && param.Key != "pageSize")
                    {
                        extraParams[param.Key] = param.Value.ToString();
                    }
                }

                var result = await _rawgService.GetPaginatedGamesAsync(page, pageSize, extraParams);
                return Ok(result);
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(500, new { error = "Errore nella chiamata all'API RAWG", details = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Errore interno del server", details = ex.Message });
            }
        }

        /// <summary>
        /// Endpoint equivalente a getSimilarGames() del frontend
        /// </summary>
        [HttpGet("similar")]
        public async Task<ActionResult<JsonElement>> GetSimilarGames(
            [FromQuery] string genreIds,
            [FromQuery] int excludeId,
            [FromQuery] int count = 4,
            [FromQuery] int? metacritic = null)
        {
            if (string.IsNullOrEmpty(genreIds))
            {
                return BadRequest(new { error = "genreIds è richiesto" });
            }

            try
            {
                var result = await _rawgService.GetSimilarGamesAsync(genreIds, excludeId, count, metacritic);
                return Ok(result);
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(500, new { error = "Errore nella chiamata all'API RAWG", details = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Errore interno del server", details = ex.Message });
            }
        }

        /// <summary>
        /// Ottieni lista piattaforme disponibili
        /// </summary>
        [HttpGet("platforms")]
        public async Task<ActionResult<JsonElement>> GetPlatforms()
        {
            try
            {
                var result = await _rawgService.GetPlatformsAsync();
                return Ok(result);
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(500, new { error = "Errore nella chiamata all'API RAWG", details = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Errore interno del server", details = ex.Message });
            }
        }

        /// <summary>
        /// Ottieni lista generi disponibili
        /// </summary>
        [HttpGet("genres")]
        public async Task<ActionResult<JsonElement>> GetGenres()
        {
            try
            {
                var result = await _rawgService.GetGenresAsync();
                return Ok(result);
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(500, new { error = "Errore nella chiamata all'API RAWG", details = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Errore interno del server", details = ex.Message });
            }
        }
    }
}