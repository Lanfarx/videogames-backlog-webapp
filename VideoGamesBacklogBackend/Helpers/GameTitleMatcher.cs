using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace VideoGamesBacklogBackend.Helpers;

/// <summary>
/// Helper per normalizzare e confrontare in modo flessibile i titoli dei videogiochi.
/// </summary>
public static partial class GameTitleMatcher
{
    // Array ordinati per lunghezza della stringa da cercare per evitare sovrapposizioni
    // (es. evitare di trasformare "VIII" in "V" + "III"). Risolve bug nascosti nell'implementazione precedente.
    private static readonly (string Roman, string Arabic)[] _romanToArabic =
    [
        (" VIII", " 8"),
        (" VII", " 7"),
        (" III", " 3"),
        (" IV", " 4"),
        (" VI", " 6"),
        (" IX", " 9"),
        (" II", " 2"),
        (" V", " 5"),
        (" X", " 10")
    ];

    private static readonly (string Arabic, string Roman)[] _arabicToRoman =
    [
        (" 10", " X"),
        (" 9", " IX"),
        (" 8", " VIII"),
        (" 7", " VII"),
        (" 6", " VI"),
        (" 5", " V"),
        (" 4", " IV"),
        (" 3", " III"),
        (" 2", " II")
    ];

    // Suffixes ordinati per lunghezza decrescente
    private static readonly string[] _editionSuffixes = 
    [
        " Game of the Year Edition",
        " Ultimate Edition",
        " Complete Edition",
        " Enhanced Edition",
        " Definitive Edition",
        " Special Edition",
        " Deluxe Edition",
        " Director's Cut",
        " GOTY Edition",
        " Remastered",
        " HD"
    ];

    // Espressione regolare precompilata per rimuovere gli anni tra parentesi finali (es. " (2020)")
    [GeneratedRegex(@"\s+\(\d{4}\)$", RegexOptions.IgnoreCase | RegexOptions.Compiled)]
    private static partial Regex YearSuffixRegex();

    // Espressione regolare precompilata per ridurre spazi multipli a uno singolo
    [GeneratedRegex(@"\s+", RegexOptions.Compiled)]
    private static partial Regex MultipleSpacesRegex();

    // Espressione regolare precompilata per articoli iniziali
    [GeneratedRegex(@"^(the|a|an)\s+", RegexOptions.IgnoreCase | RegexOptions.Compiled)]
    private static partial Regex LeadingArticlesRegex();

    public static string NormalizeGameTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            return string.Empty;

        var normalized = title.Trim();
        
        foreach (var (roman, arabic) in _romanToArabic)
        {
            normalized = normalized.Replace(roman, arabic, StringComparison.OrdinalIgnoreCase);
        }

