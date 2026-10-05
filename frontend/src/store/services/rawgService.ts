import axios from 'axios';
import { API_CONFIG, buildApiUrl } from '../../config/api';
import { getToken } from '../../utils/getToken';

// Base URL verso il backend per il catalogo giochi
const API_URL = buildApiUrl(API_CONFIG.ENDPOINTS.CATALOG);

// Istanza axios configurata con intercettore per token JWT
const apiClient = axios.create();

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Funzione per mappare i dati dell'API al formato interno
export const mapRawgGameToInternalFormat = (game: any) => {
  if (!game) return null;

  return {
    id: game.id,
    Title: game.Title || game.name || game.title || '',
    Description: game.Description || game.description_raw || game.description || "Nessuna descrizione disponibile.",
    CoverImage: game.CoverImage || game.background_image || game.coverImage || "/placeholder.svg",
    Developer: game.Developer || game.developers?.[0]?.name || game.developer || "Sconosciuto",
    Publisher: game.Publisher || game.publishers?.[0]?.name || game.publisher || "Sconosciuto",
    ReleaseYear: game.ReleaseYear ?? (game.releaseYear ?? (game.released ? new Date(game.released).getFullYear() : null)),
    Genres: Array.isArray(game.Genres)
      ? game.Genres
      : (Array.isArray(game.genres) ? game.genres.map((g: any) => typeof g === 'string' ? g : g.name) : []),
    Metacritic: typeof game.Metacritic === 'number'
      ? game.Metacritic
      : (typeof game.metacritic === 'number' && game.metacritic > 0 ? game.metacritic : 0),
    Rating: game.Rating || game.rating || 0,
    Platforms: Array.isArray(game.Platforms)
      ? game.Platforms
      : (Array.isArray(game.platforms) ? game.platforms.map((p: any) => typeof p === 'string' ? p : p.platform?.name || p.name) : []),
    RatingsCount: game.RatingsCount || game.ratings_count || 0,
  };
};

// Funzione per ottenere i dettagli di un gioco specifico
export const getGameDetails = async (gameId: string) => {
  try {
    const response = await apiClient.get(`${API_URL}/games/${encodeURIComponent(gameId)}`);
    return mapRawgGameToInternalFormat(response.data);
  } catch (error) {
    console.error(`Errore nel recupero dei dettagli del gioco ${gameId}:`, error);
    throw error;
  }
};

// Funzione per cercare giochi
export const searchGames = async (query: string) => {
  try {
    const response = await apiClient.get(`${API_URL}/search`, {
      params: {
        query
      }
    });

    const rawResults = response.data?.results || [];
    const mappedResults = rawResults.map(mapRawgGameToInternalFormat);

    const filteredResults = mappedResults.filter((game: any) =>
      game && game.Title
    );

    return {
      count: response.data?.count || filteredResults.length,
      results: filteredResults
    };
  } catch (error) {
    console.error('Errore nella ricerca dei giochi:', error);
    throw error;
  }
};

// Funzione per ottenere i giochi con paginazione dal catalogo
export const getPaginatedGames = async (page = 1, pageSize = 20, extraParams: any = {}) => {
  try {
    const response = await apiClient.get(`${API_URL}/games`, {
      params: {
        page,
        pageSize,
        search: extraParams.search || undefined,
        ordering: extraParams.ordering || undefined,
        platforms: extraParams.platforms || undefined
      }
    });
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei giochi paginati:', error);
    throw error;
  }
};

// Funzione per ottenere giochi simili
export const getSimilarGames = async (genreIds: number[], excludeId: number, count: number = 4, Metacritic?: number) => {
  try {
    const response = await apiClient.get(`${API_URL}/similar`, {
      params: {
        genres: Array.isArray(genreIds) ? genreIds.join(',') : genreIds,
        excludeId,
        count,
        metacritic: Metacritic
      }
    });

    return response.data || [];
  } catch (error) {
    console.error('Errore nel recupero di giochi simili:', error);
    throw error;
  }
};