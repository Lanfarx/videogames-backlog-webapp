/**
 * Utilità per la gestione dei giochi
 */
import { Game, GameStatus, GameBasicInfo, NumericRange, GameSearchParams, GameFilters, SortOption, SortOrder } from '../types/game';
import { ChartItem } from '../types/stats';
import {  
  getStatusColor, 
  getStatusLabel, 
  getPlatformColor, 
} from '../constants/gameConstants';

/**
 * Filtra i giochi in base ai criteri di ricerca
 */
export function filterGames(games: Game[], searchParams: GameSearchParams): Game[] {
  let filtered = [...games];
  
  // Filtra per query di testo
  if (searchParams.query) {
    const query = searchParams.query.toLowerCase();
    filtered = filtered.filter(game => 
      game.title.toLowerCase().includes(query) || 
      (game.developer && game.developer.toLowerCase().includes(query)) ||
      (game.publisher && game.publisher.toLowerCase().includes(query)) ||
      game.genres.some(genre => genre.toLowerCase().includes(query))
    );
  }
  
  // Filtra in base ai filtri specificati
  if (searchParams.filters) {
    const { status, platform, genre, priceRange, hoursRange, metacriticRange, purchaseDate } = searchParams.filters;
    
    if (status && status.length > 0) {
      filtered = filtered.filter(game => status.includes(game.status));
    }
    
    if (platform && platform.length > 0) {
      filtered = filtered.filter(game => platform.includes(game.platform));
    }
    
    if (genre && genre.length > 0) {
      filtered = filtered.filter(game => 
        game.genres.some(g => genre.includes(g))
      );
    }
    
    if (priceRange) {
      filtered = filtered.filter(game => 
        game.price >= priceRange[0] && game.price <= priceRange[1]
      );
    }
    
    if (hoursRange) {
      filtered = filtered.filter(game => 
        game.hoursPlayed >= hoursRange[0] && game.hoursPlayed <= hoursRange[1]
      );
    }
    
    if (metacriticRange) {
      filtered = filtered.filter(game => 
        game.metacritic >= metacriticRange[0] && game.metacritic <= metacriticRange[1]
      );
    }
    
    if (purchaseDate) {
      const purchaseYear = new Date(purchaseDate).getFullYear();
      filtered = filtered.filter(game => 
        game.purchaseDate && new Date(game.purchaseDate).getFullYear() === purchaseYear
      );
    }
  }
  
  // Applica ordinamento
  if (searchParams.sortBy) {
    filtered = sortGames(filtered, searchParams.sortBy, searchParams.sortOrder || 'asc');
  }
  
  // Applica paginazione
  if (searchParams.offset !== undefined && searchParams.limit) {
    filtered = filtered.slice(searchParams.offset, searchParams.offset + searchParams.limit);
  } else if (searchParams.limit) {
    filtered = filtered.slice(0, searchParams.limit);
  }
  
  return filtered;
}

/**
 * Ordina i giochi in base al criterio specificato
 */
export function sortGames(games: Game[], sortBy: SortOption, sortOrder: SortOrder = 'asc'): Game[] {
  const sortMultiplier = sortOrder === 'asc' ? 1 : -1;
  
  return [...games].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title) * sortMultiplier;
      case 'platform':
        return a.platform.localeCompare(b.platform) * sortMultiplier;
      case 'releaseYear':
        return (a.releaseYear - b.releaseYear) * sortMultiplier;
      case 'rating':
        return (a.rating - b.rating) * sortMultiplier;
      case 'hoursPlayed':
        return (a.hoursPlayed - b.hoursPlayed) * sortMultiplier;
      case 'price':
        return (a.price - b.price) * sortMultiplier;
      case 'metacritic':
        return (a.metacritic - b.metacritic) * sortMultiplier;
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
      default:
        return 0;
    }
  });
}

/**
 * Genera dati di distribuzione per i grafici a torta
 */
export function generateStatusDistributionData(games: Game[]): ChartItem[] {
  const statusCounts: Record<GameStatus, number> = {
    'not-started': 0,
    'in-progress': 0,
    'completed': 0,
    'abandoned': 0,
    'platinum': 0
  };
  
  // Conta i giochi per stato
  games.forEach(game => {
    statusCounts[game.status]++;
  });
  
  // Converte i conteggi in dati per i grafici
  return Object.entries(statusCounts).map(([status, count]) => ({
    label: getStatusLabel(status),
    value: count,
    color: getStatusColor(status)
  }));
}

