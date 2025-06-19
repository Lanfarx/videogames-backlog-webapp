import axios from 'axios';
import { getToken } from '../../utils/getToken';
import { API_CONFIG, buildApiUrl } from '../../config/api';

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

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url?: string;
  img_logo_url?: string;
}

export interface SteamSyncResponse {
  message: string;
  count: number;
  debugInfo?: any; // Per informazioni di debug
}

export async function syncWithSteam(steamId: string, syncType: 'initial_load' | 'update_hours'): Promise<SteamSyncResponse> {
  const response = await apiClient.post(`${API_BASE_URL}/sync`, {
    steamId,
    syncType
  });

  return response.data;
}

export async function getSteamGames(steamId: string): Promise<{ games: SteamGame[] }> {
  const response = await apiClient.get(`${API_BASE_URL}/games/${steamId}`);
  return response.data;
}