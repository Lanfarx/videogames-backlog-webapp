import type { Game, GameStatus, SortOption, SortOrder } from '../types/game';

/**
 * Filtra i giochi in base ai criteri specificati
 */
export function filterGames(
  games: Game[],
  filters: {
    status?: GameStatus[];
    platform?: string[];
    genre?: string[];
    priceRange?: [number, number];
    hoursRange?: [number, number];
    purchaseDate?: string;
  }
): Game[] {
  return games.filter((game) => {
    // Filtra per stato
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(game.status)) {
        return false;
      }
    }

    // Filtra per piattaforma
    if (filters.platform && filters.platform.length > 0) {
      if (!filters.platform.includes(game.platform)) {
        return false;
      }
    }

    // Filtra per genere
    if (filters.genre && filters.genre.length > 0) {
      if (!game.genres.some((genre) => filters.genre!.includes(genre))) {
        return false;
      }
    }

    // Filtra per prezzo
    if (filters.priceRange) {
      if (game.price < filters.priceRange[0] || game.price > filters.priceRange[1]) {
        return false;
      }
    }

    // Filtra per ore di gioco
    if (filters.hoursRange) {
      if (game.hoursPlayed < filters.hoursRange[0] || game.hoursPlayed > filters.hoursRange[1]) {
        return false;
      }
    }

    // Filtra per data di acquisto
    if (filters.purchaseDate && game.purchaseDate) {
      const filterDate = new Date(filters.purchaseDate);
      const gameDate = new Date(game.purchaseDate);
      if (gameDate < filterDate) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Ordina i giochi in base al criterio specificato
 */
export function sortGames(games: Game[], sortBy: SortOption, sortOrder: SortOrder): Game[] {
  return [...games].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'platform':
        comparison = a.platform.localeCompare(b.platform);
        break;
      case 'releaseYear':
        comparison = a.releaseYear - b.releaseYear;
        break;
      case 'rating':
        comparison = a.rating - b.rating;
        break;
      case 'hoursPlayed':
        comparison = a.hoursPlayed - b.hoursPlayed;
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'purchaseDate':
        comparison = compareDates(a.purchaseDate, b.purchaseDate);
        break;
      case 'completionDate':
        comparison = compareDates(a.completionDate, b.completionDate);
        break;
      case 'platinumDate':
        comparison = compareDates(a.completionDate, b.completionDate);
        break;
      default:
        comparison = a.title.localeCompare(b.title);
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

/**
 * Confronta due date in formato stringa
 */
function compareDates(dateA?: string, dateB?: string): number {
  if (!dateA && !dateB) return 0;
  if (!dateA) return 1; // Cambiato da -1 a 1
  if (!dateB) return -1; // Cambiato da 1 a -1

  const parsedDateA = new Date(dateA).getTime();
  const parsedDateB = new Date(dateB).getTime();

  return parsedDateB - parsedDateA; // Cambiato l'ordine per invertire il confronto
}

/**
 * Formatta la data nel formato italiano
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Formatta il prezzo nel formato italiano
 */
export function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',') + ' €';
}

/**
 * Calcola i conteggi per stato, piattaforma e genere
 */
export function calculateCounts(games: Game[]): {
  statusCountsTemp: Record<string, number>;
  platformCountsTemp: Record<string, number>;
  genreCountsTemp: Record<string, number>;
} {
  const statusCountsTemp: Record<string, number> = {};
  const platformCountsTemp: Record<string, number> = {};
  const genreCountsTemp: Record<string, number> = {};

  games.forEach((game) => {
    // Conteggio per stato
    if (game.status) {
      statusCountsTemp[game.status] = (statusCountsTemp[game.status] || 0) + 1;
    }

    // Conteggio per piattaforma
    if (game.platform) {
      platformCountsTemp[game.platform] = (platformCountsTemp[game.platform] || 0) + 1;
    }

    // Conteggio per genere
    if (game.genres) {
      game.genres.forEach((genre) => {
        genreCountsTemp[genre] = (genreCountsTemp[genre] || 0) + 1;
      });
    }
  });

  return { statusCountsTemp, platformCountsTemp, genreCountsTemp };
}

/**
 * Calcola i valori massimi per prezzo e ore di gioco
 */
export function calculateMaxValues(games: Game[]): {
  maxPriceTemp: number;
  maxHoursTemp: number;
} {
  const maxPriceTemp = Math.max(...games.map((game) => game.price || 0));
  const maxHoursTemp = Math.max(...games.map((game) => game.hoursPlayed || 0));

  return { maxPriceTemp, maxHoursTemp };
}