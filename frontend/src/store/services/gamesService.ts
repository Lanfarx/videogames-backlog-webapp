import axios from 'axios';
import { Game, GameInput, GameUpdateInput, GameComment } from '../../types/game';
import { getToken } from '../../utils/getToken';

const API_URL = 'http://localhost:5097/api/games';

// Istanza axios che aggiunge il token JWT se presente
const apiClient = axios.create();
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

function mapCommentFromApi(apiComment: any): GameComment {
  return {
    Id: apiComment.id || apiComment.Id,
    Date: apiComment.date || apiComment.Date,
    Text: apiComment.text || apiComment.Text
  };
}

function mapGameFromApi(apiGame: any): Game {
  return {
    id: apiGame.id,
    Title: apiGame.title,
    Platform: apiGame.platform,
    ReleaseYear: apiGame.releaseYear,
    Genres: apiGame.genres,
    Status: apiGame.status,
    CoverImage: apiGame.coverImage,
    Price: apiGame.price,
    PurchaseDate: apiGame.purchaseDate,
    Developer: apiGame.developer,
    Publisher: apiGame.publisher,
    CompletionDate: apiGame.completionDate,
    PlatinumDate: apiGame.platinumDate,
    HoursPlayed: apiGame.hoursPlayed,
    Metacritic: apiGame.metacritic,
    Rating: apiGame.rating,
    Notes: apiGame.notes,
    Review: apiGame.review ? {
      Text: apiGame.review.text,
      Gameplay: apiGame.review.gameplay,
      Graphics: apiGame.review.graphics,
      Story: apiGame.review.story,
      Sound: apiGame.review.sound,
      Date: apiGame.review.date,
      // Converte null a undefined per IsPublic
      IsPublic: apiGame.review.isPublic === null ? undefined : apiGame.review.isPublic
    } : undefined,
    Comments: Array.isArray(apiGame.comments)
      ? apiGame.comments.map(mapCommentFromApi)
      : undefined
  };
}

export const getAllGames = async (): Promise<Game[]> => {
  const res = await apiClient.get(API_URL);
  return res.data.map(mapGameFromApi);
};

export const getGameById = async (id: number): Promise<Game> => {
  const res = await apiClient.get<Game>(`${API_URL}/${id}`);
  return mapGameFromApi(res.data);
};

export const getGameByTitle = async (title: string): Promise<Game> => {
  // Codifica il titolo per gestire caratteri speciali negli URL
  const encodedTitle = encodeURIComponent(title);
  const res = await apiClient.get<Game>(`${API_URL}/by-title/${encodedTitle}`);
  return mapGameFromApi(res.data);
};

export const createGame = async (game: GameInput): Promise<Game> => {
  const res = await apiClient.post<Game>(API_URL, game );
  return mapGameFromApi(res.data);
};

export const updateGame = async (id: number, game: GameUpdateInput): Promise<Game> => {
  const res = await apiClient.patch<Game>(`${API_URL}/${id}`, game);
  return mapGameFromApi(res.data);
};

export const updateGameStatus = async (id: number, status: string): Promise<Game> => {
  const res = await apiClient.patch<Game>(`${API_URL}/${id}/status`, { status });
  return mapGameFromApi(res.data);
};

export const updateGamePlaytime = async (id: number, hoursPlayed: number): Promise<Game> => {
  const res = await apiClient.patch<Game>(`${API_URL}/${id}/playtime`, { hoursPlayed });
  return mapGameFromApi(res.data);
};

export const deleteGame = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_URL}/${id}`);
};

export const deleteAllGames = async (): Promise<{ deletedCount: number; message: string }> => {
  const res = await apiClient.delete(`${API_URL}/all`);
  return res.data;
};

// Commenti

export const getComments = async (GameId: number): Promise<GameComment[]> => {
  const res = await apiClient.get(`${API_URL}/${GameId}/Comments`);
  return Array.isArray(res.data) ? res.data.map(mapCommentFromApi) : [];
};

export const addComment = async (GameId: number, comment: GameComment): Promise<GameComment> => {
  const res = await apiClient.post(`${API_URL}/${GameId}/Comments`, comment);
  return mapCommentFromApi(res.data);
};

export const deleteComment = async (GameId: number, commentId: number): Promise<void> => {
  await apiClient.delete(`${API_URL}/${GameId}/Comments/${commentId}`);
};

export const updateComment = async (GameId: number, commentId: number, comment: GameComment): Promise<GameComment> => {
  const res = await apiClient.put(`${API_URL}/${GameId}/Comments/${commentId}`, comment);
  return mapCommentFromApi(res.data);
};

// Statistiche
export const getGameStats = async (): Promise<{
  total: number;
  inProgress: number;
  completed: number;
  notStarted: number;
  abandoned: number;
  platinum: number;
  totalHours: number;
}> => {
  const res = await apiClient.get(`${API_URL}/stats`);
  return {
    total: res.data.total,
    inProgress: res.data.inProgress,
    completed: res.data.completed,
    notStarted: res.data.notStarted,
    abandoned: res.data.abandoned,
    platinum: res.data.platinum,
    totalHours: res.data.totalHours
  };
};

// Giochi in corso paginati
export const getInProgressGamesPaginated = async (page: number = 1, pageSize: number = 6): Promise<{
  games: any[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}> => {
  const res = await apiClient.get(`${API_URL}/in-progress?page=${page}&pageSize=${pageSize}`);
  return {
    games: res.data.games,
    currentPage: res.data.currentPage,
    totalPages: res.data.totalPages,
    totalItems: res.data.totalItems,
    pageSize: res.data.pageSize,
    hasNextPage: res.data.hasNextPage,
    hasPreviousPage: res.data.hasPreviousPage
  };
};