/**
 * Genera dati di distribuzione per i grafici sulle piattaforme
 */
export function generatePlatformDistributionData(games: Game[]): ChartItem[] {
  const platformCounts: Record<string, number> = {};
  
  // Conta i giochi per piattaforma
  games.forEach(game => {
    if (!platformCounts[game.platform]) {
      platformCounts[game.platform] = 0;
    }
    platformCounts[game.platform]++;
  });
  
  // Converte i conteggi in dati per i grafici
  return Object.entries(platformCounts)
    .filter(([_, count]) => count > 0) // Filtra solo piattaforme con giochi
    .map(([platform, count]) => ({
      label: platform,
      value: count,
      color: getPlatformColor(platform)
    }))
    .sort((a, b) => b.value - a.value); // Ordina per conteggio decrescente
}

/**
 * Calcola il prezzo medio dei giochi
 */
export function calculateAveragePrice(games: Game[]): number {
  if (games.length === 0) return 0;
  
  const totalPrice = games.reduce((sum, game) => sum + game.price, 0);
  return parseFloat((totalPrice / games.length).toFixed(2));
}

/**
 * Calcola la media delle recensioni dei giochi
 */
export function calculateAverageRating(games: Game[]): number {
  const gamesWithRating = games.filter(game => game.rating > 0);
  if (gamesWithRating.length === 0) return 0;
  
  const totalRating = gamesWithRating.reduce((sum, game) => sum + game.rating, 0);
  return parseFloat((totalRating / gamesWithRating.length).toFixed(1));
}

/**
 * Estrae le informazioni di base di un gioco
 */
export function extractGameBasicInfo(game: Game): GameBasicInfo {
  const { id, title, platform, releaseYear, genres, status, coverImage } = game;
  return { id, title, platform, releaseYear, genres, status, coverImage };
}

/**
 * Trova i giochi simili in base a generi e piattaforma
 */
export function findSimilarGames(game: Game, allGames: Game[], limit = 3): Game[] {
  // Esclude il gioco stesso
  const otherGames = allGames.filter(g => g.id !== game.id);
  
  // Calcola un punteggio di similitudine per ogni gioco
  const scoredGames = otherGames.map(otherGame => {
    let score = 0;
    
    // Stessa piattaforma
    if (otherGame.platform === game.platform) score += 2;
    
    // Generi in comune
    const commonGenres = otherGame.genres.filter(genre => game.genres.includes(genre));
    score += commonGenres.length * 3;
    
    // Stesso sviluppatore
    if (otherGame.developer && game.developer && otherGame.developer === game.developer) score += 4;
    
    // Anno di uscita simile
    const yearDiff = Math.abs(otherGame.releaseYear - game.releaseYear);
    if (yearDiff <= 2) score += 1;
    
    return { game: otherGame, score };
  });
  
  // Ordina per punteggio e restituisce i primi N giochi
  return scoredGames
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.game);
}

/**
 * Calcola i valori massimi di prezzo, ore giocate e punteggio Metacritic
 */
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

/**
 * Calcola i conteggi di stato, piattaforma e genere dai dati dei giochi
 */
export function calculateCounts(games: any[]) {
  const statusCountsTemp: Record<string, number> = {};
  const platformCountsTemp: Record<string, number> = {};
  const genreCountsTemp: Record<string, number> = {};

  games.forEach((game) => {
    // Conta gli stati
    if (game.status) {
      statusCountsTemp[game.status] = (statusCountsTemp[game.status] || 0) + 1;
    }

    // Conta le piattaforme
    if (game.platform) {
      platformCountsTemp[game.platform] = (platformCountsTemp[game.platform] || 0) + 1;
    }

    // Conta i generi
    if (game.genre) {
      game.genre.forEach((g: string) => {
        genreCountsTemp[g] = (genreCountsTemp[g] || 0) + 1;
      });
    }
  });

  return { statusCountsTemp, platformCountsTemp, genreCountsTemp };
}