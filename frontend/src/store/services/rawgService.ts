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
      ordering: '-metacritic',
      page_size: 20,
      platforms: '1,4,7,18,22', // Solo piattaforme principali
      dates: '1900-01-01,' + new Date().toISOString().slice(0, 10), // Solo giochi già usciti
    };
    // Se Metacritic fornito, filtra per range simile (+/- 10)
    if (typeof Metacritic === 'number') {
      params.metacritic = `${Math.max(0, Metacritic - 10)},${Math.min(100, Metacritic + 10)}`;
    }    const response = await apiClient.get('/games', { params });    const results = response.data.results
      .filter((g: any) => g.id !== excludeId)
      .slice(0, count);

    return results;
  } catch (error) {
    console.error('Errore nel recupero di giochi simili:', error);
    throw error;
  }
};

// Altre funzioni API possono essere aggiunte qui