import axios from 'axios';
import type { UserProfile } from '../../types/profile';
import { getToken } from '../../utils/getToken';
import { API_CONFIG, buildApiUrl } from '../../config/api';

const API_URL = buildApiUrl(API_CONFIG.ENDPOINTS.PROFILE);

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

export const getProfile = async (): Promise<UserProfile> => {
  const res = await apiClient.get<UserProfile>(API_URL);
  return res.data;
};

export const updateProfile = async (profile: Partial<UserProfile>): Promise<UserProfile> => {
  const res = await apiClient.put<UserProfile>(API_URL, profile);
  return res.data;
};
