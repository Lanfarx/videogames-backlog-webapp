import axios from 'axios';
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

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiClient.post(
    `${API_URL}/ChangePassword`,
    { currentPassword, newPassword }
  );
}
