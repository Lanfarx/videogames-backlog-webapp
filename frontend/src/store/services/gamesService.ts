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

export const getAllGames = async (): Promise<Game[]> => {
  const res = await apiClient.get<Game[]>(API_URL);
  return res.data;
};

export const getGameById = async (id: number): Promise<Game> => {
  const res = await apiClient.get<Game>(`${API_URL}/${id}`);
  return res.data;
};

export const createGame = async (game: GameInput): Promise<Game> => {
  const res = await apiClient.post<Game>(API_URL, {game} );
  return res.data;
};

export const updateGame = async (id: number, game: GameUpdateInput): Promise<Game> => {
  const res = await apiClient.put<Game>(`${API_URL}/${id}`, game);
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