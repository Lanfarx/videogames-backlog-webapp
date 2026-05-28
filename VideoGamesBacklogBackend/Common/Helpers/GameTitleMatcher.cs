using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace VideoGamesBacklogBackend.Common.Helpers;

/// <summary>
/// Helper per normalizzare e confrontare in modo flessibile i titoli dei videogiochi.
/// </summary>
public static partial class GameTitleMatcher
{
    // Array ordinati per lunghezza della stringa da cercare per evitare sovrapposizioni
    // (es. Evitare di trasformare "VIII" in "V" + "III"). Risolve bug nascosti nell'implementazione precedente.
    private static readonly (string Roman, string Arabic)[] RomanToArabic =
    [
        ("VIII", "8"),
        ("VII", "7"),
        ("III", "3"),
        ("IV", "4"),
        ("VI", "6"),
        ("IX", "9"),
        ("II", "2"),
        ("V", "5"),
        ("X", "10")
    ];

    // Suffixes ordinati per lunghezza decrescente
    private static readonly string[] EditionSuffixes = 
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
        
        foreach (var (roman, arabic) in RomanToArabic)
        {
            normalized = Regex.Replace(normalized, $@"\b{roman}\b", arabic, RegexOptions.IgnoreCase);
        }

        return normalized;
    }

    public static string RemoveEditionSuffixes(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            return string.Empty;

        var result = title.Trim();

        // Rimuove dinamicamente qualsiasi suffisso anno invece di hardcode tutti da (2009) a (2025)
        result = YearSuffixRegex().Replace(result, string.Empty);

        foreach (var suffix in EditionSuffixes)
        {
            if (!result.EndsWith(suffix, StringComparison.OrdinalIgnoreCase)) continue;
            result = result[..^suffix.Length].Trim();
            break;
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

        foreach (var c in from c in normalizedString let unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c) where unicodeCategory != UnicodeCategory.NonSpacingMark select c)
        {
            stringBuilder.Append(c);
        }
        var withoutDiacritics = stringBuilder.ToString().Normalize(NormalizationForm.FormC);

        // 2. Mantiene solo lettere, numeri e spazi
        var finalBuilder = new StringBuilder(capacity: withoutDiacritics.Length);
        foreach (var c in withoutDiacritics.Where(c => char.IsLetterOrDigit(c) || char.IsWhiteSpace(c)))
        {
            finalBuilder.Append(c);
        }

        return MultipleSpacesRegex().Replace(finalBuilder.ToString(), " ").Trim();
    }

    public static string RemoveLeadingArticles(string title)
    {
        return string.IsNullOrWhiteSpace(title) ? string.Empty : LeadingArticlesRegex().Replace(title.Trim(), string.Empty);
    }

    /// <summary>
    /// Restituisce il titolo completamente normalizzato da usare come colonna nel database per match precisi.
    /// Applica tutti i passaggi di normalizzazione: spazi, numeri romani, edizioni, punteggiatura e articoli.
    /// </summary>
    public static string GetFullyNormalizedTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title)) return string.Empty;

        var cleanTitle = NormalizeWhitespacesAndAnds(title);
        var normTitle = NormalizeGameTitle(cleanTitle);
        var withoutEdition = RemoveEditionSuffixes(normTitle);
        var noPunct = RemovePunctuationAndDiacritics(withoutEdition);
        var noArticles = RemoveLeadingArticles(noPunct);

        return noArticles.ToLowerInvariant();
    }
}
