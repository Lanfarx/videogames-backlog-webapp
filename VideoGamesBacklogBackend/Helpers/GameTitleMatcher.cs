using System;
using System.Collections.Generic;
using System.Linq;

namespace VideoGamesBacklogBackend.Helpers
{
    public static class GameTitleMatcher
    {
        public static string NormalizeGameTitle(string title)
        {
            if (string.IsNullOrEmpty(title))
                return string.Empty;

            var normalized = title.Trim();

            // Convert Roman numerals to Arabic numbers
            var romanToArabic = new Dictionary<string, string>
            {
                { " III", " 3" },
                { " II", " 2" },
                { " IV", " 4" },
                { " V", " 5" },
                { " VI", " 6" },
                { " VII", " 7" },
                { " VIII", " 8" },
                { " IX", " 9" },
                { " X", " 10" }
            };

            foreach (var pair in romanToArabic)
            {
                normalized = normalized.Replace(pair.Key, pair.Value, StringComparison.OrdinalIgnoreCase);
            }

            // Convert Arabic numbers to Roman numerals for reverse matching
            var arabicToRoman = new Dictionary<string, string>
            {
                { " 3", " III" },
                { " 2", " II" },
                { " 4", " IV" },
                { " 5", " V" },
                { " 6", " VI" },
                { " 7", " VII" },
                { " 8", " VIII" },
                { " 9", " IX" },
                { " 10", " X" }
            };

            // Per il matching, proviamo anche la versione con numeri romani
            // ma restituiamo la versione normalizzata con numeri arabi
            return normalized;
        }

        public static string RemoveEditionSuffixes(string title)
        {
            if (string.IsNullOrEmpty(title))
                return string.Empty;

            var suffixesToRemove = new[]
            {
                " Special Edition",
                " Game of the Year Edition",
                " GOTY Edition",
                " Deluxe Edition",
                " Ultimate Edition",
                " Complete Edition",
                " Enhanced Edition",
                " Definitive Edition",
                " Director's Cut",
                " Remastered",
                " HD",
                " (2009)", " (2010)", " (2011)", " (2012)", " (2013)", " (2014)",
                " (2015)", " (2016)", " (2017)", " (2018)", " (2019)", " (2020)",
                " (2021)", " (2022)", " (2023)", " (2024)", " (2025)"
            };

            var result = title;
            foreach (var suffix in suffixesToRemove)
            {
                if (result.EndsWith(suffix, StringComparison.OrdinalIgnoreCase))
                {
                    result = result.Substring(0, result.Length - suffix.Length).Trim();
                    break; // Remove only the first matching suffix
                }
            }

            return result;
        }
        
        public static bool DoesGameTitleMatch(string gameTitle, string searchTitle)
        {
            if (string.IsNullOrEmpty(gameTitle) || string.IsNullOrEmpty(searchTitle))
                return false;

            // 1. Exact match (case-insensitive)
            if (string.Equals(gameTitle, searchTitle, StringComparison.OrdinalIgnoreCase))
                return true;

            // 2. Normalized match (Roman/Arabic numerals)
            var normalizedGameTitle = NormalizeGameTitle(gameTitle);
            var normalizedSearchTitle = NormalizeGameTitle(searchTitle);

            if (string.Equals(normalizedGameTitle, normalizedSearchTitle, StringComparison.OrdinalIgnoreCase))
                return true;

            // 3. Match without edition suffixes
            var gameWithoutEdition = RemoveEditionSuffixes(normalizedGameTitle);
            var searchWithoutEdition = RemoveEditionSuffixes(normalizedSearchTitle);

            if (string.Equals(gameWithoutEdition, searchWithoutEdition, StringComparison.OrdinalIgnoreCase))
                return true;

            // 4. Try reverse normalization (Arabic to Roman)
            var gameRomanVersion = ConvertArabicToRoman(normalizedGameTitle);
            var searchRomanVersion = ConvertArabicToRoman(normalizedSearchTitle);

            if (string.Equals(gameRomanVersion, normalizedSearchTitle, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(normalizedGameTitle, searchRomanVersion, StringComparison.OrdinalIgnoreCase))
                return true;

            return false;
        }

        public static T? FindMatchingGame<T>(IEnumerable<T> games, Func<T, string> titleSelector, string searchTitle) where T : class
        {
            return games.FirstOrDefault(game => DoesGameTitleMatch(titleSelector(game), searchTitle));
        }

        public static IEnumerable<T> FilterMatchingGames<T>(IEnumerable<T> games, Func<T, string> titleSelector, string searchTitle)
        {
            return games.Where(game => DoesGameTitleMatch(titleSelector(game), searchTitle));
        }
        
        private static string ConvertArabicToRoman(string title)
        {
            if (string.IsNullOrEmpty(title))
                return string.Empty;

            var arabicToRoman = new Dictionary<string, string>
            {
                { " 3", " III" },
                { " 2", " II" },
                { " 4", " IV" },
                { " 5", " V" },
                { " 6", " VI" },
                { " 7", " VII" },
                { " 8", " VIII" },
                { " 9", " IX" },
                { " 10", " X" }
            };

            var result = title;
            foreach (var pair in arabicToRoman)
            {
                result = result.Replace(pair.Key, pair.Value, StringComparison.OrdinalIgnoreCase);
            }

            return result;
        }
    }
}