        return normalized;
    }

    public static string RemoveEditionSuffixes(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            return string.Empty;

        var result = title.Trim();

        // Rimuove dinamicamente qualsiasi suffisso anno invece di hardcodarli tutti da (2009) a (2025)
        result = YearSuffixRegex().Replace(result, string.Empty);

        foreach (var suffix in _editionSuffixes)
        {
            if (result.EndsWith(suffix, StringComparison.OrdinalIgnoreCase))
            {
                result = result[..^suffix.Length].Trim();
                break; 
            }
        }

        return result;
    }

    private static string ConvertArabicToRoman(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            return string.Empty;

        var result = title.Trim();
        foreach (var (arabic, roman) in _arabicToRoman)
        {
            result = result.Replace(arabic, roman, StringComparison.OrdinalIgnoreCase);
        }
        return result;
    }

    public static string NormalizeWhitespacesAndAnds(string title)
    {
        if (string.IsNullOrWhiteSpace(title)) return string.Empty;
        
        var result = title.Replace("&", "and", StringComparison.OrdinalIgnoreCase);
        result = MultipleSpacesRegex().Replace(result, " ");
        return result.Trim();
    }

    public static string RemovePunctuationAndDiacritics(string title)
    {
        if (string.IsNullOrWhiteSpace(title)) return string.Empty;

        // 1. Rimuove i diacritici (es. é -> e, ö -> o)
        var normalizedString = title.Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder(capacity: normalizedString.Length);

        foreach (var c in normalizedString)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }
        var withoutDiacritics = stringBuilder.ToString().Normalize(NormalizationForm.FormC);

        // 2. Mantiene solo lettere, numeri e spazi
        var finalBuilder = new StringBuilder(capacity: withoutDiacritics.Length);
        foreach (var c in withoutDiacritics)
        {
            if (char.IsLetterOrDigit(c) || char.IsWhiteSpace(c))
            {
                finalBuilder.Append(c);
            }
        }

        return MultipleSpacesRegex().Replace(finalBuilder.ToString(), " ").Trim();
    }

    public static string RemoveLeadingArticles(string title)
    {
        if (string.IsNullOrWhiteSpace(title)) return string.Empty;
        return LeadingArticlesRegex().Replace(title.Trim(), string.Empty);
    }

    public static bool DoesGameTitleMatch(string gameTitle, string searchTitle)
    {
        if (string.IsNullOrWhiteSpace(gameTitle) || string.IsNullOrWhiteSpace(searchTitle))
            return false;

        // 1. Exact match (più veloce)
        if (gameTitle.Equals(searchTitle, StringComparison.OrdinalIgnoreCase))
            return true;
        
        // 2. Normalizzazione di base: spazi multipli e '&' -> 'and'
        var cleanGame = NormalizeWhitespacesAndAnds(gameTitle);
        var cleanSearch = NormalizeWhitespacesAndAnds(searchTitle);
        
        if (cleanGame.Equals(cleanSearch, StringComparison.OrdinalIgnoreCase))
            return true;

        // 3. Normalizzazione numeri romani in arabi
        var normGame = NormalizeGameTitle(cleanGame);
        var normSearch = NormalizeGameTitle(cleanSearch);

        if (normGame.Equals(normSearch, StringComparison.OrdinalIgnoreCase))
            return true;

        // 4. Rimozione dei suffissi delle edizioni (GOTY, Special, ecc.)
        var gameWithoutEdition = RemoveEditionSuffixes(normGame);
        var searchWithoutEdition = RemoveEditionSuffixes(normSearch);

        if (gameWithoutEdition.Equals(searchWithoutEdition, StringComparison.OrdinalIgnoreCase))
            return true;

        // 5. Fallback conversione da arabo a romano (casi limite)
        var gameRoman = ConvertArabicToRoman(normGame);
        var searchRoman = ConvertArabicToRoman(normSearch);

        if (gameRoman.Equals(normSearch, StringComparison.OrdinalIgnoreCase) ||
            normGame.Equals(searchRoman, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        // 6. Normalizzazione "Hard": Rimozione punteggiatura (-, :, ') e accenti/diacritici
        var gameNoPunct = RemovePunctuationAndDiacritics(gameWithoutEdition);
        var searchNoPunct = RemovePunctuationAndDiacritics(searchWithoutEdition);

        if (gameNoPunct.Equals(searchNoPunct, StringComparison.OrdinalIgnoreCase))
            return true;

        // 7. Ultima spiaggia: rimozione articoli iniziali ("The ", "A ", "An ")
        var gameNoArticles = RemoveLeadingArticles(gameNoPunct);
        var searchNoArticles = RemoveLeadingArticles(searchNoPunct);

        return gameNoArticles.Equals(searchNoArticles, StringComparison.OrdinalIgnoreCase);
    }

    public static T? FindMatchingGame<T>(IEnumerable<T> games, Func<T, string> titleSelector, string searchTitle) where T : class
    {
        return games.FirstOrDefault(game => DoesGameTitleMatch(titleSelector(game), searchTitle));
    }
}
