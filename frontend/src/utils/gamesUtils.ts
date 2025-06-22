import { Game, GameStatus, GamePlatform, GameReview } from '../types/game';
import { GameSearchParams, SortOption, SortOrder, NumericRange, GameBasicInfo } from '../types/game';
import { ChartItem } from '../types/stats';
import { getPlatformColor } from '../constants/gameConstants';

// Tutte le use* relative ai giochi sono ora in store/hooks/gamesHooks.ts
// Tutte le use* relative alle attività sono ora in store/hooks/activitiesHooks.ts

export function calculateRatingFromReview(Review: GameReview | undefined): number {
  if (!Review) return 0;
  const { Gameplay, Graphics, Story, Sound } = Review;
  const average = (Gameplay + Graphics + Story + Sound) / 4;
  return Math.round(average * 2) / 2;
}

export function getGameRating(game: Game): number {
  if (game.Rating !== undefined) return game.Rating;
  return game.Review ? calculateRatingFromReview(game.Review) : 0;
}

export function filterGames(games: Game[], searchParams: GameSearchParams): Game[] {
  let filtered = [...games];
  if (searchParams.query) {
    const query = searchParams.query.toLowerCase();
    filtered = filtered.filter(game =>
      game.Title.toLowerCase().includes(query) ||
      (game.Developer && game.Developer.toLowerCase().includes(query)) ||
      (game.Publisher && game.Publisher.toLowerCase().includes(query)) ||
      game.Genres.some(genre => genre.toLowerCase().includes(query))
    );
  }
  if (searchParams.filters) {
    const { Status, Platform, genre, PriceRange, hoursRange, MetacriticRange, PurchaseDate } = searchParams.filters;
    if (Status && Status.length > 0) filtered = filtered.filter(game => Status.includes(game.Status));
    if (Platform && Platform.length > 0) filtered = filtered.filter(game => Platform.includes(game.Platform));
    if (genre && genre.length > 0) filtered = filtered.filter(game => game.Genres.some(g => genre.includes(g)));
    if (PriceRange) filtered = filtered.filter(game => game.Price >= PriceRange[0] && game.Price <= PriceRange[1]);
    if (hoursRange) filtered = filtered.filter(game => game.HoursPlayed >= hoursRange[0] && game.HoursPlayed <= hoursRange[1]);
    if (MetacriticRange) filtered = filtered.filter(game => game.Metacritic >= MetacriticRange[0] && game.Metacritic <= MetacriticRange[1]);
    if (PurchaseDate) {
      const purchaseYear = new Date(PurchaseDate).getFullYear();
      filtered = filtered.filter(game => game.PurchaseDate && new Date(game.PurchaseDate).getFullYear() === purchaseYear);
    }
  }
  if (searchParams.sortBy) {
    filtered = sortGames(filtered, searchParams.sortBy, searchParams.sortOrder || 'asc');
  }
  if (searchParams.offset !== undefined && searchParams.limit) {
    filtered = filtered.slice(searchParams.offset, searchParams.offset + searchParams.limit);
  } else if (searchParams.limit) {
    filtered = filtered.slice(0, searchParams.limit);
  }
  return filtered;
}

export function sortGames(games: Game[], sortBy: SortOption, sortOrder: SortOrder = 'asc'): Game[] {
  const sortMultiplier = sortOrder === 'asc' ? 1 : -1;
  return [...games].sort((a, b) => {
    switch (sortBy) {
      case 'title': return a.Title.localeCompare(b.Title) * sortMultiplier;
      case 'Platform': return a.Platform.localeCompare(b.Platform) * sortMultiplier;
      case 'ReleaseYear': return (a.ReleaseYear - b.ReleaseYear) * sortMultiplier;
      case 'Rating': return (a.Rating - b.Rating) * sortMultiplier;
      case 'HoursPlayed': return (a.HoursPlayed - b.HoursPlayed) * sortMultiplier;
      case 'Price': return (a.Price - b.Price) * sortMultiplier;
      case 'Metacritic': return (a.Metacritic - b.Metacritic) * sortMultiplier;
      case 'PurchaseDate':
        if (!a.PurchaseDate) return sortMultiplier;
        if (!b.PurchaseDate) return -sortMultiplier;
        return (new Date(a.PurchaseDate).getTime() - new Date(b.PurchaseDate).getTime()) * sortMultiplier;
      case 'CompletionDate':
        if (!a.CompletionDate) return sortMultiplier;
        if (!b.CompletionDate) return -sortMultiplier;
        return (new Date(a.CompletionDate).getTime() - new Date(b.CompletionDate).getTime()) * sortMultiplier;
      case 'PlatinumDate':
        if (!a.PlatinumDate) return sortMultiplier;
        if (!b.PlatinumDate) return -sortMultiplier;
        return (new Date(a.PlatinumDate).getTime() - new Date(b.PlatinumDate).getTime()) * sortMultiplier;
      default: return 0;
    }
  });
}

