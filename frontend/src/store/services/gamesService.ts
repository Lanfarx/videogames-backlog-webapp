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
    Review: apiGame.review,
    Comments: apiGame.comments,
  };
}

export const getAllGames = async (): Promise<Game[]> => {
  const res = await apiClient.get(API_URL);
  return res.data.map(mapGameFromApi);
};

export const getGameById = async (id: number): Promise<Game> => {
  const res = await apiClient.get<Game>(`${API_URL}/${id}`);
  return res.data;
};

export const getGameByTitle = async (title: string): Promise<Game> => {
  // Codifica il titolo per gestire caratteri speciali negli URL
  const encodedTitle = encodeURIComponent(title);
  const res = await apiClient.get<Game>(`${API_URL}/by-title/${encodedTitle}`);
  return mapGameFromApi(res.data);
};

export const createGame = async (game: GameInput): Promise<Game> => {
  const res = await apiClient.post<Game>(API_URL, game );
  return res.data;
};

export const updateGame = async (id: number, game: GameUpdateInput): Promise<Game> => {
  const res = await apiClient.patch<Game>(`${API_URL}/${id}`, game);
  return res.data;
};

export const updateGameStatus = async (id: number, status: string): Promise<Game> => {
  const res = await apiClient.patch<Game>(`${API_URL}/${id}/status`, { status });
  return res.data;
};

export const updateGamePlaytime = async (id: number, hoursPlayed: number): Promise<Game> => {
  const res = await apiClient.patch<Game>(`${API_URL}/${id}/playtime`, { hoursPlayed });
  return res.data;
};

export const deleteGame = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_URL}/${id}`);
};

// Commenti

export const getComments = async (gameId: number): Promise<GameComment[]> => {
  const res = await apiClient.get<GameComment[]>(`${API_URL}/${gameId}/Comments`);
  return res.data;
};

export const addComment = async (gameId: number, comment: GameComment): Promise<GameComment> => {
  const res = await apiClient.post<GameComment>(`${API_URL}/${gameId}/Comments`, comment);
  return res.data;
};

export const deleteComment = async (gameId: number, commentId: number): Promise<void> => {
  await apiClient.delete(`${API_URL}/${gameId}/Comments/${commentId}`);
};

export const updateComment = async (gameId: number, commentId: number, comment: GameComment): Promise<GameComment> => {
  const res = await apiClient.put<GameComment>(`${API_URL}/${gameId}/Comments/${commentId}`, comment);
  return res.data;
};