using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;
using VideoGamesBacklogBackend.Common.Configuration;
using VideoGamesBacklogBackend.Entities;
using VideoGamesBacklogBackend.Infrastructure.Data;
using VideoGamesBacklogBackend.Infrastructure.Middleware;
using VideoGamesBacklogBackend.Mappers;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using FluentValidation;
using FluentValidation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);


// Carica variabili d'ambiente dal file .env solo se non siamo in Docker
if (Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") != "true")
{
    var envFile = Path.Combine(Directory.GetCurrentDirectory(), "..", ".env");
    if (File.Exists(envFile))
    {
        foreach (var line in File.ReadAllLines(envFile))
        {
            if (line.StartsWith('#') || string.IsNullOrWhiteSpace(line)) continue;
            
            var parts = line.Split('=', 2);
            if (parts.Length == 2)
            {
                Environment.SetEnvironmentVariable(parts[0].Trim(), parts[1].Trim());
            }
        }
    }
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        var rawOrigins = Environment.GetEnvironmentVariable("CORS_ORIGINS") ?? "";
        var configuredOrigins = rawOrigins
            .Split(new[] { ',', ';', ' ' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        configuredOrigins.Add("https://videogames-backlog-webapp.vercel.app");
        configuredOrigins.Add("http://localhost:3000");
        configuredOrigins.Add("http://localhost:5173");

        policy.SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin)) return false;

                if (configuredOrigins.Contains(origin)) return true;

                if (Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                {
                    if (uri.Host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase))
                        return true;
                    if (uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) || uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase))
                        return true;
                }

                return false;
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .Select(e => new { Field = e.Key, Errors = e.Value?.Errors.Select(x => x.ErrorMessage).ToList() })
                .ToList();
                
            logger.LogWarning("Validation failed for {Path}. Errors: {@Errors}", context.HttpContext.Request.Path, errors);
            
            var problemDetails = new Microsoft.AspNetCore.Mvc.ValidationProblemDetails(context.ModelState)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "One or more validation errors occurred.",
                Instance = context.HttpContext.Request.Path
            };
            
            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(problemDetails);
        };
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v1",
        Title = "VideoGames Backlog API",
        Description = "API per la gestione del backlog dei videogiochi"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Inserisci 'Bearer' seguito da uno spazio e poi il token"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// CONFIGURAZIONE DATABASE 
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");
    if (string.IsNullOrEmpty(connectionString))
    {
        throw new InvalidOperationException("DATABASE_URL environment variable is required but not set.");
    }
    
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.CommandTimeout(120);
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorCodesToAdd: null
        );
    });
    
    // Logging solo in development
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.LogTo(Console.WriteLine, LogLevel.Information);
    }
    
    options.EnableServiceProviderCaching(false);
});

builder.Services.AddIdentity<User, IdentityRole<int>>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.Configure<IdentityOptions>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
});

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>() 
                   ?? new JwtSettings 
                   { 
                       SecretKey = "hKJ8gQ2vP6nR9xM4L7wE1tY5uI8oP3qA6sD9fG2hJ5kN8mQ1wE4rT7yU0iO6pS3dF",
                       Issuer = "VideoGamesBacklogAPI",
                       Audience = "VideoGamesBacklogUsers",
                       ExpiryMinutes = 60
                   };

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey))
    };
});

builder.Services.AddAuthorization();

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("PublicApi", policy =>
    {
        policy.PermitLimit = 100;
        policy.Window = TimeSpan.FromMinutes(1);
        policy.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        policy.QueueLimit = 5;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// Configurazione Email Settings
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));

// Configurazione Steam Settings
builder.Services.Configure<SteamSettings>(options => {
    options.ApiKey = builder.Configuration["SteamApiKey"] 
                   ?? Environment.GetEnvironmentVariable("STEAM_API_KEY") 
                   ?? string.Empty;
});

// Configurazione RAWG Settings
builder.Services.Configure<RawgSettings>(options => {
    options.ApiKey = builder.Configuration["RawgApiKey"] 
                   ?? builder.Configuration["RAWG_API_KEY"]
                   ?? Environment.GetEnvironmentVariable("RAWG_API_KEY") 
                   ?? Environment.GetEnvironmentVariable("RawgApiKey") 
                   ?? Environment.GetEnvironmentVariable("REACT_APP_RAWG_API_KEY") 
                   ?? string.Empty;
});

// Dependency Injection Automatizzata
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<AutoMapperProfile>());
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
var serviceInterfaces = typeof(Program).Assembly.GetTypes()
    .Where(t => t.IsInterface && t.Name.EndsWith("Service") && t.Namespace != null && t.Namespace.StartsWith("VideoGamesBacklogBackend.Interfaces"));

foreach (var serviceInterface in serviceInterfaces)
{
    var implementation = typeof(Program).Assembly.GetTypes()
        .FirstOrDefault(t => t is { IsClass: true, IsAbstract: false } && serviceInterface.IsAssignableFrom(t));

    if (implementation != null)
    {
        builder.Services.AddScoped(serviceInterface, implementation);
    }
}
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

var app = builder.Build();

// CORS abilitato come primissimo middleware per gestire le richieste preflight OPTIONS
app.UseCors("AllowAll");

// Aggiunta del Global Exception Handler Middleware
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

// TEST CONNESSIONE DATABASE ALL'AVVIO (solo un test basico)

try
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    var cts = new CancellationTokenSource(TimeSpan.FromSeconds(10));
    var canConnect = await context.Database.CanConnectAsync(cts.Token);

    Console.WriteLine(canConnect ? "Database connection successful!" : "Database connection failed");
}
catch (Exception ex)
{
    Console.WriteLine($"Database connection error: {ex.Message}");
    Console.WriteLine("Continuing startup - connection will be retried on first request");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("Application started successfully!");
Console.WriteLine($"Environment: {app.Environment.EnvironmentName}");

app.Run();