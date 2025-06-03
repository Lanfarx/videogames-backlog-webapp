import axios from 'axios';
import { getToken } from '../../utils/getToken';

const API_URL = 'http://localhost:5097/api/profile';

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
