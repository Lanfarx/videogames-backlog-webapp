using System.Net;
using System.Text.Json;

namespace VideoGamesBacklogBackend.Helpers
{
    public class GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Errore intercettato dal Global Middleware: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            
            // Mapping delle eccezioni a Status Code HTTP
            var statusCode = exception switch
            {
                KeyNotFoundException => (int)HttpStatusCode.NotFound,
                UnauthorizedAccessException => (int)HttpStatusCode.Forbidden, // O Unauthorized a seconda dei casi
                ArgumentException => (int)HttpStatusCode.BadRequest,
                InvalidOperationException => (int)HttpStatusCode.BadRequest,
                _ => (int)HttpStatusCode.InternalServerError
            };

            context.Response.StatusCode = statusCode;

            // Mascheriamo i messaggi 500 per sicurezza (in prod), mostriamo gli altri
            var message = statusCode == 500 ? "Si è verificato un errore interno del server." : exception.Message;

            var response = new
            {
                message = message,
                errorType = exception.GetType().Name
            };

            return context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
