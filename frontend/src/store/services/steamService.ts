import axios from 'axios';
import { getToken } from '../../utils/getToken';
import { API_CONFIG, buildApiUrl } from '../../config/api';
import type { GameStatus } from '../../types/game';

const API_BASE_URL = buildApiUrl(API_CONFIG.ENDPOINTS.STEAM);

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

export interface UpdatedGameInfo {
  gameTitle: string;
  previousHours: number;
  newHours: number;
  hoursAdded: number;
  statusChanged: boolean;
  previousStatus?: string;
  newStatus?: string;
}

export interface SteamSyncResponse {
  message: string;
  count: number;
  updatedGames: UpdatedGameInfo[];
  pendingCount: number;
  warning?: string | null;
}

export interface SteamCandidate {
  appId: number;
  name: string;
  coverImage: string;
  hoursPlayed: number;
  lastPlayedAt: string | null;
  suggestedStatus: GameStatus;
}

// Aggiorna ore, stati e achievement dei giochi Steam già in libreria (lo Steam ID è quello del profilo)
export async function syncWithSteam(): Promise<SteamSyncResponse> {
  const response = await apiClient.post(`${API_BASE_URL}/sync`);
  return response.data;
}

// Giochi posseduti su Steam non in libreria; con ignored = true quelli ignorati
export async function getSteamCandidates(ignored: boolean): Promise<SteamCandidate[]> {
  const response = await apiClient.get(`${API_BASE_URL}/candidates`, { params: { ignored } });
  return response.data;
}

export async function importSteamGames(items: { appId: number; status: GameStatus }[]): Promise<number> {
  const response = await apiClient.post(`${API_BASE_URL}/import`, items);
  return response.data.count;
}

export async function setSteamGamesIgnored(appIds: number[], ignored: boolean): Promise<void> {
  await apiClient.post(`${API_BASE_URL}/${ignored ? 'ignore' : 'restore'}`, appIds);
}
