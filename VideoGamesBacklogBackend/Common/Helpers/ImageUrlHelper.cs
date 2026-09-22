namespace VideoGamesBacklogBackend.Common.Helpers;

public static class ImageUrlHelper
{
    private const string RawgPrefix = "rawg:";
    private const string SteamPrefix = "steam:";

    private const string RawgBaseUrl = "https://media.rawg.io/";
    private const string SteamBaseUrl = "https://shared.akamai.steamstatic.com/";

    /// <summary>
    /// Codifica un URL completo in un formato compatto (es. "rawg:media/games/...")
    /// </summary>
    public static string? EncodeImageUrl(string? fullUrl)
    {
        if (string.IsNullOrWhiteSpace(fullUrl))
            return null;

        if (fullUrl.StartsWith(RawgBaseUrl, StringComparison.OrdinalIgnoreCase))
        {
            return RawgPrefix + fullUrl[RawgBaseUrl.Length..];
        }
        
        if (fullUrl.StartsWith(SteamBaseUrl, StringComparison.OrdinalIgnoreCase))
        {
            return SteamPrefix + fullUrl[SteamBaseUrl.Length..];
        }

        // Se è già codificato o se è un URL di un'altra fonte, lo restituisce invariato
        return fullUrl;
    }

    /// <summary>
    /// Decodifica un URL compatto nel suo URL completo originale.
    /// </summary>
    public static string? DecodeImageUrl(string? encodedUrl)
    {
        if (string.IsNullOrWhiteSpace(encodedUrl))
            return null;

        if (encodedUrl.StartsWith(RawgPrefix, StringComparison.OrdinalIgnoreCase))
        {
            return RawgBaseUrl + encodedUrl[RawgPrefix.Length..];
        }

        if (encodedUrl.StartsWith(SteamPrefix, StringComparison.OrdinalIgnoreCase))
        {
            return SteamBaseUrl + encodedUrl[SteamPrefix.Length..];
        }

        // Se non ha prefissi noti, lo restituisce così com'è
        return encodedUrl;
    }
}
