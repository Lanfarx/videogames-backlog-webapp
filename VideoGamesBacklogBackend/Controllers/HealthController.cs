using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VideoGamesBacklogBackend.Data;

namespace VideoGamesBacklogBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<HealthController> _logger;

        public HealthController(AppDbContext context, ILogger<HealthController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
                var canConnect = await _context.Database.CanConnectAsync(cts.Token);
                if (canConnect)
                {
                    return Ok(new {
                        status = "healthy",
                        timestamp = DateTime.UtcNow,
                        database = "connected",
                        environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "unknown"
                    });
                }
                else
                {
                    return StatusCode(503, new {
                        status = "unhealthy",
                        timestamp = DateTime.UtcNow,
                        database = "disconnected",
                        error = "Cannot connect to database"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Health check failed");
                return StatusCode(503, new {
                    status = "unhealthy",
                    timestamp = DateTime.UtcNow,
                    database = "error",
                    error = ex.Message
                });
            }
        }
    }
}