import { Game, GameStatus, GamePlatform, GameReview } from '../types/game';
import { GameSearchParams, SortOption, SortOrder, NumericRange, GameBasicInfo } from '../types/game';
import { ChartItem } from '../types/stats';
import { getStatusColor, getStatusLabel, getPlatformColor } from '../constants/gameConstants';

// Tutte le use* relative ai giochi sono ora in store/hooks/gamesHooks.ts
// Tutte le use* relative alle attività sono ora in store/hooks/activitiesHooks.ts

export function calculateRatingFromReview(review: GameReview | undefined): number {
  if (!review) return 0;
  const { gameplay, graphics, story, sound } = review;
  const average = (gameplay + graphics + story + sound) / 4;
  return Math.round(average * 2) / 2;
}

export function getGameRating(game: Game): number {
  if (game.rating !== undefined) return game.rating;
  return game.review ? calculateRatingFromReview(game.review) : 0;
}

export function filterGames(games: Game[], searchParams: GameSearchParams): Game[] {
  let filtered = [...games];
  if (searchParams.query) {
    const query = searchParams.query.toLowerCase();
    filtered = filtered.filter(game =>
      game.title.toLowerCase().includes(query) ||
      (game.developer && game.developer.toLowerCase().includes(query)) ||
      (game.publisher && game.publisher.toLowerCase().includes(query)) ||
      game.genres.some(genre => genre.toLowerCase().includes(query))
    );
  }
  if (searchParams.filters) {
    const { status, platform, genre, priceRange, hoursRange, metacriticRange, purchaseDate } = searchParams.filters;
    if (status && status.length > 0) filtered = filtered.filter(game => status.includes(game.status));
    if (platform && platform.length > 0) filtered = filtered.filter(game => platform.includes(game.platform));
    if (genre && genre.length > 0) filtered = filtered.filter(game => game.genres.some(g => genre.includes(g)));
    if (priceRange) filtered = filtered.filter(game => game.price >= priceRange[0] && game.price <= priceRange[1]);
    if (hoursRange) filtered = filtered.filter(game => game.hoursPlayed >= hoursRange[0] && game.hoursPlayed <= hoursRange[1]);
    if (metacriticRange) filtered = filtered.filter(game => game.metacritic >= metacriticRange[0] && game.metacritic <= metacriticRange[1]);
    if (purchaseDate) {
      const purchaseYear = new Date(purchaseDate).getFullYear();
      filtered = filtered.filter(game => game.purchaseDate && new Date(game.purchaseDate).getFullYear() === purchaseYear);
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
      case 'title': return a.title.localeCompare(b.title) * sortMultiplier;
      case 'platform': return a.platform.localeCompare(b.platform) * sortMultiplier;
      case 'releaseYear': return (a.releaseYear - b.releaseYear) * sortMultiplier;
      case 'rating': return (a.rating - b.rating) * sortMultiplier;
      case 'hoursPlayed': return (a.hoursPlayed - b.hoursPlayed) * sortMultiplier;
      case 'price': return (a.price - b.price) * sortMultiplier;
      case 'metacritic': return (a.metacritic - b.metacritic) * sortMultiplier;
      case 'purchaseDate':
        if (!a.purchaseDate) return sortMultiplier;
        if (!b.purchaseDate) return -sortMultiplier;
        return (new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()) * sortMultiplier;
      case 'completionDate':
        if (!a.completionDate) return sortMultiplier;
        if (!b.completionDate) return -sortMultiplier;
        return (new Date(a.completionDate).getTime() - new Date(b.completionDate).getTime()) * sortMultiplier;
      case 'platinumDate':
        if (!a.platinumDate) return sortMultiplier;
        if (!b.platinumDate) return -sortMultiplier;
        return (new Date(a.platinumDate).getTime() - new Date(b.platinumDate).getTime()) * sortMultiplier;
      default: return 0;
    }
  });
}

export function generateStatusDistributionData(games: Game[]): ChartItem[] {
  const statusCounts: Record<GameStatus, number> = {
    'not-started': 0,
    'in-progress': 0,
    'completed': 0,
    'abandoned': 0,
    'platinum': 0
  };
  games.forEach(game => { statusCounts[game.status]++; });
  return Object.entries(statusCounts).map(([status, count]) => ({
    label: getStatusLabel(status as GameStatus),
    value: count,
    color: getStatusColor(status as GameStatus)
  }));
}

