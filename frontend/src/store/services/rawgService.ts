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

// Funzione per mappare i dati dell'API al formato interno arricchito
export const mapRawgGameToInternalFormat = (game: any) => {
  if (!game) return null;

  const id = game.id ?? game.Id;
  const title = game.title ?? game.Title ?? game.name ?? '';
  const description = game.description ?? game.Description ?? game.description_raw ?? "Nessuna descrizione disponibile.";
  const coverImage = game.coverImage ?? game.CoverImage ?? game.background_image ?? "/placeholder.svg";
  const developer = game.developer ?? game.Developer ?? game.developers?.[0]?.name ?? "Sconosciuto";
  const publisher = game.publisher ?? game.Publisher ?? game.publishers?.[0]?.name ?? "Sconosciuto";
  const releaseYear = game.releaseYear ?? game.ReleaseYear ?? (game.released ? new Date(game.released).getFullYear() : null);

  let genres: string[] = [];
  if (Array.isArray(game.genres)) {
    genres = game.genres.map((g: any) => typeof g === 'string' ? g : g.name);
  } else if (Array.isArray(game.Genres)) {
    genres = game.Genres.map((g: any) => typeof g === 'string' ? g : g.name);
  }

  const metacritic = typeof game.metacritic === 'number'
    ? game.metacritic
    : (typeof game.Metacritic === 'number' && game.Metacritic > 0 ? game.Metacritic : 0);

  const rating = typeof game.rating === 'number'
    ? game.rating
    : (typeof game.Rating === 'number' ? game.Rating : 0);

  let platforms: string[] = [];
  if (Array.isArray(game.platforms)) {
    platforms = game.platforms.map((p: any) => typeof p === 'string' ? p : p.platform?.name || p.name);
  } else if (Array.isArray(game.Platforms)) {
    platforms = game.Platforms.map((p: any) => typeof p === 'string' ? p : p.platform?.name || p.name);
  }

  const ratingsCount = typeof game.ratingsCount === 'number'
    ? game.ratingsCount
    : (typeof game.RatingsCount === 'number' ? game.RatingsCount : (typeof game.ratings_count === 'number' ? game.ratings_count : 0));

  return {
    id,
    Title: title,
    title,
    name: title,
    Description: description,
    description,
    description_raw: description,
    CoverImage: coverImage,
    coverImage,
    background_image: coverImage,
    Developer: developer,
    developer,
    Publisher: publisher,
    publisher,
    ReleaseYear: releaseYear,
    releaseYear,
    released: releaseYear ? `${releaseYear}-01-01` : null,
    Genres: genres,
    genres,
    Metacritic: metacritic,
    metacritic,
    Rating: rating,
    rating,
    Platforms: platforms,
    platforms,
    RatingsCount: ratingsCount,
    ratingsCount,
    ratings_count: ratingsCount,
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

    const rawResults = response.data?.results || [];
    const mappedResults = rawResults.map(mapRawgGameToInternalFormat);

    return {
      count: response.data?.count || 0,
      results: mappedResults
    };
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

    const rawResults = Array.isArray(response.data) ? response.data : [];
    return rawResults.map(mapRawgGameToInternalFormat);
  } catch (error) {
    console.error('Errore nel recupero di giochi simili:', error);
    throw error;
  }
};