export function generatePlatformDistributionData(games: Game[]): ChartItem[] {
  const PlatformCounts: Record<string, number> = {};
  games.forEach(game => { PlatformCounts[game.Platform] = (PlatformCounts[game.Platform] || 0) + 1; });
  return Object.entries(PlatformCounts)
    .filter(([_, count]) => count > 0)
    .map(([Platform, count]) => ({
      label: Platform,
      value: count,
      color: getPlatformColor(Platform)
    }))
    .sort((a, b) => b.value - a.value);
}

export function calculateAveragePrice(games: Game[]): number {
  if (games.length === 0) return 0;
  const totalPrice = games.reduce((sum, game) => sum + game.Price, 0);
  return parseFloat((totalPrice / games.length).toFixed(2));
}

export function calculateAverageRating(games: Game[]): number {
  const gamesWithRating = games.filter(game => game.Rating > 0);
  if (gamesWithRating.length === 0) return 0;
  const totalRating = gamesWithRating.reduce((sum, game) => sum + game.Rating, 0);
  return parseFloat((totalRating / gamesWithRating.length).toFixed(1));
}

export function extractGameBasicInfo(game: Game): GameBasicInfo {
  const { id, Title, Platform, ReleaseYear, Genres, Status, CoverImage } = game;
  return { id, Title, Platform, ReleaseYear, Genres, Status, CoverImage };
}

export function findSimilarGames(game: Game, allGames: Game[], limit = 3): Game[] {
  const otherGames = allGames.filter(g => g.id !== game.id);
  const scoredGames = otherGames.map(otherGame => {
    let score = 0;
    if (otherGame.Platform === game.Platform) score += 2;
    const commonGenres = otherGame.Genres.filter(genre => game.Genres.includes(genre));
    score += commonGenres.length * 3;
    if (otherGame.Developer && game.Developer && otherGame.Developer === game.Developer) score += 4;
    const yearDiff = Math.abs(otherGame.ReleaseYear - game.ReleaseYear);
    if (yearDiff <= 2) score += 1;
    return { game: otherGame, score };
  });
  return scoredGames.sort((a, b) => b.score - a.score).slice(0, limit).map(item => item.game);
}

export function calculateMaxValues(games: Game[]): { PriceRange: NumericRange; hoursRange: NumericRange; MetacriticRange: NumericRange } {
  const maxPrice = Math.max(...games.map(game => game.Price || 0), 0);
  const maxHours = Math.max(...games.map(game => game.HoursPlayed || 0), 0);
  const maxMetacritic = Math.max(...games.map(game => game.Metacritic || 0), 0);
  return {
    PriceRange: [0, maxPrice],
    hoursRange: [0, maxHours],
    MetacriticRange: [0, maxMetacritic],
  };
}

export function calculateCounts(games: Game[]) {
  const StatusCountsTemp: Record<string, number> = {};
  const PlatformCountsTemp: Record<string, number> = {};
  const genreCountsTemp: Record<string, number> = {};
  games.forEach((game) => {
    if (game.Status) StatusCountsTemp[game.Status] = (StatusCountsTemp[game.Status] || 0) + 1;
    if (game.Platform) PlatformCountsTemp[game.Platform] = (PlatformCountsTemp[game.Platform] || 0) + 1;
    if (game.Genres) game.Genres.forEach((g: string) => { genreCountsTemp[g] = (genreCountsTemp[g] || 0) + 1; });
  });
  return { StatusCountsTemp, PlatformCountsTemp, genreCountsTemp };
}

export function generateGenreDistributionData(games: Game[]): { genre: string; count: number }[] {
  const genreCounts: Record<string, number> = {};
  games.forEach((game) => {
    game.Genres.forEach((genre: string) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });
  return Object.entries(genreCounts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

/**
 * Calcola il communityRating medio dato un array di giochi che hanno sicuramente un Rating valido
 */
export function calculateCommunityRating(games: Array<{ Rating: number }>): number {
  if (!games.length) return 0;
  const avg = games.reduce((sum, g) => sum + g.Rating, 0) / games.length;
  return Math.round(avg * 10) / 10;
}

