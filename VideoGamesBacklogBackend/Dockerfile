# Dockerfile per il Backend .NET 8 ottimizzato per Render
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia il file di progetto
COPY ["VideoGamesBacklogBackend.csproj", "./"]
RUN dotnet restore "VideoGamesBacklogBackend.csproj"

# Copia il resto del codice
COPY . .
RUN dotnet build "VideoGamesBacklogBackend.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "VideoGamesBacklogBackend.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Configura l'app per ascoltare sulla porta 8080 (usata da Render)
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "VideoGamesBacklogBackend.dll"]
