import axios from 'axios';
import type { UserProfile } from '../../types/profile';

const API_URL = 'http://localhost:5097/api/profile'; // Aggiorna se necessario

export const getProfile = async (token: string): Promise<UserProfile> => {
  const res = await axios.get<UserProfile>(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const updateProfile = async (profile: Partial<UserProfile>, token: string): Promise<UserProfile> => {
  const res = await axios.put<UserProfile>(API_URL, profile, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