export function generatePlatformDistributionData(games: Game[]): ChartItem[] {
  const platformCounts: Record<string, number> = {};
  games.forEach(game => { platformCounts[game.platform] = (platformCounts[game.platform] || 0) + 1; });
  return Object.entries(platformCounts)
    .filter(([_, count]) => count > 0)
    .map(([platform, count]) => ({
      label: platform,
      value: count,
      color: getPlatformColor(platform)
    }))
    .sort((a, b) => b.value - a.value);
}

export function calculateAveragePrice(games: Game[]): number {
  if (games.length === 0) return 0;
  const totalPrice = games.reduce((sum, game) => sum + game.price, 0);
  return parseFloat((totalPrice / games.length).toFixed(2));
}

export function calculateAverageRating(games: Game[]): number {
  const gamesWithRating = games.filter(game => game.rating > 0);
  if (gamesWithRating.length === 0) return 0;
  const totalRating = gamesWithRating.reduce((sum, game) => sum + game.rating, 0);
  return parseFloat((totalRating / gamesWithRating.length).toFixed(1));
}

export function extractGameBasicInfo(game: Game): GameBasicInfo {
  const { id, title, platform, releaseYear, genres, status, coverImage } = game;
  return { id, title, platform, releaseYear, genres, status, coverImage };
}

export function findSimilarGames(game: Game, allGames: Game[], limit = 3): Game[] {
  const otherGames = allGames.filter(g => g.id !== game.id);
  const scoredGames = otherGames.map(otherGame => {
    let score = 0;
    if (otherGame.platform === game.platform) score += 2;
    const commonGenres = otherGame.genres.filter(genre => game.genres.includes(genre));
    score += commonGenres.length * 3;
    if (otherGame.developer && game.developer && otherGame.developer === game.developer) score += 4;
    const yearDiff = Math.abs(otherGame.releaseYear - game.releaseYear);
    if (yearDiff <= 2) score += 1;
    return { game: otherGame, score };
  });
  return scoredGames.sort((a, b) => b.score - a.score).slice(0, limit).map(item => item.game);
}

export function calculateMaxValues(games: Game[]): { priceRange: NumericRange; hoursRange: NumericRange; metacriticRange: NumericRange } {
  const maxPrice = Math.max(...games.map(game => game.price || 0), 0);
  const maxHours = Math.max(...games.map(game => game.hoursPlayed || 0), 0);
  const maxMetacritic = Math.max(...games.map(game => game.metacritic || 0), 0);
  return {
    priceRange: [0, maxPrice],
    hoursRange: [0, maxHours],
    metacriticRange: [0, maxMetacritic],
  };
}

export function calculateCounts(games: Game[]) {
  const statusCountsTemp: Record<string, number> = {};
  const platformCountsTemp: Record<string, number> = {};
  const genreCountsTemp: Record<string, number> = {};
  games.forEach((game) => {
    if (game.status) statusCountsTemp[game.status] = (statusCountsTemp[game.status] || 0) + 1;
    if (game.platform) platformCountsTemp[game.platform] = (platformCountsTemp[game.platform] || 0) + 1;
    if (game.genres) game.genres.forEach((g: string) => { genreCountsTemp[g] = (genreCountsTemp[g] || 0) + 1; });
  });
  return { statusCountsTemp, platformCountsTemp, genreCountsTemp };
}

export function generateGenreDistributionData(games: Game[]): { genre: string; count: number }[] {
  const genreCounts: Record<string, number> = {};
  games.forEach((game) => {
    game.genres.forEach((genre: string) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });
  return Object.entries(genreCounts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

/**
 * Calcola il communityRating medio dato un array di giochi che hanno sicuramente un rating valido
 */
export function calculateCommunityRating(games: Array<{ rating: number }>): number {
  if (!games.length) return 0;
  const avg = games.reduce((sum, g) => sum + g.rating, 0) / games.length;
  return Math.round(avg * 10) / 10;
}

