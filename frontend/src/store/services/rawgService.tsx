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
    return response.data;
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
      platforms: '1, 4, 7, 18, 22'
    }
});
    return response.data;
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

export const getSimilarGames = async (genreIds: number[], excludeId: number, count: number = 4, metacritic?: number) => {
  try {
    const params: any = {
      genres: genreIds.join(','),
      exclude_additions: true,
      ordering: '-rating',
      page_size: 20,
      platforms: '1,4,7,18,22', // Solo piattaforme principali
      dates: '1900-01-01,' + new Date().toISOString().slice(0, 10), // Solo giochi già usciti
    };
    // Se metacritic fornito, filtra per range simile (+/- 10)
    if (typeof metacritic === 'number') {
      params.metacritic = `${Math.max(0, metacritic - 10)},${Math.min(100, metacritic + 10)}`;
    }
    const response = await apiClient.get('/games', { params });

    const results = response.data.results
      .filter((g: any) => g.id !== excludeId)
      .slice(0, count);

    return results;
  } catch (error) {
    console.error('Errore nel recupero di giochi simili:', error);
    throw error;
  }
};

// Altre funzioni API possono essere aggiunte qui