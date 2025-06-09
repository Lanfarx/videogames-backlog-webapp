import axios from 'axios';

// Base URL per le API RAWG
const BASE_URL = 'https://api.rawg.io/api';

// Crea un'istanza di axios configurata
const apiClient = axios.create({
  baseURL: BASE_URL,
  params: {
    key: process.env.REACT_APP_RAWG_API_KEY
  }
});

// Funzione per mappare i dati dell'API RAWG al formato interno
export const mapRawgGameToInternalFormat = (rawgGame: any) => {
  return {
    id: rawgGame.id,
    Title: rawgGame.name,
    Description: rawgGame.description_raw || rawgGame.description || "Nessuna descrizione disponibile.",
    CoverImage: rawgGame.background_image || "/placeholder.svg",
    Developer: rawgGame.developers?.[0]?.name || "Sconosciuto",
    Publisher: rawgGame.publishers?.[0]?.name || "Sconosciuto",
    ReleaseYear: rawgGame.released ? new Date(rawgGame.released).getFullYear() : null,
    Genres: rawgGame.genres?.map((g: any) => g.name) || [],
    Metacritic: (rawgGame.metacritic && typeof rawgGame.metacritic === 'number' && rawgGame.metacritic > 0) ? rawgGame.metacritic : 0,
    Rating: rawgGame.rating || 0,
    Platforms: rawgGame.platforms?.map((p: any) => p.platform.name) || [],
    RatingsCount: rawgGame.ratings_count || 0,
  };
};

// Funzione per ottenere i giochi
export const getGames = async (params = {}) => {
  try {
    const response = await apiClient.get('/games', { params });
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei giochi:', error);
    throw error;
  }
};

// Funzione per ottenere i dettagli di un gioco specifico
export const getGameDetails = async (gameId: string) => {
  try {
    const response = await apiClient.get(`/games/${gameId}`);
    return mapRawgGameToInternalFormat(response.data);
  } catch (error) {
    console.error(`Errore nel recupero dei dettagli del gioco ${gameId}:`, error);
    throw error;
  }
};

// Funzione per cercare giochi
export const searchGames = async (query: string) => {
  try {
    const response = await apiClient.get('/games', { 
      params: { 
        search: query,
        platforms: '1,4,7,18,22' // Corretto il nome del parametro
      }
    });
    
    // Mappa i risultati usando la funzione di mapping
    const mappedResults = response.data.results.map(mapRawgGameToInternalFormat);
    
    // Filtra i risultati per includere solo giochi con dati sufficienti
    const filteredResults = mappedResults.filter((game: any) => 
      game.Title && 
      game.ReleaseYear && 
      game.RatingsCount > 3 // Almeno 3 recensioni per validità
    );
    
    return {
      ...response.data,
      results: filteredResults
    };
  } catch (error) {
    console.error('Errore nella ricerca dei giochi:', error);
    throw error;
  }
};

// Funzione per ottenere i giochi con paginazione
export const getPaginatedGames = async (page = 1, pageSize = 20, extraParams = {}) => {
  try {
    const response = await apiClient.get('/games', {
      params: {
        page,
        page_size: pageSize,
        ...extraParams
      }
    });
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei giochi paginati:', error);
    throw error;
  }
};

export const getSimilarGames = async (genreIds: number[], excludeId: number, count: number = 4, Metacritic?: number) => {
  try {
    const params: any = {
      genres: genreIds.join(','),
      exclude_additions: true,
      ordering: '-rating,-metacritic,-released', // Ordina per rating, poi Metacritic, poi data
      page_size: Math.min(40, count * 3), // Ottieni più risultati per filtrare meglio
      platforms: '1,4,7,18,22,186,187', // Aggiunte console moderne
      dates: '2000-01-01,' + new Date().toISOString().slice(0, 10), // Giochi dal 2000 in poi
    };
    
    // Filtro Metacritic più intelligente
    if (typeof Metacritic === 'number' && Metacritic > 0) {
      // Range dinamico basato sul punteggio
      const range = Metacritic > 80 ? 15 : Metacritic > 60 ? 20 : 25;
      params.metacritic = `${Math.max(0, Metacritic - range)},${Math.min(100, Metacritic + range)}`;
    } else {
      // Se non c'è Metacritic, filtra per giochi decenti
      params.metacritic = '60,100';
    }

    const response = await apiClient.get('/games', { params });
    
    // Filtro e ordinamento più sofisticato
    const results = response.data.results
      .filter((g: any) => 
        g.id !== excludeId &&
        g.name &&
        g.background_image &&
        g.released &&
        g.rating >= 3.5 && // Rating minimo più alto
        g.ratings_count >= 10 && // Più recensioni per affidabilità
        !g.name.toLowerCase().includes('dlc') &&
        !g.name.toLowerCase().includes('expansion') &&
        !g.name.toLowerCase().includes('season pass')
      )
      // Ordinamento personalizzato per rilevanza
      .sort((a: any, b: any) => {
        // Calcola score di similarità
        const scoreA = calculateSimilarityScore(a, Metacritic);
        const scoreB = calculateSimilarityScore(b, Metacritic);
        return scoreB - scoreA;
      })
      .slice(0, count);

    return results;
  } catch (error) {
    console.error('Errore nel recupero di giochi simili:', error);
    throw error;
  }
};

// Funzione helper per calcolare score di similarità
const calculateSimilarityScore = (game: any, originalMetacritic?: number): number => {
  let score = 0;
  
  // Base score dal rating
  score += game.rating * 10;
  
  // Bonus per numero di recensioni (logaritmico per evitare bias)
  score += Math.log10(game.ratings_count + 1) * 5;
  
  // Bonus per Metacritic se simile al gioco originale
  if (originalMetacritic && game.metacritic) {
    const metacriticDiff = Math.abs(game.metacritic - originalMetacritic);
    score += Math.max(0, 20 - metacriticDiff);
  } else if (game.metacritic) {
    score += game.metacritic * 0.2;
  }
  
  // Penalità per giochi troppo vecchi o troppo nuovi
  if (game.released) {
    const year = new Date(game.released).getFullYear();
    const currentYear = new Date().getFullYear();
    const yearDiff = Math.abs(currentYear - year);
    
    if (yearDiff <= 3) score += 10; // Bonus per giochi recenti
    else if (yearDiff > 10) score -= 5; // Penalità per giochi molto vecchi
  }
  
  return score;
};

// Altre funzioni API possono essere aggiunte qui